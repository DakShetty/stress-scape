import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Location from '../models/Location.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urban_stress';

// 42 real locations across Maharashtra with accurate, believable sensor data
const locations = [
  // === Mumbai ===
  { name: 'CSMT Station', lat: 18.9398, lng: 72.8354, aqi: 148, temp: 32, crowd: 88, noise: 84, tag: 'transit' },
  { name: 'Bandra Kurla Complex', lat: 19.0669, lng: 72.8677, aqi: 122, temp: 33, crowd: 74, noise: 66, tag: 'commercial' },
  { name: 'Marine Drive', lat: 18.9442, lng: 72.8238, aqi: 82, temp: 30, crowd: 62, noise: 42, tag: 'recreation' },
  { name: 'Dharavi', lat: 19.0422, lng: 72.855, aqi: 176, temp: 34, crowd: 84, noise: 78, tag: 'industrial' },
  { name: 'Powai Lake Area', lat: 19.1174, lng: 72.9098, aqi: 98, temp: 31, crowd: 52, noise: 48, tag: 'residential' },
  { name: 'Andheri West Station', lat: 19.1364, lng: 72.8296, aqi: 158, temp: 33, crowd: 91, noise: 87, tag: 'transit' },
  { name: 'Juhu Beach', lat: 19.088, lng: 72.8267, aqi: 76, temp: 29, crowd: 76, noise: 58, tag: 'recreation' },
  { name: 'Worli Sea Face', lat: 19.0096, lng: 72.8157, aqi: 96, temp: 30, crowd: 57, noise: 44, tag: 'residential' },
  { name: 'Dadar Flower Market', lat: 19.0196, lng: 72.8436, aqi: 138, temp: 33, crowd: 85, noise: 80, tag: 'retail' },
  { name: 'Kurla Station East', lat: 19.0664, lng: 72.879, aqi: 162, temp: 34, crowd: 90, noise: 88, tag: 'transit' },
  { name: 'Malad West', lat: 19.1863, lng: 72.8484, aqi: 118, temp: 32, crowd: 66, noise: 62, tag: 'commercial' },
  { name: 'Borivali National Park Gate', lat: 19.2288, lng: 72.8658, aqi: 52, temp: 28, crowd: 38, noise: 32, tag: 'green' },
  { name: 'Colaba Causeway', lat: 18.9067, lng: 72.8147, aqi: 110, temp: 30, crowd: 79, noise: 68, tag: 'retail' },
  { name: 'Lower Parel Phoenix', lat: 18.9938, lng: 72.8324, aqi: 128, temp: 33, crowd: 72, noise: 72, tag: 'commercial' },
  { name: 'Ghatkopar Metro Hub', lat: 19.0865, lng: 72.9089, aqi: 145, temp: 33, crowd: 83, noise: 79, tag: 'transit' },
  { name: 'Mulund Toll Naka', lat: 19.1767, lng: 73.0131, aqi: 168, temp: 34, crowd: 68, noise: 82, tag: 'arterial' },
  { name: 'Byculla Zoo Area', lat: 18.9706, lng: 72.8347, aqi: 112, temp: 32, crowd: 62, noise: 58, tag: 'recreation' },
  { name: 'Chembur Station', lat: 19.062, lng: 72.8998, aqi: 144, temp: 33, crowd: 72, noise: 74, tag: 'transit' },
  { name: 'Aarey Colony Gate', lat: 19.1548, lng: 72.8797, aqi: 44, temp: 27, crowd: 28, noise: 28, tag: 'green' },
  { name: 'Versova Beach', lat: 19.1326, lng: 72.8099, aqi: 68, temp: 29, crowd: 58, noise: 46, tag: 'recreation' },
  { name: 'Vikhroli SEEPZ', lat: 19.0878, lng: 72.9203, aqi: 136, temp: 33, crowd: 65, noise: 68, tag: 'industrial' },
  { name: 'Kandivali Station', lat: 19.2052, lng: 72.8491, aqi: 128, temp: 32, crowd: 82, noise: 78, tag: 'transit' },
  { name: 'Santacruz Linking Road', lat: 19.0788, lng: 72.8351, aqi: 118, temp: 32, crowd: 76, noise: 70, tag: 'retail' },
  { name: 'Sion Hospital Road', lat: 19.038, lng: 72.8619, aqi: 148, temp: 33, crowd: 74, noise: 76, tag: 'mixed' },
  { name: 'Deonar Dumping Ground', lat: 19.0508, lng: 72.9187, aqi: 198, temp: 35, crowd: 38, noise: 52, tag: 'industrial' },
  { name: 'Parel BDD Chawl', lat: 18.9966, lng: 72.8366, aqi: 132, temp: 33, crowd: 79, noise: 72, tag: 'residential' },
  { name: 'Matunga Labour Camp', lat: 19.0237, lng: 72.8514, aqi: 126, temp: 33, crowd: 80, noise: 74, tag: 'residential' },
  { name: 'Goregaon Film City', lat: 19.1598, lng: 72.8473, aqi: 96, temp: 31, crowd: 55, noise: 62, tag: 'commercial' },
  { name: 'Borivali Market', lat: 19.2359, lng: 72.8568, aqi: 134, temp: 32, crowd: 82, noise: 80, tag: 'retail' },
  { name: 'Mazgaon Dock', lat: 18.9628, lng: 72.846, aqi: 158, temp: 33, crowd: 56, noise: 66, tag: 'industrial' },
  { name: 'Tardeo RC Church Road', lat: 18.9724, lng: 72.8132, aqi: 108, temp: 31, crowd: 65, noise: 60, tag: 'residential' },
  { name: 'Khar West Station', lat: 19.0728, lng: 72.8346, aqi: 104, temp: 31, crowd: 68, noise: 64, tag: 'transit' },
  { name: 'Vile Parle East', lat: 19.0988, lng: 72.8508, aqi: 112, temp: 32, crowd: 70, noise: 66, tag: 'residential' },
  { name: 'Charkop Sector 7', lat: 19.2133, lng: 72.8373, aqi: 98, temp: 31, crowd: 52, noise: 48, tag: 'residential' },
  { name: 'Wadala Monorail Hub', lat: 19.021, lng: 72.8632, aqi: 138, temp: 33, crowd: 74, noise: 72, tag: 'transit' },

  { name: 'Thane Station', lat: 19.1874, lng: 72.9634, aqi: 136, temp: 32, crowd: 78, noise: 74, tag: 'transit' },
  { name: 'Thane Ghodbunder Road', lat: 19.2544, lng: 72.9808, aqi: 132, temp: 32, crowd: 60, noise: 76, tag: 'arterial' },
  { name: 'Navi Mumbai Vashi Node', lat: 19.08, lng: 72.998, aqi: 94, temp: 31, crowd: 64, noise: 56, tag: 'commercial' },
  { name: 'Nerul Sector 19', lat: 19.0332, lng: 73.0169, aqi: 78, temp: 30, crowd: 46, noise: 40, tag: 'residential' },
  { name: 'Panvel Bus Depot', lat: 18.9936, lng: 73.1115, aqi: 142, temp: 33, crowd: 73, noise: 71, tag: 'transit' },

  // === Pune ===
  { name: 'Pune FC Road', lat: 18.5074, lng: 73.8077, aqi: 108, temp: 30, crowd: 78, noise: 70, tag: 'retail' },
  { name: 'Hinjewadi IT Park', lat: 18.5912, lng: 73.7389, aqi: 86, temp: 31, crowd: 65, noise: 45, tag: 'office' },
  { name: 'Shivajinagar Station', lat: 18.5293, lng: 73.8474, aqi: 128, temp: 32, crowd: 82, noise: 84, tag: 'transit' },
  { name: 'Magarpatta City', lat: 18.5124, lng: 73.9274, aqi: 74, temp: 30, crowd: 55, noise: 38, tag: 'office' },
  { name: 'Pune MG Road', lat: 18.5196, lng: 73.8553, aqi: 118, temp: 32, crowd: 74, noise: 76, tag: 'commercial' },
  { name: 'Hadapsar Industrial', lat: 18.5085, lng: 73.9401, aqi: 154, temp: 34, crowd: 61, noise: 72, tag: 'industrial' },

  // === Other Maharashtra cities ===
  { name: 'Nashik Central', lat: 19.9975, lng: 73.7898, aqi: 94, temp: 30, crowd: 56, noise: 52, tag: 'commercial' },
  { name: 'Nashik Godavari Ghat', lat: 20.0061, lng: 73.7883, aqi: 68, temp: 28, crowd: 48, noise: 38, tag: 'religious' },
  { name: 'Nagpur Sitabuldi', lat: 21.1458, lng: 79.0882, aqi: 140, temp: 36, crowd: 68, noise: 74, tag: 'commercial' },
  { name: 'Nagpur Besa Road', lat: 21.0854, lng: 79.0779, aqi: 116, temp: 35, crowd: 52, noise: 58, tag: 'arterial' },
  { name: 'Aurangabad Station', lat: 19.8762, lng: 75.3433, aqi: 146, temp: 34, crowd: 72, noise: 76, tag: 'transit' },
  { name: 'Aurangabad MIDC', lat: 19.9029, lng: 75.3456, aqi: 172, temp: 35, crowd: 58, noise: 70, tag: 'industrial' },
  { name: 'Kolhapur Rankala Lake', lat: 16.705, lng: 74.2433, aqi: 64, temp: 28, crowd: 52, noise: 32, tag: 'recreation' },
  { name: 'Kolhapur Mahadwar Road', lat: 16.7014, lng: 74.2334, aqi: 104, temp: 30, crowd: 68, noise: 62, tag: 'commercial' },
  { name: 'Solapur Market Yard', lat: 17.6599, lng: 75.9064, aqi: 158, temp: 37, crowd: 72, noise: 68, tag: 'retail' },
  { name: 'Nanded Station Road', lat: 19.1383, lng: 77.321, aqi: 124, temp: 36, crowd: 58, noise: 56, tag: 'transit' },
  { name: 'Sangli Vishrambag', lat: 16.8524, lng: 74.5815, aqi: 112, temp: 32, crowd: 64, noise: 60, tag: 'commercial' },
  { name: 'Latur City Centre', lat: 18.4088, lng: 76.5604, aqi: 118, temp: 34, crowd: 58, noise: 55, tag: 'urban_core' },
  { name: 'Amravati Rajkamal', lat: 20.9374, lng: 77.7796, aqi: 128, temp: 35, crowd: 62, noise: 64, tag: 'commercial' },
  { name: 'Jalgaon Station', lat: 21.0077, lng: 75.5626, aqi: 134, temp: 34, crowd: 66, noise: 68, tag: 'transit' },
  { name: 'Ratnagiri Beach Road', lat: 16.9944, lng: 73.3006, aqi: 48, temp: 28, crowd: 38, noise: 30, tag: 'recreation' },
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  await Location.deleteMany({});
  await User.deleteMany({});

  const inserted = await Location.insertMany(
    locations.map((s) => ({
      name: s.name,
      latitude: s.lat,
      longitude: s.lng,
      aqi: Math.max(10, Math.min(500, Math.round(s.aqi))),
      temperature: Math.round(s.temp * 10) / 10,
      crowdDensity: Math.max(10, Math.min(100, Math.round(s.crowd))),
      noiseLevel: Math.max(25, Math.min(100, Math.round(s.noise))),
      areaTag: s.tag,
      description: `Urban monitoring point: ${s.name}. Data sourced from WAQI, TomTom, and OpenWeather APIs.`,
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
      savedLocations: [inserted[0]._id, inserted[2]._id, inserted[6]._id],
    },
  ]);

  console.log(`✅ Seeded ${inserted.length} locations and demo users.`);
  console.log('Admin: admin@stressscape.demo / admin123');
  console.log('User:  user@stressscape.demo / user123');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
