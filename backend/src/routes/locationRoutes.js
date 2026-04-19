import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  listLocations,
  getLocation,
  createLocation,
  updateLocation,
  simulateVariation,
  addSavedLocation,
  removeSavedLocation,
  listSavedLocations,
  syncLiveData,
} from '../controllers/locationController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const locationCreate = [
  body('name').trim().notEmpty(),
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('aqi').isFloat({ min: 0, max: 500 }),
  body('temperature').isFloat({ min: -50, max: 60 }),
  body('crowdDensity').isFloat({ min: 0, max: 100 }),
  body('description').optional().isString(),
  body('areaTag').optional().isString(),
];

const locationUpdate = [
  body('name').optional().trim().notEmpty(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('aqi').optional().isFloat({ min: 0, max: 500 }),
  body('temperature').optional().isFloat({ min: -50, max: 60 }),
  body('crowdDensity').optional().isFloat({ min: 0, max: 100 }),
  body('description').optional().isString(),
  body('areaTag').optional().isString(),
];

router.get('/', listLocations);
router.get('/saved', authenticate, listSavedLocations);
router.post('/simulate-drift', authenticate, requireRole('admin'), simulateVariation);
router.post('/sync-live', authenticate, requireRole('admin'), syncLiveData);
router.post('/saved', authenticate, addSavedLocation);
router.delete('/saved/:locationId', authenticate, param('locationId').isMongoId(), removeSavedLocation);

router.post('/', authenticate, requireRole('admin'), locationCreate, createLocation);
router.patch(
  '/:id',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  locationUpdate,
  updateLocation
);
router.get('/:id', param('id').isMongoId(), getLocation);

export default router;
