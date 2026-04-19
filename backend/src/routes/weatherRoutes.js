import { Router } from 'express';
import { weatherAtPoint } from '../controllers/weatherController.js';

const router = Router();
router.get('/point', weatherAtPoint);
export default router;
