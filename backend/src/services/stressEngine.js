/**
 * Stress = 0.3 * norm(AQI) + 0.2 * norm(Temperature) + 0.2 * norm(Crowd) + 0.3 * norm(Noise)
 */

const AQI_CAP = 300;
const TEMP_COMFORT = 26;
const TEMP_LOW = 18;
const TEMP_HIGH = 40;

export function normalizeAQI(aqi) {
  const n = Math.max(0, Math.min(Number(aqi) || 0, AQI_CAP));
  return (n / AQI_CAP) * 100;
}

export function normalizeTemperature(celsius) {
  const t = Number(celsius);
  if (Number.isNaN(t)) return 0;
  const deviation = Math.abs(t - TEMP_COMFORT);
  const maxDev = Math.max(TEMP_COMFORT - TEMP_LOW, TEMP_HIGH - TEMP_COMFORT);
  return Math.min(100, (deviation / maxDev) * 100);
}

export function normalizeCrowd(crowd) {
  const c = Math.max(0, Math.min(Number(crowd) || 0, 100));
  return c;
}

export function normalizeNoise(noise) {
  const n = Math.max(0, Math.min(Number(noise) || 0, 100));
  return n;
}

export function computeStressScore(aqi, temperature, crowdDensity, noiseLevel) {
  const a = normalizeAQI(aqi);
  const temp = normalizeTemperature(temperature);
  const c = normalizeCrowd(crowdDensity);
  const n = normalizeNoise(noiseLevel || 50);
  const raw = 0.3 * a + 0.2 * temp + 0.2 * c + 0.3 * n;
  return Math.round(raw * 100) / 100;
}

export function stressLevel(score) {
  if (score <= 33) return 'low';
  if (score <= 66) return 'medium';
  return 'high';
}

export function stressColorHex(score) {
  const level = stressLevel(score);
  if (level === 'low') return '#22c55e';
  if (level === 'medium') return '#eab308';
  return '#ef4444';
}
