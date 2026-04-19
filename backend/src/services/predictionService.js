/**
 * Lightweight heuristic "forecast" for demo/education (not clinical).
 * Uses time-of-day seasonality + small damped drift from inputs.
 */

export function predictStressNextHour(aqi, temperature, crowdDensity) {
  const hour = new Date().getUTCHours() + 5.5; // rough IST offset for demo
  const h = ((hour % 24) + 24) % 24;
  const rushFactor = h >= 8 && h <= 10 ? 1.08 : h >= 17 && h <= 20 ? 1.1 : h >= 12 && h <= 15 ? 1.05 : 1;
  const heatFactor = temperature > 32 ? 1.06 : temperature < 22 ? 0.98 : 1;

  const nextAqi = Math.min(500, Math.max(0, aqi * rushFactor * 1.02));
  const nextTemp = temperature * heatFactor + (Math.random() - 0.5) * 0.3;
  const nextCrowd = Math.min(100, Math.max(0, crowdDensity * rushFactor + (Math.random() - 0.5) * 3));

  return {
    model: 'heuristic_time_rush_v1',
    horizonHours: 1,
    inputs: { aqi, temperature, crowdDensity },
    predicted: {
      aqi: Math.round(nextAqi * 10) / 10,
      temperature: Math.round(nextTemp * 10) / 10,
      crowdDensity: Math.round(nextCrowd * 10) / 10,
    },
  };
}
