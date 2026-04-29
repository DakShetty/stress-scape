import { useEffect, useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  CartesianGrid, ReferenceLine,
} from 'recharts';
import * as api from '../api/client.js';
import { useTheme } from '../context/ThemeContext.jsx';

const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

// Animated counter hook
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (target == null) return;
    const start = performance.now();
    const from = 0;
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (target - from) * ease * 100) / 100);
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
}

// Custom bar with gradient color based on stress
const StressBar = (props) => {
  const { x, y, width, height, stress } = props;
  let fill = '#22c55e';
  if (stress > 65) fill = '#ef4444';
  else if (stress > 40) fill = '#f59e0b';
  return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} />;
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3 shadow-xl text-xs transition-colors">
      <p className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// KPI Card with animated count
function KpiCard({ label, value, unit = '', icon, color = 'text-slate-800 dark:text-slate-100', sub }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  return (
    <div className="card-glass p-5 flex flex-col gap-1 group">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
        {icon && <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>}
      </div>
      <p className={`font-display text-3xl font-bold ${color}`}>
        {animated}{unit}
      </p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');
  const [trendLoc, setTrendLoc] = useState('');
  const [trends, setTrends] = useState([]);
  const [radarLoc, setRadarLoc] = useState(null);
  const [activeMetric, setActiveMetric] = useState('stressScore');

  const chartTextColor = theme === 'dark' ? '#cbd5e1' : '#64748b';
  const chartGridColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  useEffect(() => {
    api.get('/api/analytics/summary')
      .then((res) => {
        setData(res);
        if (res.series?.length > 1) {
          setCompareA(res.series[0].name);
          setCompareB(res.series[1].name);
          setRadarLoc(res.series[0]);
        } else if (res.series?.length === 1) {
          setCompareA(res.series[0].name);
          setCompareB(res.series[0].name);
          setRadarLoc(res.series[0]);
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

  if (error) return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
    </div>
  );

  if (!data?.summary) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      <p className="text-xs text-mist/40 tracking-widest uppercase">Loading analytics…</p>
    </div>
  );

  const { summary, series } = data;

  // City health score (inverse of avg stress, 0–100)
  const cityHealth = Math.round(100 - summary.averageStress);

  const pieData = [
    { name: 'Low Risk', value: summary.stressDistribution.low },
    { name: 'Medium Risk', value: summary.stressDistribution.medium },
    { name: 'High Risk', value: summary.stressDistribution.high },
  ];

  const barData = series
    .slice().sort((a, b) => b.stressScore - a.stressScore)
    .slice(0, 12)
    .map((s) => ({
      name: s.name.length > 13 ? `${s.name.slice(0, 11)}…` : s.name,
      stressScore: Math.round(s.stressScore),
      aqi: s.aqi,
      temperature: s.temperature,
      crowdDensity: s.crowdDensity,
      noiseLevel: s.noiseLevel,
    }));

  const compareData = series.filter(s => s.name === compareA || s.name === compareB);

  // Build radar data for selected location
  const radarData = radarLoc ? [
    { metric: 'AQI', value: Math.min(100, Math.round((radarLoc.aqi / 200) * 100)), fullMark: 100 },
    { metric: 'Temp', value: Math.min(100, Math.round(((radarLoc.temperature - 15) / 25) * 100)), fullMark: 100 },
    { metric: 'Crowd', value: radarLoc.crowdDensity, fullMark: 100 },
    { metric: 'Noise', value: radarLoc.noiseLevel, fullMark: 100 },
    { metric: 'Stress', value: Math.round(radarLoc.stressScore), fullMark: 100 },
  ] : [];

  const metricOptions = [
    { key: 'stressScore', label: 'Stress Score', color: '#e11d48' },
    { key: 'aqi', label: 'AQI', color: '#6366f1' },
    { key: 'temperature', label: 'Temperature (°C)', color: '#f59e0b' },
    { key: 'crowdDensity', label: 'Crowd Density (%)', color: '#0d9488' },
    { key: 'noiseLevel', label: 'Noise Level (dB)', color: '#94a3b8' },
  ];

  const activeMeta = metricOptions.find(m => m.key === activeMetric);

  const exportCSV = () => {
    if (!series?.length) return;
    const headers = ['Location Name', 'Stress Score', 'AQI', 'Temperature', 'Crowd Density (%)', 'Noise Level (dB)'];
    const rows = series.map(s => [
      `"${s.name}"`,
      Math.round(s.stressScore),
      s.aqi,
      s.temperature,
      s.crowdDensity,
      s.noiseLevel
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StressScape_Data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">Live Data Insights</p>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Urban Analytics</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl transition-colors">
            Real-time aggregate statistics across {summary.locationCount} monitored zones in Maharashtra.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="shrink-0 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-95 flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2 sm:col-span-1 lg:col-span-2 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50 to-teal-50 dark:from-indigo-900/20 dark:to-teal-900/20 p-5 flex flex-col justify-between shadow-soft hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">City Health Index</p>
          <div>
            <p className="font-display text-6xl font-bold text-slate-800 dark:text-slate-100 leading-none mt-2">{cityHealth}</p>
            <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${cityHealth}%`,
                  background: cityHealth > 60 ? '#10b981' : cityHealth > 40 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">{cityHealth > 60 ? 'Overall healthy conditions' : cityHealth > 40 ? 'Moderate urban stress' : 'High urban stress detected'}</p>
          </div>
        </div>
        <KpiCard label="Locations" value={summary.locationCount} icon="📍" sub="Monitored zones" />
        <KpiCard label="Avg Stress" value={summary.averageStress} icon="📊" color={summary.averageStress > 60 ? 'text-red-500' : summary.averageStress > 40 ? 'text-amber-500' : 'text-emerald-500'} sub="out of 100" />
        <KpiCard label="Avg AQI" value={summary.aqi.avg} icon="💨" color={summary.aqi.avg > 150 ? 'text-red-500' : summary.aqi.avg > 100 ? 'text-amber-500' : 'text-emerald-500'} sub={`Range: ${summary.aqi.min}–${summary.aqi.max}`} />
        <KpiCard label="Avg Temp" value={summary.temperature.avg} unit="°C" icon="🌡️" sub={`High: ${summary.temperature.max}°C`} />
        <KpiCard label="Avg Noise" value={summary.noise.avg} unit=" dB" icon="🔊" sub={`Peak: ${summary.noise.max} dB`} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pie */}
        <div className="card-glass p-6">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">Risk Distribution</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Across all monitored zones</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={40} paddingAngle={3} stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ color: chartTextColor, fontSize: 11, fontWeight: 500 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            {pieData.map((d, i) => (
              <div key={i} className="rounded-lg py-2" style={{ background: PIE_COLORS[i] + (theme === 'dark' ? '25' : '15') }}>
                <p className="text-lg font-bold" style={{ color: PIE_COLORS[i] }}>{d.value}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{d.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top hotspots bar chart */}
        <div className="card-glass p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Top Stress Hotspots</h2>
            <div className="flex gap-1">
              {metricOptions.map(m => (
                <button
                  key={m.key}
                  onClick={() => setActiveMetric(m.key)}
                  className={`rounded px-2 py-1 text-[10px] font-bold transition-all ${activeMetric === m.key ? 'text-slate-800 dark:text-slate-100 shadow-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  style={activeMetric === m.key ? { color: m.color } : {}}
                >
                  {m.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Sorted by highest {activeMeta?.label}</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="name" tick={{ fill: chartTextColor, fontSize: 10, fontWeight: 500 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: chartTextColor, fontSize: 10, fontWeight: 500 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: chartGridColor }} />
                <Bar dataKey={activeMetric} name={activeMeta?.label} radius={[4, 4, 0, 0]} shape={(props) => <StressBar {...props} stress={props[activeMetric] ?? props.stress} fill={activeMeta?.color} />} fill={activeMeta?.color} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Radar + Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar chart */}
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Zone Profile Radar</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Multi-dimensional health fingerprint</p>
            </div>
            <select
              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 px-2 py-1.5 rounded-lg outline-none focus:border-indigo-500 shadow-sm"
              onChange={e => setRadarLoc(series.find(s => s.name === e.target.value) || null)}
              defaultValue={series[0]?.name || ''}
            >
              {series.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 8, right: 30, bottom: 8, left: 30 }}>
                <PolarGrid stroke={chartGridColor} />
                <PolarAngleAxis dataKey="metric" tick={{ fill: chartTextColor, fontSize: 11, fontWeight: 500 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: chartTextColor, fontSize: 9 }} />
                <Radar name="Zone" dataKey="value" stroke="#0d9488" fill="#0d9488" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparison tool */}
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Zone Comparison</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Side-by-side metric analysis</p>
            </div>
            <div className="flex gap-2">
              <select className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 px-2 py-1.5 rounded-lg outline-none focus:border-indigo-500 shadow-sm" value={compareA} onChange={e => setCompareA(e.target.value)}>
                {series.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
              <span className="text-slate-400 dark:text-slate-500 self-center text-xs font-bold">vs</span>
              <select className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 px-2 py-1.5 rounded-lg outline-none focus:border-indigo-500 shadow-sm" value={compareB} onChange={e => setCompareB(e.target.value)}>
                {series.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={false} />
                <XAxis type="number" domain={[0, 200]} tick={{ fill: chartTextColor, fontSize: 10, fontWeight: 500 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: chartTextColor, fontSize: 10, fontWeight: 500 }} width={80} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: chartGridColor }} />
                <Legend formatter={(v) => <span style={{ color: chartTextColor, fontSize: 11, fontWeight: 500 }}>{v}</span>} />
                <Bar dataKey="stressScore" name="Stress" fill="#ef4444" radius={[0, 4, 4, 0]} />
                <Bar dataKey="aqi" name="AQI" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                <Bar dataKey="temperature" name="Temp °C" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                <Bar dataKey="noiseLevel" name="Noise dB" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 24h Trend chart */}
      <div className="card-glass p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">24-Hour Stress Forecast</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hourly simulation based on urban temporal patterns</p>
          </div>
          <select
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg outline-none focus:border-indigo-500 shadow-sm"
            onChange={e => setTrendLoc(e.target.value)}
          >
            <option value="">Select a location…</option>
            {series.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>)}
          </select>
        </div>
        {trends.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="hour" tick={{ fill: chartTextColor, fontSize: 10, fontWeight: 500 }} interval={1} />
                <YAxis domain={[0, 100]} tick={{ fill: chartTextColor, fontSize: 10, fontWeight: 500 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: chartTextColor, fontSize: 11, fontWeight: 500 }}>{v}</span>} />
                <ReferenceLine y={65} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'High Risk', fill: '#ef4444', fontSize: 9, position: 'right' }} />
                <ReferenceLine y={35} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Low Risk', fill: '#10b981', fontSize: 9, position: 'right' }} />
                <Line type="monotone" dataKey="stressScore" stroke="#ef4444" strokeWidth={2.5} dot={false} name="Stress Score" />
                <Line type="monotone" dataKey="crowdDensity" stroke="#0d9488" strokeWidth={1.5} dot={false} name="Crowd %" strokeDasharray="6 3" />
                <Line type="monotone" dataKey="noiseLevel" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} strokeWidth={1.5} dot={false} name="Noise dB" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="aqi" stroke="#4f46e5" strokeWidth={1.5} dot={false} name="AQI" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div className="text-4xl opacity-40">📈</div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium italic">Select a location above to visualize the 24-hour stress cycle</p>
          </div>
        )}
      </div>
    </div>
  );
}
