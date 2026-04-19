/**
 * Optional OpenWeatherMap integration for third-party weather/AQI context.
 * Without API key, returns null (frontend uses DB values).
 */

const BASE = 'https://api.openweathermap.org/data/2.5';

export async function fetchWeatherSnapshot(lat, lon) {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return null;

  try {
    const weatherUrl = `${BASE}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
    const airUrl = `${BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`;
    const [wRes, aRes] = await Promise.all([fetch(weatherUrl), fetch(airUrl)]);
    if (!wRes.ok || !aRes.ok) return null;
    const weather = await wRes.json();
    const air = await aRes.json();
    const aqiIndex = air.list?.[0]?.main?.aqi;
    const components = air.list?.[0]?.components || {};
    const estimatedAqi =
      typeof components.pm2_5 === 'number'
        ? Math.min(500, Math.round(components.pm2_5 * 2 + (components.pm10 || 0) * 0.5))
        : null;
    return {
      source: 'openweathermap',
      temperature: weather.main?.temp,
      feelsLike: weather.main?.feels_like,
      humidity: weather.main?.humidity,
      description: weather.weather?.[0]?.description,
      openWeatherAqiIndex: aqiIndex,
      estimatedAqiFromComponents: estimatedAqi,
    };
  } catch {
    return null;
  }
}
