import { GoogleGenerativeAI } from '@google/generative-ai';

// Smart rule-based engine — context-aware advice from real sensor data
function ruleBasedAdvice(plan, aqi, temp, crowd, noise, stress) {
  const aqiN = Number(aqi) || 0;
  const tempN = Number(temp) || 28;
  const crowdN = Number(crowd) || 50;
  const noiseN = Number(noise) || 50;
  const planLower = (plan || '').toLowerCase();

  let risk = 'Low';
  let points = [];

  // AQI
  if (aqiN > 200) {
    risk = 'High';
    points.push(`AQI is severely unhealthy at ${aqiN}. Wear an N95 mask and avoid prolonged outdoor exposure.`);
  } else if (aqiN > 150) {
    risk = 'High';
    points.push(`AQI is unhealthy at ${aqiN}. People with respiratory conditions should stay indoors.`);
  } else if (aqiN > 100) {
    if (risk === 'Low') risk = 'Medium';
    points.push(`AQI is moderate at ${aqiN}. Sensitive individuals should limit extended outdoor activity.`);
  } else {
    points.push(`Air quality is good (AQI ${aqiN}) — no air pollution concerns.`);
  }

  // Temperature
  if (tempN > 38) {
    risk = 'High';
    points.push(`Extreme heat at ${tempN}°C — heat stroke risk is high. Avoid outdoor exertion between 11am–4pm and stay hydrated.`);
  } else if (tempN > 34) {
    if (risk === 'Low') risk = 'Medium';
    points.push(`High temperature (${tempN}°C). Carry water, wear light clothing, and avoid prolonged sun exposure.`);
  } else {
    points.push(`Temperature is comfortable at ${tempN}°C.`);
  }

  // Crowd
  if (crowdN > 85) {
    if (risk === 'Low') risk = 'Medium';
    points.push(`Very high crowd density (${crowdN}%). Expect congestion — consider visiting during off-peak hours.`);
  } else if (crowdN > 65) {
    points.push(`Moderate crowd levels (${crowdN}%). Allow extra time for travel.`);
  } else {
    points.push(`Crowd density is low (${crowdN}%) — area is relatively uncrowded.`);
  }

  // Noise
  if (noiseN > 80) {
    points.push(`High noise pollution level (${noiseN} dB). Consider noise-canceling headphones or avoiding prolonged exposure if sensitive to sound.`);
  } else if (noiseN > 65) {
    points.push(`Moderate urban noise (${noiseN} dB) — typical for commercial areas.`);
  } else {
    points.push('Acoustic environment is relatively quiet and pleasant.');
  }

  // Plan-specific advice
  if (planLower.includes('jog') || planLower.includes('run') || planLower.includes('exercise') || planLower.includes('workout')) {
    if (aqiN > 150) {
      risk = 'High';
      points.push('Outdoor exercise is NOT recommended due to poor air quality. Switch to an indoor gym today.');
    } else if (tempN > 35) {
      points.push('If you must exercise, go before 8am to avoid peak heat. Bring extra water.');
    } else {
      points.push('Conditions are suitable for jogging. Warm up first and maintain hydration.');
    }
  }

  if (planLower.includes('asthma') || planLower.includes('respiratory') || planLower.includes('lung')) {
    if (aqiN > 100) {
      risk = 'High';
      points.push('As someone with a respiratory condition, this AQI level poses a direct health risk. Stay indoors or use a mask.');
    }
  }

  if (planLower.includes('child') || planLower.includes('kid') || planLower.includes('elderly') || planLower.includes('senior') || planLower.includes('family')) {
    if (aqiN > 150 || tempN > 37) {
      risk = 'High';
      points.push('Children and elderly are more vulnerable to heat and pollution — extra caution strongly advised under these conditions.');
    } else if (aqiN > 100 || tempN > 34) {
      if (risk === 'Low') risk = 'Medium';
      points.push('With family members, take extra precautions — carry water and limit time in direct sun.');
    }
  }

  if (planLower.includes('commute') || planLower.includes('drive') || planLower.includes('travel')) {
    if (crowdN > 75) {
      points.push('Heavy traffic and congestion expected. Use navigation apps and plan for delays.');
    }
  }

  if (planLower.includes('picnic') || planLower.includes('outing') || planLower.includes('outdoor') || planLower.includes('event')) {
    if (aqiN > 150 || tempN > 35) {
      risk = risk === 'Low' ? 'Medium' : risk;
      points.push('Outdoor events may be uncomfortable under current conditions. Consider rescheduling or moving indoors.');
    } else {
      points.push('Conditions are suitable for an outdoor event. Bring sun protection.');
    }
  }

  return { advice: points.join(' '), risk };
}

