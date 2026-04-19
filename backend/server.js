import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import locationRoutes from './src/routes/locationRoutes.js';
import stressRoutes from './src/routes/stressRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import predictionRoutes from './src/routes/predictionRoutes.js';
import weatherRoutes from './src/routes/weatherRoutes.js';
import adviceRoutes from './src/routes/adviceRoutes.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5100;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'urban-stress-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/stress', stressRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/advice', adviceRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
