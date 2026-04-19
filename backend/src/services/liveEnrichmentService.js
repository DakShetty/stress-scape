/**
 * Live Enrichment Service
 * Aggregates urban stress metrics from global API providers.
 */

const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';
const WAQI_BASE = 'https://api.waqi.info/feed';
const TOMTOM_BASE = 'https://api.tomtom.com/traffic/services/4/flowSegmentData';

/**
 * Fetch Air Quality from WAQI (aqicn.org)
 * Returns { aqi: number, sources: string[] }
 */
async function fetchLiveAqi(lat, lon) {
  const token = process.env.WAQI_TOKEN;
  if (!token) return null;

  try {
    const url = `${WAQI_BASE}/geo:${lat};${lon}/?token=${token}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'ok') return null;

    return {
      aqi: data.data.aqi,
      pm25: data.data.iaqi?.pm25?.v,
      pm10: data.data.iaqi?.pm10?.v,
      source: 'WAQI'
    };
  } catch (err) {
    console.error('WAQI Error:', err.message);
    return null;
  }
}

/**
 * Fetch Traffic Flow from TomTom
 * Returns { crowdDensity: number (0-100) }
 */
async function fetchLiveTraffic(lat, lon) {
  const key = process.env.TOMTOM_API_KEY;
  if (!key) return null;

  try {
    // We use a 100m zoomed segment around the point
    const url = `${TOMTOM_BASE}/absolute/10/json?point=${lat},${lon}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    
    if (!data.flowSegmentData) return null;

    const { currentSpeed, freeFlowSpeed } = data.flowSegmentData;
    if (freeFlowSpeed === 0) return 0;

    // Congestion as % of speed loss
    // 100% loss = speed is 0 (max crowd)
    // 0% loss = free flow (min crowd)
    const congestion = Math.max(0, Math.min(100, Math.round((1 - currentSpeed / freeFlowSpeed) * 100)));
    
    return {
      crowdDensity: congestion,
      source: 'TomTom'
    };
  } catch (err) {
    console.error('TomTom Error:', err.message);
    return null;
  }
}

/**
 * Fetch Weather from OpenWeather
 */
async function fetchLiveWeather(lat, lon) {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return null;

  try {
    const url = `${OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    
    return {
      temperature: data.main?.temp,
      humidity: data.main?.humidity,
      description: data.weather?.[0]?.description,
      source: 'OpenWeather'
    };
  } catch (err) {
    console.error('OpenWeather Error:', err.message);
    return null;
  }
}

/**
 * Master Enrichment function
 */
export async function enrichCoordinates(lat, lon) {
  const [aqiData, trafficData, weatherData] = await Promise.all([
    fetchLiveAqi(lat, lon),
    fetchLiveTraffic(lat, lon),
    fetchLiveWeather(lat, lon)
  ]);

  // Noise simulation (still heuristic as free noise APIs are rare)
  // We base noise on traffic congestion: high congestion = high noise
  const trafficImpact = trafficData?.crowdDensity || 50;
  const simulatedNoise = Math.max(30, Math.min(95, Math.round(40 + (trafficImpact * 0.55))));

  return {
    aqi: aqiData?.aqi,
    temperature: weatherData?.temperature,
    crowdDensity: trafficData?.crowdDensity,
    noiseLevel: simulatedNoise,
    sources: {
      aqi: aqiData?.source || 'Synthetic',
      traffic: trafficData?.source || 'Synthetic',
      weather: weatherData?.source || 'Synthetic'
    }
  };
}
