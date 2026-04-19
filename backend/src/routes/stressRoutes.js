import { Router } from 'express';
import { query, body } from 'express-validator';
import { calculateStress } from '../controllers/stressController.js';

const router = Router();

const queryValidators = [
  query('aqi').isFloat({ min: 0, max: 500 }),
  query('temperature').isFloat({ min: -50, max: 60 }),
  query('crowdDensity').isFloat({ min: 0, max: 100 }),
];

router.get('/calculate', queryValidators, calculateStress);
router.post(
  '/calculate',
  [
    body('aqi').isFloat({ min: 0, max: 500 }),
    body('temperature').isFloat({ min: -50, max: 60 }),
    body('crowdDensity').isFloat({ min: 0, max: 100 }),
  ],
  calculateStress
);

export default router;
