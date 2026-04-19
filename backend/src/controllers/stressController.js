import { validationResult } from 'express-validator';
import {
  computeStressScore,
  stressLevel,
  stressColorHex,
  normalizeAQI,
  normalizeTemperature,
  normalizeCrowd,
} from '../services/stressEngine.js';

export function calculateStress(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input',
      errors: errors.array().map((e) => e.msg),
    });
  }
  const aqi = Number(req.query.aqi ?? req.body.aqi);
  const temperature = Number(req.query.temperature ?? req.body.temperature);
  const crowdDensity = Number(req.query.crowdDensity ?? req.body.crowdDensity);

  if ([aqi, temperature, crowdDensity].some((n) => Number.isNaN(n))) {
    return res.status(400).json({
      success: false,
      message: 'aqi, temperature, and crowdDensity must be valid numbers',
    });
  }

  const stressScore = computeStressScore(aqi, temperature, crowdDensity);
  res.json({
    success: true,
    stressScore,
    stressLevel: stressLevel(stressScore),
    stressColor: stressColorHex(stressScore),
    normalized: {
      aqi: Math.round(normalizeAQI(aqi) * 100) / 100,
      temperature: Math.round(normalizeTemperature(temperature) * 100) / 100,
      crowdDensity: Math.round(normalizeCrowd(crowdDensity) * 100) / 100,
    },
    inputs: { aqi, temperature, crowdDensity },
  });
}
