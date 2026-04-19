import Location from '../models/Location.js';
import { predictStressNextHour } from '../services/predictionService.js';
import { computeStressScore, stressLevel, stressColorHex } from '../services/stressEngine.js';

export async function predictForLocation(req, res, next) {
  try {
    const loc = await Location.findById(req.params.id);
    if (!loc) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    const base = predictStressNextHour(loc.aqi, loc.temperature, loc.crowdDensity);
    const predictedStress = computeStressScore(
      base.predicted.aqi,
      base.predicted.temperature,
      base.predicted.crowdDensity
    );
    res.json({
      success: true,
      ...base,
      currentStress: computeStressScore(loc.aqi, loc.temperature, loc.crowdDensity),
      predictedStress,
      predictedStressLevel: stressLevel(predictedStress),
      predictedStressColor: stressColorHex(predictedStress),
    });
  } catch (e) {
    if (e.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid location id' });
    }
    next(e);
  }
}