export const handleAdvice = async (req, res, next) => {
  try {
    const { plan, aqi, temp, crowd, noise, stress } = req.body;

    // Try Gemini API first if key available
    if (process.env.GEMINI_API_KEY) {
      const apiKey = process.env.GEMINI_API_KEY.trim().replace(/^["']|["']$/g, '');
      try {
        console.log(`[Diagnostic] Gemini Key Length: ${apiKey.length}, Starts with: ${apiKey.slice(0, 5)}...`);
        const ai = new GoogleGenerativeAI(apiKey);
        
        const promptText = `You are an expert Urban Health & Safety Advisor. 
Current Sensor Context (Live WAQI/TomTom data):
- Air Quality (AQI): ${aqi}
- Temperature: ${temp}°C
- People Density: ${crowd}%
- Noise Level: ${noise} dB
- Calculated Stress Index: ${stress}/100

User's Plan: "${plan}"

Analyze the variables and provide a UNIQUE, empathetic, and highly practical health recommendation. 
Avoid generic phrases. Use a professional yet conversational tone.
Respond ONLY as a JSON object: {"advice": "your personalized advice here", "risk": "Low" | "Medium" | "High"}`;

        // Attempt generation with a broader fallback model strategy
        let result;
        const modelsToTry = [
          'gemini-flash-latest', 
          'gemini-2.5-flash', 
          'gemini-pro-latest'
        ];
        let success = false;
        let lastError = '';

        for (const modelName of modelsToTry) {
          try {
            console.log(`Trying Gemini model: ${modelName}...`);
            const model = ai.getGenerativeModel({ model: modelName });
            result = await model.generateContent(promptText);
            success = true;
            console.log(`Success with model: ${modelName}`);
            break; 
          } catch (err) {
            lastError = `Status ${err.status} - ${err.message?.slice(0, 150)}`;
            console.warn(`Model ${modelName} failed: ${lastError}`);
          }
        }

        if (!success) {
          throw new Error(lastError);
        }

        const response = await result.response;
        let rawText = response.text()
          .replace(/^```(json)?\n?/i, '').replace(/\n?```\s*$/i, '').trim();

        let outJson;
        try { outJson = JSON.parse(rawText); }
        catch { const m = rawText.match(/\{[\s\S]*\}/); if (m) outJson = JSON.parse(m[0]); }

        if (outJson?.advice) return res.json(outJson);
      } catch (apiErr) {
        console.error('GEMINI_ERROR:', apiErr.message);

        // Perform a direct REST API call to check what models are ACTUALLY allowed for this key
        let availableModelsList = '';
        try {
          const fetchRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          const fetchJson = await fetchRes.json();
          if (fetchJson.error) {
              availableModelsList = `REST Error: ${fetchJson.error.message}`;
          } else {
             const models = fetchJson.models?.map(m => m.name).join(', ') || 'No models listed';
             availableModelsList = `Allowed: ${models}`;
          }
        } catch (fetchE) {
             availableModelsList = `Fetch error: ${fetchE.message}`;
        }
        
        const fallback = ruleBasedAdvice(plan, aqi, temp, crowd, noise, stress);
        return res.json({
            ...fallback,
            debugError: `SDK Err: ${apiErr.message} | ${availableModelsList}`
        });
      }
    }

    // Rule-based fallback (if no key is set at all)
    return res.json(ruleBasedAdvice(plan, aqi, temp, crowd, noise, stress));

  } catch (error) {
    console.error('Advice error:', error?.message);
    res.json({ advice: 'Unable to fetch smart advice right now. Please try again.', risk: 'Unknown' });
  }
};
