import React from 'react';

export default function SavedGallery({ savedLocations, onRemove }) {
  if (!savedLocations || savedLocations.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 text-mist/30">
          📍
        </div>
        <h3 className="mt-4 text-sm font-semibold text-white">No saved spots yet</h3>
        <p className="mt-1 text-xs text-mist/50">Save locations from the map to track them here in your personal gallery.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <span className="text-accent">★</span>
          Your Saved Urban Spots
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-widest text-mist/40">
          {savedLocations.length} locations
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {savedLocations.map((loc) => {
          const id = loc.id || loc._id;
          return (
            <div 
              key={id}
              className="group relative flex flex-col rounded-2xl border border-white/5 bg-ink-900/40 p-4 transition-all duration-300 hover:border-white/20 hover:bg-ink-900/60 hover:shadow-xl hover:shadow-black/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 overflow-hidden">
                  <h3 className="truncate text-sm font-bold text-white group-hover:text-accent transition-colors">
                    {loc.name}
                  </h3>
                  <p className="text-[10px] text-mist/50 capitalize">{loc.areaTag || 'Urban Area'}</p>
                </div>
                <button
                  onClick={() => onRemove(id)}
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-ink-950 text-mist/40 transition-all hover:bg-red-500/20 hover:text-red-400"
                  title="Remove from favorites"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {/* Stress Level Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-mist/40">Current Stress</span>
                  <div className="flex items-center gap-2">
                     <span className={`h-1.5 w-1.5 rounded-full`} style={{ backgroundColor: loc.stressColor || '#ccc' }}></span>
                     <span className="text-xs font-bold text-white">{Math.round(loc.stressScore || 0)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 w-full overflow-hidden rounded-full bg-ink-950">
                  <div 
                    className="h-full transition-all duration-1000" 
                    style={{ 
                      width: `${loc.stressScore || 0}%`,
                      backgroundColor: loc.stressColor || '#666'
                    }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                   <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] uppercase tracking-tighter text-mist/30">AQI</span>
                      <span className="text-xs font-bold text-mist">{loc.aqi}</span>
                   </div>
                   <div className="flex flex-col items-center gap-0.5 border-l border-white/5 px-4">
                      <span className="text-[9px] uppercase tracking-tighter text-mist/30">Temp</span>
                      <span className="text-xs font-bold text-mist">{loc.temperature}°C</span>
                   </div>
                   <div className="flex flex-col items-center gap-0.5 border-l border-white/5 pl-4">
                      <span className="text-[9px] uppercase tracking-tighter text-mist/30">Crowd</span>
                      <span className="text-xs font-bold text-mist">{loc.crowdDensity}%</span>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
