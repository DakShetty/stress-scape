export function aqiColor(aqi) {
  const t = Math.min(1, Math.max(0, aqi / 200));
  if (t < 0.33) return '#22c55e';
  if (t < 0.66) return '#eab308';
  return '#ef4444';
}

export function tempColor(c) {
  if (c < 24) return '#38bdf8';
  if (c < 30) return '#22c55e';
  if (c < 34) return '#eab308';
  return '#f97316';
}

export function crowdColor(d) {
  const t = d / 100;
  if (t < 0.35) return '#a78bfa';
  if (t < 0.7) return '#c084fc';
  return '#e11d48';
}

export function noiseColor(n) {
  const t = n / 100;
  if (t < 0.35) return '#94a3b8'; // Slate/Steel
  if (t < 0.7) return '#64748b';
  return '#1e293b';
}
