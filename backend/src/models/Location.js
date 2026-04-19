import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    aqi: { type: Number, required: true, min: 0, max: 500 },
    temperature: { type: Number, required: true },
    crowdDensity: { type: Number, required: true, min: 0, max: 100 },
    noiseLevel: { type: Number, required: true, min: 0, max: 100, default: 50 },
    areaTag: { type: String, default: 'urban' },
    lastSimulatedAt: { type: Date },
  },
  { timestamps: true }
);

locationSchema.index({ latitude: 1, longitude: 1 });

export default mongoose.model('Location', locationSchema);
