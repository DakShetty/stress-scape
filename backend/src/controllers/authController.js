import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { signToken } from '../utils/token.js';
import { enrichLocation } from './locationController.js';

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array().map((e) => e.msg),
      });
    }
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password });
    const token = signToken(user);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        savedLocations: (user.savedLocations || []).map(enrichLocation),
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array().map((e) => e.msg),
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = signToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        savedLocations: (user.savedLocations || []).map(enrichLocation),
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.userId).populate('savedLocations');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        savedLocations: (user.savedLocations || []).map(enrichLocation),
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array().map((e) => e.msg),
      });
    }
    const { defaultLayers } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (defaultLayers) {
      const cur = user.preferences?.defaultLayers;
      const plain = cur?.toObject ? cur.toObject() : { ...cur };
      user.preferences.defaultLayers = { ...plain, ...defaultLayers };
      user.markModified('preferences');
    }
    await user.save();
    res.json({
      success: true,
      user: {
        id: user._id,
        preferences: user.preferences,
      },
    });
  } catch (e) {
    next(e);
  }
}
