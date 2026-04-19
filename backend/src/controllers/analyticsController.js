import Location from '../models/Location.js';
import { computeStressScore, stressLevel } from '../services/stressEngine.js';

export async function stressSummary(req, res, next) {
  try {
    const docs = await Location.find();
    const scores = docs.map((d) => computeStressScore(d.aqi, d.temperature, d.crowdDensity, d.noiseLevel));
    const avgStress =
      scores.length === 0 ? 0 : Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
    const byLevel = { low: 0, medium: 0, high: 0 };
    scores.forEach((s) => {
      byLevel[stressLevel(s)] += 1;
    });
    const aqiValues = docs.map((d) => d.aqi);
    const temps = docs.map((d) => d.temperature);
    const crowds = docs.map((d) => d.crowdDensity);
    const noiseValues = docs.map((d) => d.noiseLevel || 50);
    const minMax = (arr) =>
      arr.length ? { min: Math.min(...arr), max: Math.max(...arr) } : { min: 0, max: 0 };
    res.json({
      success: true,
      summary: {
        locationCount: docs.length,
        averageStress: avgStress,
        stressDistribution: byLevel,
        aqi: { ...minMax(aqiValues), avg: roundAvg(aqiValues) },
        temperature: { ...minMax(temps), avg: roundAvg(temps) },
        crowdDensity: { ...minMax(crowds), avg: roundAvg(crowds) },
        noise: { ...minMax(noiseValues), avg: roundAvg(noiseValues) },
      },
      series: docs.map((d) => ({
        id: d._id,
        name: d.name,
        stressScore: computeStressScore(d.aqi, d.temperature, d.crowdDensity, d.noiseLevel),
        aqi: d.aqi,
        temperature: d.temperature,
        crowdDensity: d.crowdDensity,
        noiseLevel: d.noiseLevel || 50,
      })),
    });
  } catch (e) {
    next(e);
  }
}

export async function getHistoricalTrends(req, res, next) {
  try {
    const { id } = req.params;
    const loc = await Location.findById(id);
    if (!loc) return res.status(404).json({ success: false, message: 'Location not found' });

    // Generate 24 points (one per hour) using heuristic seasonality
    const trends = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
        const hour = (now.getHours() - (23 - i) + 24) % 24;
        const rushFactor = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20) ? 1.2 : 0.9;
        const heatFactor = hour >= 12 && hour <= 16 ? 1.15 : 0.85;
        
        const aqi = Math.round(loc.aqi * rushFactor * (0.9 + Math.random() * 0.2));
        const temp = Math.round(loc.temperature * heatFactor * (0.95 + Math.random() * 0.1) * 10) / 10;
        const crowd = Math.round(loc.crowdDensity * rushFactor * (0.8 + Math.random() * 0.4));
        const noise = Math.round((loc.noiseLevel || 50) * rushFactor * (0.85 + Math.random() * 0.3));
        
        const score = computeStressScore(aqi, temp, crowd, noise);
        
        trends.push({
            hour: `${hour}:00`,
            stressScore: score,
            aqi,
            temperature: temp,
            crowdDensity: Math.min(100, Math.max(0, crowd)),
            noiseLevel: Math.min(100, Math.max(0, noise))
        });
    }

    res.json({ success: true, location: loc.name, trends });
  } catch (e) {
    next(e);
  }
}

function roundAvg(arr) {
  if (!arr.length) return 0;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;
}
