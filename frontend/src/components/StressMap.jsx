import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { MapContainer, TileLayer, CircleMarker, Popup, LayerGroup, useMap } from 'react-leaflet';
import { aqiColor, tempColor, crowdColor, noiseColor } from '../utils/mapColors.js';

function HeatmapLayer({ locations }) {
  const map = useMap();
  useEffect(() => {
    if (!locations?.length) return;
    const heatData = locations.map((loc) => [
      loc.latitude,
      loc.longitude,
      (loc.stressScore || 0) / 100, // stress normalized to 0-1
    ]);

    const heat = L.heatLayer(heatData, {
      radius: 35,
      blur: 20,
      maxZoom: 14,
      minOpacity: 0.3,
      gradient: {
        0.2: '#0284c7', // Sky Blue
        0.4: '#10b981', // Emerald
        0.6: '#facc15', // Yellow
        0.8: '#f97316', // Orange
        1.0: '#e11d48'  // Rose Red
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [locations, map]);
  return null;
}

function FitBounds({ locations }) {
  const map = useMap();
  useEffect(() => {
    if (!locations?.length) return;
    const pts = locations.map((l) => [l.latitude, l.longitude]);
    if (pts.length === 1) {
      map.setView(pts[0], 11);
      return;
    }
    const b = L.latLngBounds(pts);
    map.fitBounds(b, { padding: [48, 48], maxZoom: 11 });
  }, [locations, map]);
  return null;
}

function PopupBody({ loc, onSave, token, savedIds, prediction }) {
  const saved = savedIds?.has(loc.id || loc._id);
  return (
    <div className="min-w-[200px] space-y-2 p-1 text-sm">
      <p className="font-display font-semibold text-slate-900 dark:text-white">{loc.name}</p>
      <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-slate-700 dark:text-slate-300">
        <dt className="text-slate-500 dark:text-slate-400">AQI</dt>
        <dd className="text-slate-800 dark:text-slate-200 font-medium">{loc.aqi}</dd>
        <dt className="text-slate-500 dark:text-slate-400">Temp °C</dt>
        <dd className="text-slate-800 dark:text-slate-200 font-medium">{loc.temperature}</dd>
        <dt className="text-slate-500 dark:text-slate-400">Crowd</dt>
        <dd className="text-slate-800 dark:text-slate-200 font-medium">{loc.crowdDensity}%</dd>
        <dt className="text-slate-500 dark:text-slate-400">Noise</dt>
        <dd className="text-slate-800 dark:text-slate-200 font-medium">{loc.noiseLevel || 0} dB</dd>
        <dt className="text-slate-500 dark:text-slate-400">Stress</dt>
        <dd className="font-semibold" style={{ color: loc.stressColor }}>
          {loc.stressScore} ({loc.stressLevel})
        </dd>
      </dl>
      {prediction?.predictedStress != null && (
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Predicted (1h):{' '}
          <span className="font-medium text-indigo-600 dark:text-indigo-400">{prediction.predictedStress}</span>
        </p>
      )}
      {token && onSave && (
        <button
          type="button"
          onClick={() => onSave(loc)}
          className="mt-2 w-full rounded-lg bg-accent py-1.5 text-xs font-semibold text-white hover:bg-accent-dim"
        >
          {saved ? 'Already saved' : 'Save to my list'}
        </button>
      )}
    </div>
  );
}

export default function StressMap({
  locations,
  layers,
  token,
  onSaveLocation,
  savedIds,
  predictions,
}) {
  const [viewMode, setViewMode] = useState('points');
  const [mapStyle, setMapStyle] = useState('dark');
  const center = [19.076, 72.8777];

  const mapStyles = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  };

  if (!locations?.length) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 sm:h-[520px]">
        No location data loaded.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex justify-end gap-2">
        <div className="flex bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 transition-colors">
          {Object.keys(mapStyles).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setMapStyle(style)}
              className={`rounded px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                mapStyle === style ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setViewMode('points')}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors border ${
            viewMode === 'points' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Show Points
        </button>
        <button
          type="button"
          onClick={() => setViewMode('heatmap')}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors border ${
            viewMode === 'heatmap' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Show Heatmap
        </button>
      </div>

      <div className="h-[420px] w-full rounded-2xl border border-slate-200 dark:border-slate-700 sm:h-[520px] overflow-hidden transition-colors">
        <MapContainer
          center={center}
          zoom={8}
          className="h-full w-full bg-slate-100 dark:bg-slate-900"
          scrollWheelZoom
        >
          <TileLayer
            attribution={mapStyle === 'satellite' ? 'Esri &copy; OpenStreetMap' : '&copy; OSM'}
            url={mapStyles[mapStyle]}
          />
          <FitBounds locations={locations} />

          {viewMode === 'heatmap' && <HeatmapLayer locations={locations} />}

          {viewMode === 'points' && (
            <>
              {layers.aqi && (
          <LayerGroup>
          {locations.map((loc) => (
            <CircleMarker
              key={`aqi-${loc.id || loc._id}`}
              center={[loc.latitude, loc.longitude]}
              radius={10 + loc.aqi / 25}
              pathOptions={{
                color: '#94a3b8',
                weight: 1,
                fillColor: aqiColor(loc.aqi),
                fillOpacity: 0.45,
              }}
            >
              <Popup>
                <PopupBody
                  loc={loc}
                  onSave={onSaveLocation}
                  token={token}
                  savedIds={savedIds}
                  prediction={predictions?.[loc.id || loc._id]}
                />
              </Popup>
            </CircleMarker>
          ))}
        </LayerGroup>
      )}

      {layers.temperature && (
        <LayerGroup>
          {locations.map((loc) => (
            <CircleMarker
              key={`t-${loc.id || loc._id}`}
              center={[loc.latitude, loc.longitude]}
              radius={12}
              pathOptions={{
                color: '#64748b',
                weight: 1,
                fillColor: tempColor(loc.temperature),
                fillOpacity: layers.aqi ? 0.25 : 0.5,
              }}
            >
              <Popup>
                <PopupBody
                  loc={loc}
                  onSave={onSaveLocation}
                  token={token}
                  savedIds={savedIds}
                  prediction={predictions?.[loc.id || loc._id]}
                />
              </Popup>
            </CircleMarker>
          ))}
        </LayerGroup>
      )}

      {layers.crowd && (
        <LayerGroup>
          {locations.map((loc) => (
            <CircleMarker
              key={`c-${loc.id || loc._id}`}
              center={[loc.latitude, loc.longitude]}
              radius={8 + loc.crowdDensity / 8}
              pathOptions={{
                color: '#cbd5e1',
                weight: 1,
                fillColor: crowdColor(loc.crowdDensity),
                fillOpacity: 0.4,
              }}
            >
              <Popup>
                <PopupBody
                  loc={loc}
                  onSave={onSaveLocation}
                  token={token}
                  savedIds={savedIds}
                  prediction={predictions?.[loc.id || loc._id]}
                />
              </Popup>
            </CircleMarker>
          ))}
        </LayerGroup>
      )}

      {layers.stress && (
        <LayerGroup>
          {locations.map((loc) => (
            <CircleMarker
              key={`s-${loc.id || loc._id}`}
              center={[loc.latitude, loc.longitude]}
              radius={14}
              pathOptions={{
                color: '#0f172a',
                weight: 2,
                fillColor: loc.stressColor || '#64748b',
                fillOpacity: 0.85,
              }}
            >
              <Popup>
                <PopupBody
                  loc={loc}
                  onSave={onSaveLocation}
                  token={token}
                  savedIds={savedIds}
                  prediction={predictions?.[loc.id || loc._id]}
                />
              </Popup>
            </CircleMarker>
          ))}
        </LayerGroup>
      )}

      {layers.noise && (
        <LayerGroup>
          {locations.map((loc) => (
            <CircleMarker
              key={`n-${loc.id || loc._id}`}
              center={[loc.latitude, loc.longitude]}
              radius={10 + (loc.noiseLevel || 0) / 10}
              pathOptions={{
                color: '#1e293b',
                weight: 1,
                fillColor: noiseColor(loc.noiseLevel || 0),
                fillOpacity: 0.5,
              }}
            >
              <Popup>
                <PopupBody
                  loc={loc}
                  onSave={onSaveLocation}
                  token={token}
                  savedIds={savedIds}
                  prediction={predictions?.[loc.id || loc._id]}
                />
              </Popup>
            </CircleMarker>
          ))}
        </LayerGroup>
      )}
          </>
        )}
      </MapContainer>
      </div>
    </div>
  );
}
