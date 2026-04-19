import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me, updatePreferences } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', authenticate, me);

router.patch(
  '/preferences',
  authenticate,
  [
    body('defaultLayers').optional().isObject(),
    body('defaultLayers.aqi').optional().isBoolean(),
    body('defaultLayers.temperature').optional().isBoolean(),
    body('defaultLayers.crowd').optional().isBoolean(),
    body('defaultLayers.stress').optional().isBoolean(),
  ],
  updatePreferences
);

export default router;
