import { validationResult } from 'express-validator';
import Location from '../models/Location.js';
import User from '../models/User.js';
import {
  computeStressScore,
  stressLevel,
  stressColorHex,
  normalizeAQI,
  normalizeTemperature,
  normalizeCrowd,
  normalizeNoise,
} from '../services/stressEngine.js';
import { enrichCoordinates } from '../services/liveEnrichmentService.js';

export function enrichLocation(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  const stressScore = computeStressScore(o.aqi, o.temperature, o.crowdDensity, o.noiseLevel);
  return {
    ...o,
    id: o._id,
    stressScore,
    stressLevel: stressLevel(stressScore),
    stressColor: stressColorHex(stressScore),
    normalized: {
      aqi: Math.round(normalizeAQI(o.aqi) * 100) / 100,
      temperature: Math.round(normalizeTemperature(o.temperature) * 100) / 100,
      crowdDensity: Math.round(normalizeCrowd(o.crowdDensity) * 100) / 100,
      noiseLevel: Math.round(normalizeNoise(o.noiseLevel) * 100) / 100,
    },
  };
}

export async function listLocations(req, res, next) {
  try {
    const docs = await Location.find().sort({ name: 1 });
    const data = docs.map(enrichLocation);
    res.json({ success: true, count: data.length, locations: data });
  } catch (e) {
    next(e);
  }
}

export async function getLocation(req, res, next) {
  try {
    const loc = await Location.findById(req.params.id);
    if (!loc) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    res.json({ success: true, location: enrichLocation(loc) });
  } catch (e) {
    if (e.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid location id' });
    }
    next(e);
  }
}

export async function createLocation(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array().map((e) => e.msg),
      });
    }
    const loc = await Location.create(req.body);
    res.status(201).json({ success: true, location: enrichLocation(loc) });
  } catch (e) {
    next(e);
  }
}

export async function updateLocation(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array().map((e) => e.msg),
      });
    }
    const loc = await Location.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!loc) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    res.json({ success: true, location: enrichLocation(loc) });
  } catch (e) {
    if (e.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid location id' });
    }
    next(e);
  }
}

export async function simulateVariation(req, res, next) {
  try {
    const docs = await Location.find();
    const updated = [];
    for (const loc of docs) {
      const deltaAqi = Math.round((Math.random() - 0.5) * 80);
      const deltaTemp = Math.round((Math.random() - 0.5) * 8 * 10) / 10;
      const deltaCrowd = Math.round((Math.random() - 0.5) * 40);
      const deltaNoise = Math.round((Math.random() - 0.5) * 30);
      loc.aqi = Math.max(0, Math.min(500, loc.aqi + deltaAqi));
      loc.temperature = Math.round((loc.temperature + deltaTemp) * 10) / 10;
      loc.crowdDensity = Math.max(0, Math.min(100, loc.crowdDensity + deltaCrowd));
      loc.noiseLevel = Math.max(0, Math.min(100, (loc.noiseLevel || 50) + deltaNoise));
      loc.lastSimulatedAt = new Date();
      await loc.save();
      updated.push(enrichLocation(loc));
    }
    res.json({
      success: true,
      message: 'Simulated real-time drift applied to all locations',
      locations: updated,
    });
  } catch (e) {
    next(e);
  }
}

export async function syncLiveData(req, res, next) {
  try {
    const docs = await Location.find();
    const updated = [];
    
    // We process sequentially to avoid hammering free-tier APIs too hard concurrently
    for (const loc of docs) {
      try {
        const live = await enrichCoordinates(loc.latitude, loc.longitude);
        
        // Update only if API returned valid data
        if (live.aqi !== undefined) loc.aqi = live.aqi;
        if (live.temperature !== undefined) loc.temperature = live.temperature;
        if (live.crowdDensity !== undefined) loc.crowdDensity = live.crowdDensity;
        if (live.noiseLevel !== undefined) loc.noiseLevel = live.noiseLevel;
        
        loc.lastSimulatedAt = new Date(); // Reusing this field for UI consistency
        await loc.save();
        updated.push(enrichLocation(loc));
      } catch (err) {
        console.warn(`Sync failed for ${loc.name}: ${err.message}`);
        // Keep existing data on individual failure
        updated.push(enrichLocation(loc));
      }
    }

    res.json({
      success: true,
      message: 'Live synchronization complete (WAQI & TomTom)',
      count: updated.length,
      locations: updated
    });
  } catch (e) {
    next(e);
  }
}

export async function addSavedLocation(req, res, next) {
  try {
    const { locationId } = req.body;
    if (!locationId) {
      return res.status(400).json({ success: false, message: 'locationId is required' });
    }
    const loc = await Location.findById(locationId);
    if (!loc) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { savedLocations: locationId },
    });
    const user = await User.findById(req.userId).populate('savedLocations');
    res.json({ success: true, savedLocations: user.savedLocations.map(enrichLocation) });
  } catch (e) {
    next(e);
  }
}

export async function removeSavedLocation(req, res, next) {
  try {
    const { locationId } = req.params;
    await User.findByIdAndUpdate(req.userId, {
      $pull: { savedLocations: locationId },
    });
    const user = await User.findById(req.userId).populate('savedLocations');
    res.json({ success: true, savedLocations: user.savedLocations.map(enrichLocation) });
  } catch (e) {
    next(e);
  }
}

export async function listSavedLocations(req, res, next) {
  try {
    const user = await User.findById(req.userId).populate('savedLocations');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      savedLocations: user.savedLocations.map(enrichLocation),
    });
  } catch (e) {
    next(e);
  }
}
