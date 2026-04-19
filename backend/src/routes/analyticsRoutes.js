import { Router } from 'express';
import { stressSummary, getHistoricalTrends } from '../controllers/analyticsController.js';

const router = Router();
router.get('/summary', stressSummary);
router.get('/trends/:id', getHistoricalTrends);
export default router;
