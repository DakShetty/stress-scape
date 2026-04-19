import { Router } from 'express';
import { param } from 'express-validator';
import { predictForLocation } from '../controllers/predictionController.js';

const router = Router();
router.get('/location/:id', param('id').isMongoId(), predictForLocation);
export default router;
