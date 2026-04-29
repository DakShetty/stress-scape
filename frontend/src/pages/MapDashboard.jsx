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
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl transition-colors">StressScape Dashboard</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400 transition-colors">
            Combined AQI, heat stress, and crowding — aligned with MPCB-style AQI bands and field-style
            crowd observations. Toggle layers and click markers for details.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100 transition-colors shadow-sm">
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} className="accent-indigo-600" />
            Auto-refresh (30s)
          </label>
          <button
            type="button"
            onClick={load}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition-all duration-300 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 hover:scale-105 active:scale-95 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400 dark:hover:border-indigo-500/50"
          >
            ↻ Refresh
          </button>
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={runSimulate}
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-600 transition-all duration-300 hover:bg-amber-100 hover:scale-105 active:scale-95 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
              >
                ⚡ Simulate
              </button>
              <button
                type="button"
                onClick={runSyncManual}
                className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold text-teal-700 transition-all duration-300 hover:bg-teal-100 hover:scale-105 active:scale-95 shadow-sm dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20"
              >
                🔗 Sync Live
              </button>
            </>
          )}
          <button
            type="button"
            onClick={tryWeather}
            className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 transition-all duration-300 hover:bg-indigo-100 hover:scale-105 active:scale-95 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
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
        <div className="mt-4 flex items-center gap-6 rounded-2xl border border-slate-200/60 bg-white/70 dark:border-slate-700/60 dark:bg-slate-800/80 p-6 shadow-soft backdrop-blur-xl animate-slide-up transition-colors">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-4xl shadow-inner border border-indigo-100 dark:bg-slate-900/50 dark:border-slate-700">
            {weatherNote.description.includes('cloud') ? '☁️' : 
             weatherNote.description.includes('rain') ? '🌧️' : 
             weatherNote.description.includes('haze') || weatherNote.description.includes('smoke') ? '🌫️' : '☀️'}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">Live Environment</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-bold text-slate-800 dark:text-slate-100">{weatherNote.temperature}°C</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Feels like {weatherNote.feelsLike}°C</span>
            </div>
            <p className="mt-0.5 text-sm font-medium text-slate-600 dark:text-slate-300 capitalize flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               {weatherNote.description}
            </p>
          </div>
          <div className="hidden sm:block border-l border-slate-200 dark:border-slate-700 pl-6 text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Humidity</p>
            <p className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">{weatherNote.humidity}<span className="text-xs text-slate-400 ml-0.5">%</span></p>
          </div>
        </div>
      ) : weatherNote && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 italic flex items-center gap-2 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          <span className="text-indigo-600 dark:text-indigo-400">ℹ️</span> {weatherNote}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6 xl:flex-row">
        <div className="flex-1 space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="card-glass p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Layers</p>
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
                  className={`group flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    key === 'stress'
                      ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50 shadow-sm'
                      : key === 'noise'
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 shadow-sm'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={layers[key]}
                    onChange={() => toggle(key)}
                    className="accent-indigo-600"
                  />
                  {label}
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Green / yellow / red on the stress layer: low / medium / high composite stress.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-soft dark:shadow-none border border-slate-200 dark:border-slate-700">
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

          {/* NEW FEATURE: Alerts Feed */}
          <div className="rounded-2xl border border-rose-200/60 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-900/10 backdrop-blur-xl shadow-soft dark:shadow-none overflow-hidden p-4 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-rose-700 dark:text-rose-400">Live Stress Alerts</h3>
            </div>
            <div className="space-y-2">
              {locations.filter(loc => loc.stressScore > 75 || loc.aqi > 150).length > 0 ? (
                locations
                  .filter(loc => loc.stressScore > 75 || loc.aqi > 150)
                  .sort((a, b) => b.stressScore - a.stressScore)
                  .slice(0, 4)
                  .map(loc => (
                    <div key={loc.id || loc._id} className="rounded-xl bg-white dark:bg-slate-800 border border-rose-100 dark:border-rose-900/50 p-3 shadow-sm transition-colors">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate mb-1">{loc.name}</p>
                      <p className="text-[10px] font-medium text-rose-600 dark:text-rose-400">
                        {loc.stressScore > 75 ? `High Stress (${Math.round(loc.stressScore)})` : `Poor AQI (${Math.round(loc.aqi)})`}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic p-2">No critical alerts right now. City conditions are normal.</p>
              )}
            </div>
          </div>
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
