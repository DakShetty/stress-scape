import { useCallback, useEffect, useMemo, useState } from 'react';
import * as api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import StressMap from '../components/StressMap.jsx';
import SmartAdvisor from '../components/SmartAdvisor.jsx';
import OnboardingModal from '../components/OnboardingModal.jsx';
import SavedGallery from '../components/SavedGallery.jsx';

const defaultLayers = { aqi: true, temperature: true, crowd: true, stress: true, noise: false };

export default function MapDashboard() {
  const { token, user, isAdmin, updatePrefs, refreshUser } = useAuth();
  const [locations, setLocations] = useState([]);
  const [layers, setLayers] = useState(defaultLayers);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [predictions, setPredictions] = useState({});
  const [weatherNote, setWeatherNote] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await api.get('/api/locations', token);
      setLocations(data.locations || []);
    } catch (e) {
      setError(e.message || 'Failed to load locations');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const p = user?.preferences?.defaultLayers;
    if (p) setLayers((prev) => ({ ...prev, ...p }));
  }, [user?.preferences?.defaultLayers]);

  useEffect(() => {
    if (!live) return undefined;
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [live, load]);

  const savedIds = useMemo(() => {
    const ids = user?.savedLocations?.map((s) => s.id || s._id || s) || [];
    return new Set(ids.map(String));
  }, [user]);

  const toggle = (key) => {
    setLayers((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const anyOn = next.aqi || next.temperature || next.crowd || next.stress || next.noise;
      if (!anyOn) return prev;
      if (token) updatePrefs(next).catch(() => {});
      return next;
    });
  };

  async function runSimulate() {
    try {
      await api.post('/api/locations/simulate-drift', {}, token);
      await load();
      setSuccessMsg('✅ Real-time data drift applied! Map updated.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setError(e.message || 'Simulation failed');
    }
  }

  async function runSyncManual() {
    setLoading(true); // Show global loading as this takes time
    try {
      setSuccessMsg('📡 Connecting to Global Sensors (WAQI & TomTom)...');
      await api.post('/api/locations/sync-live', {}, token);
      await load();
      setSuccessMsg('🌐 Map synchronized with real-time API data!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) {
      setError(e.message || 'Synchronization failed. Check API keys.');
    } finally {
      setLoading(false);
    }
  }

  async function saveLocation(loc) {
    const id = loc.id || loc._id;
    try {
      await api.post('/api/locations/saved', { locationId: id }, token);
      await refreshUser();
      setSuccessMsg('📍 Location added to your favorites!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setError(e.message || 'Could not save location');
    }
  }

  async function removeSavedLocation(id) {
    try {
      await api.del(`/api/locations/saved/${id}`, token);
      await refreshUser();
      setSuccessMsg('🗑️ Location removed from your favorites.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setError(e.message || 'Could not remove location');
    }
  }

  useEffect(() => {
    if (!locations.length) return;
    const slice = locations.slice(0, 8);
    slice.forEach(async (loc) => {
      const id = loc.id || loc._id;
      try {
        const data = await api.get(`/api/predict/location/${id}`);
        setPredictions((p) => ({ ...p, [id]: data }));
      } catch {
        /* prediction optional */
      }
    });
  }, [locations]);

  async function tryWeather() {
    const first = locations[0];
    if (!first) return;
    try {
      const w = await api.get(
        `/api/weather/point?lat=${first.latitude}&lon=${first.longitude}`,
        token
      );
      setWeatherNote(w.available ? w.data : w.message);
    } catch (e) {
      setWeatherNote(e.message);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-mist/60">Loading map data…</div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between animate-slide-up">
        <div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">StressScape Dashboard</h1>
          <p className="mt-1 max-w-2xl text-sm text-mist/70">
            Combined AQI, heat stress, and crowding — aligned with MPCB-style AQI bands and field-style
            crowd observations. Toggle layers and click markers for details.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-ink-900 px-3 py-2 text-xs text-mist/70 hover:text-mist transition-colors">
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
            Auto-refresh (30s)
          </label>
          <button
            type="button"
            onClick={load}
            className="rounded-xl border border-white/10 bg-ink-900 px-4 py-2 text-xs font-semibold text-mist/70 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-105 active:scale-95"
          >
            ↻ Refresh
          </button>
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={runSimulate}
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 transition-all duration-300 hover:bg-amber-500/15 hover:shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:scale-105 active:scale-95"
              >
                ⚡ Simulate
              </button>
              <button
                type="button"
                onClick={runSyncManual}
                className="rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2 text-xs font-semibold text-cyan-glow transition-all duration-300 hover:bg-cyan/15 hover:shadow-glow-cyan hover:scale-105 active:scale-95"
              >
                🔗 Sync Live
              </button>
            </>
          )}
          <button
            type="button"
            onClick={tryWeather}
            className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent-glow transition-all duration-300 hover:bg-accent/15 hover:shadow-glow-violet hover:scale-105 active:scale-95"
          >
            🌤 Weather
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 animate-fade-in">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          {successMsg}
        </div>
      )}

      {weatherNote && typeof weatherNote === 'object' ? (
        <div className="mt-4 flex items-center gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-ink-900 to-ink-950 p-6 shadow-xl animate-slide-up ring-1 ring-white/5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-4xl shadow-inner shadow-white/5">
            {weatherNote.description.includes('cloud') ? '☁️' : 
             weatherNote.description.includes('rain') ? '🌧️' : 
             weatherNote.description.includes('haze') || weatherNote.description.includes('smoke') ? '🌫️' : '☀️'}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Live Environment</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-bold text-white">{weatherNote.temperature}°C</span>
              <span className="text-xs text-mist/60 font-medium">Feels like {weatherNote.feelsLike}°C</span>
            </div>
            <p className="mt-0.5 text-sm font-medium text-mist/80 capitalize flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               {weatherNote.description}
            </p>
          </div>
          <div className="hidden sm:block border-l border-white/10 pl-6 text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-mist/30 mb-1">Humidity</p>
            <p className="text-2xl font-display font-bold text-white">{weatherNote.humidity}<span className="text-xs text-mist/40 ml-0.5">%</span></p>
          </div>
        </div>
      ) : weatherNote && (
        <div className="mt-4 rounded-xl border border-white/10 bg-ink-900 p-4 text-xs text-mist/60 italic flex items-center gap-2">
          <span className="text-accent">ℹ️</span> {weatherNote}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6 xl:flex-row">
        <div className="flex-1 space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="rounded-2xl border border-white/10 bg-ink-900/40 backdrop-blur-xl p-4 shadow-lg shadow-black/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-mist/50">Layers</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {[
                ['aqi', 'AQI'],
                ['temperature', 'Temperature'],
                ['crowd', 'Crowd Density'],
                ['noise', 'Noise Level'],
                ['stress', 'Stress Score'],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className={`group flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
                    key === 'stress'
                      ? 'border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/40'
                      : key === 'noise'
                      ? 'border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/40'
                      : 'border-white/10 bg-ink-950/80 hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={layers[key]}
                    onChange={() => toggle(key)}
                  />
                  {label}
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-mist/50">
              Green / yellow / red on the stress layer: low / medium / high composite stress.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-accent/5 ring-1 ring-white/10">
            <StressMap
              locations={locations}
              layers={layers}
              token={token}
              onSaveLocation={token ? saveLocation : null}
              savedIds={savedIds}
              predictions={predictions}
            />
          </div>
        </div>
        <aside className="w-full shrink-0 space-y-4 xl:w-80 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <SmartAdvisor locations={locations} />
        </aside>
      </div>

      {token && user && (
        <div className="mt-8">
           <SavedGallery 
             savedLocations={user.savedLocations} 
             onRemove={removeSavedLocation} 
           />
        </div>
      )}

      <OnboardingModal />
    </div>
  );
}
