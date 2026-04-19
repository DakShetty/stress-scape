import { fetchWeatherSnapshot } from '../services/weatherService.js';

export async function weatherAtPoint(req, res) {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return res.status(400).json({ success: false, message: 'lat and lon query params required' });
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ success: false, message: 'Invalid coordinates' });
  }
  const data = await fetchWeatherSnapshot(lat, lon);
  if (!data) {
    return res.json({
      success: true,
      available: false,
      message:
        process.env.OPENWEATHER_API_KEY
          ? 'Could not fetch weather data'
          : 'Set OPENWEATHER_API_KEY to enable live weather',
    });
  }
  res.json({ success: true, available: true, data });
}
