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

    // Generate 24 points with realistic time-of-day variance
    const trends = [];
    const now = new Date();
    // Base values with realistic floor (never zero)
    const baseAqi = Math.max(30, loc.aqi);
    const baseTemp = Math.max(18, loc.temperature);
    const baseCrowd = Math.max(10, loc.crowdDensity);
    const baseNoise = Math.max(25, loc.noiseLevel || 50);

    for (let i = 0; i < 24; i++) {
      const hour = (now.getHours() - (23 - i) + 24) % 24;

      // Multi-factor time modifiers
      const isMorningRush = hour >= 7 && hour <= 10;
      const isEveningRush = hour >= 17 && hour <= 21;
      const isPeakHeat = hour >= 12 && hour <= 16;
      const isNight = hour >= 23 || hour <= 5;

      const crowdFactor = isMorningRush ? 1.35 : isEveningRush ? 1.45 : isNight ? 0.15 : isPeakHeat ? 0.75 : 1.0;
      const noiseFactor = isMorningRush ? 1.3  : isEveningRush ? 1.4  : isNight ? 0.25 : isPeakHeat ? 0.85 : 1.0;
      const heatFactor  = isPeakHeat   ? 1.18 : isNight ? 0.88 : isMorningRush ? 0.94 : 1.02;
      const aqiFactor   = isMorningRush ? 1.22 : isEveningRush ? 1.28 : isNight ? 0.65 : isPeakHeat ? 1.08 : 1.0;

      // Add realistic random walk noise
      const rand = () => 0.88 + Math.random() * 0.24;

      const aqi   = Math.round(Math.min(500, Math.max(10, baseAqi * aqiFactor * rand())));
      const temp  = Math.round(Math.min(45, Math.max(15, baseTemp * heatFactor * (0.97 + Math.random() * 0.06))) * 10) / 10;
      const crowd = Math.round(Math.min(100, Math.max(5,  baseCrowd * crowdFactor * rand())));
      const noise = Math.round(Math.min(100, Math.max(20, baseNoise * noiseFactor * rand())));

      const score = computeStressScore(aqi, temp, crowd, noise);

      trends.push({
        hour: `${String(hour).padStart(2,'0')}:00`,
        stressScore: score,
        aqi,
        temperature: temp,
        crowdDensity: crowd,
        noiseLevel: noise
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
