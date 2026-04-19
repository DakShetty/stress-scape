import express from 'express';
import { handleAdvice } from '../controllers/adviceController.js';

const router = express.Router();

router.post('/', handleAdvice);

export default router;
