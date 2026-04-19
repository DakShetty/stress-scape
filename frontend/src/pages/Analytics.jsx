import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import * as api from '../api/client.js';

const PIE_COLORS = ['#22c55e', '#eab308', '#ef4444'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [compareIds, setCompareIds] = useState([]);
  const [trendLoc, setTrendLoc] = useState(null);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    api
      .get('/api/analytics/summary')
      .then((res) => {
        setData(res);
        if (res.series?.length > 1) {
            setCompareIds([res.series[0].name, res.series[1].name]);
        } else if (res.series?.length === 1) {
            setCompareIds([res.series[0].name, res.series[0].name]);
        }
      })
      .catch((e) => setError(e.message || 'Failed to load analytics'));
  }, []);

  useEffect(() => {
    if (!trendLoc) return;
    api.get(`/api/analytics/trends/${trendLoc}`)
      .then(res => setTrends(res.trends || []))
      .catch(() => setTrends([]));
  }, [trendLoc]);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      </div>
    );
  }

  if (!data?.summary) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-mist/60">Loading charts…</div>
    );
  }

  const { summary, series } = data;
  const pieData = [
    { name: 'Low', value: summary.stressDistribution.low },
    { name: 'Medium', value: summary.stressDistribution.medium },
    { name: 'High', value: summary.stressDistribution.high },
  ];
  const barData = series
    .slice()
    .sort((a, b) => b.stressScore - a.stressScore)
    .slice(0, 12)
    .map((s) => ({
      name: s.name.length > 14 ? `${s.name.slice(0, 12)}…` : s.name,
      stress: s.stressScore,
      aqi: s.aqi,
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Analytics</h1>
      <p className="mt-1 text-sm text-mist/70">
        Aggregate stress distribution and top hotspots from the live dataset.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-6 lg:col-span-1">
          <h2 className="text-sm font-semibold text-white">Stress mix</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#121a2e', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-white">Top stress scores</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#121a2e', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Bar dataKey="stress" fill="#0d9488" radius={[4, 4, 0, 0]} name="Stress" />
                <Bar dataKey="aqi" fill="#6366f1" radius={[4, 4, 0, 0]} name="AQI" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ['Locations', summary.locationCount],
          ['Avg stress', summary.averageStress],
          ['AQI avg', summary.aqi.avg],
          ['Temp avg °C', summary.temperature.avg],
          ['Noise avg dB', summary.noise.avg],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-white/10 bg-ink-900/50 p-4">
            <p className="text-xs text-mist/50">{k}</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-8">
        {/* Comparison Tool */}
        <div className="rounded-2xl border border-white/10 bg-ink-900/30 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Comparison Tool</h2>
            <div className="flex gap-2">
                <select 
                    className="bg-ink-950 border border-white/10 text-xs text-mist p-1 rounded"
                    value={compareIds[0]} 
                    onChange={e => setCompareIds([e.target.value, compareIds[1]])}
                >
                    {series.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
                <select 
                    className="bg-ink-950 border border-white/10 text-xs text-mist p-1 rounded"
                    value={compareIds[1]} 
                    onChange={e => setCompareIds([compareIds[0], e.target.value])}
                >
                    {series.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
            </div>
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series.filter(s => compareIds.includes(s.name))}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#121a2e', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Legend />
                <Bar dataKey="stressScore" fill="#0d9488" name="Stress" />
                <Bar dataKey="aqi" fill="#6366f1" name="AQI" />
                <Bar dataKey="temperature" fill="#facc15" name="Temp" />
                <Bar dataKey="noiseLevel" fill="#94a3b8" name="Noise" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24h Trends */}
        <div className="rounded-2xl border border-white/10 bg-ink-900/30 p-6 backdrop-blur-sm">
           <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">24h Stress Forecast/Trends (Simulated)</h2>
            <select 
                className="bg-ink-950 border border-white/10 text-xs text-mist p-1 rounded"
                onChange={e => setTrendLoc(e.target.value)}
            >
                <option value="">Select a location...</option>
                {series.map(s => (
                  <option key={s.name} value={s.id || s._id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>
          {trends.length > 0 ? (
             <div className="mt-6 h-72">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={trends}>
                 <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                 <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                 <Tooltip contentStyle={{ background: '#121a2e', border: '1px solid rgba(255,255,255,0.1)' }} />
                 <Legend />
                 <Line type="monotone" dataKey="stressScore" stroke="#e11d48" strokeWidth={3} dot={false} name="Stress Level" />
                 <Line type="monotone" dataKey="aqi" stroke="#6366f1" strokeWidth={1} dot={false} name="AQI" />
                 <Line type="monotone" dataKey="noiseLevel" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="Noise (dB)" />
               </LineChart>
             </ResponsiveContainer>
           </div>
          ) : (
            <div className="mt-12 text-center text-xs text-mist/40 italic">Select a location to visualize 24-hour cycle patterns</div>
          )}
        </div>
      </div>
    </div>
  );
}
