import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Location from '../models/Location.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urban_stress';

const baseSpots = [
  { name: 'CSMT — High crowd transit', lat: 18.9398, lng: 72.8354, aqi: 142, temp: 31, crowd: 88, noise: 85, tag: 'transit' },
  { name: 'Bandra Kurla Complex', lat: 19.0669, lng: 72.8677, aqi: 128, temp: 32, crowd: 72, noise: 65, tag: 'commercial' },
  { name: 'Marine Drive promenade', lat: 18.9442, lng: 72.8238, aqi: 95, temp: 29, crowd: 65, noise: 40, tag: 'recreation' },
  { name: 'Dharavi industrial edge', lat: 19.0422, lng: 72.855, aqi: 178, temp: 33, crowd: 82, noise: 75, tag: 'mixed' },
  { name: 'Powai IT corridor', lat: 19.1174, lng: 72.9098, aqi: 118, temp: 30, crowd: 58, noise: 50, tag: 'office' },
  { name: 'Andheri West station', lat: 19.1364, lng: 72.8296, aqi: 155, temp: 32, crowd: 90, noise: 88, tag: 'transit' },
  { name: 'Juhu beach', lat: 19.088, lng: 72.8267, aqi: 88, temp: 28, crowd: 78, noise: 60, tag: 'recreation' },
  { name: 'Worli sea face', lat: 19.0096, lng: 72.8157, aqi: 102, temp: 30, crowd: 55, noise: 45, tag: 'residential' },
  { name: 'Thane Ghodbunder', lat: 19.2544, lng: 72.9808, aqi: 134, temp: 31, crowd: 48, noise: 78, tag: 'arterial' },
  { name: 'Navi Mumbai Vashi', lat: 19.08, lng: 72.998, aqi: 98, temp: 30, crowd: 62, noise: 55, tag: 'commercial' },
  { name: 'Pune FC Road', lat: 18.5074, lng: 73.8077, aqi: 112, temp: 29, crowd: 76, noise: 68, tag: 'retail' },
  { name: 'Pune Hinjewadi IT', lat: 18.5912, lng: 73.7389, aqi: 105, temp: 30, crowd: 68, noise: 42, tag: 'office' },
  { name: 'Pune Shivajinagar', lat: 18.5074, lng: 73.8507, aqi: 124, temp: 31, crowd: 70, noise: 82, tag: 'transit' },
  { name: 'Nashik Godavari ghat road', lat: 19.9975, lng: 73.7898, aqi: 86, temp: 28, crowd: 42, noise: 35, tag: 'arterial' },
  { name: 'Nagpur Sitabuldi', lat: 21.1458, lng: 79.0882, aqi: 138, temp: 34, crowd: 64, noise: 72, tag: 'commercial' },
  { name: 'Aurangabad station road', lat: 19.8762, lng: 75.3433, aqi: 148, temp: 33, crowd: 71, noise: 74, tag: 'transit' },
  { name: 'Kolhapur Rankala', lat: 16.705, lng: 74.2433, aqi: 72, temp: 27, crowd: 52, noise: 30, tag: 'recreation' },
  { name: 'Sangli market', lat: 16.8524, lng: 74.5815, aqi: 118, temp: 32, crowd: 66, noise: 62, tag: 'retail' },
  { name: 'Solapur hot spot', lat: 17.6599, lng: 75.9064, aqi: 162, temp: 36, crowd: 59, noise: 58, tag: 'urban_core' },
  { name: 'Nanded city centre', lat: 19.1383, lng: 77.321, aqi: 128, temp: 35, crowd: 54, noise: 52, tag: 'commercial' },
];

function jitter(n, delta) {
  return Math.round((n + (Math.random() - 0.5) * delta) * 10) / 10;
}

function buildLocations() {
  const out = [...baseSpots];
  let i = baseSpots.length;
  const hubs = [
    { lat: 19.076, lng: 72.8777, name: 'Mumbai generic' },
    { lat: 18.5204, lng: 73.8567, name: 'Pune generic' },
    { lat: 19.2183, lng: 73.0878, name: 'Kalyan belt' },
  ];
  while (out.length < 42) {
    const h = hubs[i % hubs.length];
    out.push({
      name: `${h.name} sector ${out.length + 1}`,
      lat: jitter(h.lat, 0.12),
      lng: jitter(h.lng, 0.12),
      aqi: jitter(120, 60),
      temp: jitter(31, 5),
      crowd: jitter(60, 35),
      noise: jitter(60, 40),
      tag: 'generated',
    });
    i += 1;
  }
  return out.slice(0, 42);
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  await Location.deleteMany({});
  await User.deleteMany({});

  const locs = buildLocations();
  const inserted = await Location.insertMany(
    locs.map((s) => ({
      name: s.name,
      latitude: s.lat,
      longitude: s.lng,
      aqi: Math.max(0, Math.min(500, Math.round(s.aqi))),
      temperature: s.temp,
      crowdDensity: Math.max(0, Math.min(100, Math.round(s.crowd))),
      noiseLevel: Math.max(0, Math.min(100, Math.round(s.noise))),
      areaTag: s.tag,
      description: 'Synthetic sample aligned with MPCB-style AQI bands and field-visit style crowding.',
    }))
  );

  await User.create([
    {
      name: 'System Admin',
      email: 'admin@stressscape.demo',
      password: 'admin123',
      role: 'admin',
    },
    {
      name: 'Demo User',
      email: 'user@stressscape.demo',
      password: 'user123',
      role: 'user',
      savedLocations: [inserted[0]._id, inserted[2]._id],
    },
  ]);

  console.log(`Seeded ${inserted.length} locations and demo users.`);
  console.log('Admin: admin@stressscape.demo / admin123');
  console.log('User:  user@stressscape.demo / user123');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
