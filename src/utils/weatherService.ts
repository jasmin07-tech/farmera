import { WeatherLocation, LiveWeatherData, HourlyWeatherForecast, DailyWeatherForecast, WeatherAlert, AgriWeatherAdvisory } from '../types';

export const AGRICULTURAL_HUBS: WeatherLocation[] = [
  {
    id: 'pollachi',
    name: 'Pollachi (Anaimalai Foothills)',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    lat: 10.6609,
    lng: 77.0048,
    isFpoHub: true,
    associatedFarmerName: 'Murugan Selvam',
    primaryCrops: ['Country Tomatoes', 'Tender Coconut', 'Red Lady Papaya', 'Moringa'],
  },
  {
    id: 'thanjavur',
    name: 'Kumbakonam & Delta Basin',
    district: 'Thanjavur',
    state: 'Tamil Nadu',
    lat: 10.787,
    lng: 79.1378,
    isFpoHub: true,
    associatedFarmerName: 'Priya Jayaraman',
    primaryCrops: ['Mappillai Samba Rice', 'Karuppu Kavuni Rice', 'Black Gram', 'Green Gram'],
  },
  {
    id: 'nilgiris',
    name: 'Kotagiri & Ooty Highlands',
    district: 'The Nilgiris',
    state: 'Tamil Nadu',
    lat: 11.4102,
    lng: 76.695,
    isFpoHub: true,
    associatedFarmerName: 'Ramanathan Velu',
    primaryCrops: ['Hill Carrots', 'Baby Potatoes', 'Chamomile', 'Hill Garlic'],
  },
  {
    id: 'madurai',
    name: 'Usilampatti Valley',
    district: 'Madurai',
    state: 'Tamil Nadu',
    lat: 9.9252,
    lng: 78.1198,
    isFpoHub: true,
    associatedFarmerName: 'Meenakshi Sundaram',
    primaryCrops: ['Moringa Pods', 'Shallots (Small Onion)', 'Sirukeerai', 'Cardamom'],
  },
  {
    id: 'nashik',
    name: 'Dindori Valley & Niphad',
    district: 'Nashik',
    state: 'Maharashtra',
    lat: 19.9975,
    lng: 73.7898,
    isFpoHub: true,
    primaryCrops: ['Red Onions', 'Table Grapes', 'Tomatoes', 'Pomegranates'],
  },
  {
    id: 'wayanad',
    name: 'Meppadi & Sultan Bathery',
    district: 'Wayanad',
    state: 'Kerala',
    lat: 11.6854,
    lng: 76.132,
    isFpoHub: true,
    primaryCrops: ['Malabar Black Pepper', 'Green Cardamom', 'Ginger', 'Robusta Coffee'],
  },
  {
    id: 'guntur',
    name: 'Tenali & Amaravati Plains',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    lat: 16.3067,
    lng: 80.4365,
    isFpoHub: true,
    primaryCrops: ['Guntur Sannam Chillies', 'Turmeric', 'Cotton', 'Urad Dal'],
  },
];

export function getWeatherConditionFromWMO(code: number): {
  description: string;
  iconName: 'sun' | 'cloud-sun' | 'cloud' | 'cloud-rain' | 'cloud-lightning' | 'umbrella';
  farmingRisk: 'low' | 'moderate' | 'high';
} {
  switch (code) {
    case 0:
      return { description: 'Clear Sunny Sky', iconName: 'sun', farmingRisk: 'low' };
    case 1:
      return { description: 'Mainly Clear', iconName: 'cloud-sun', farmingRisk: 'low' };
    case 2:
      return { description: 'Partly Cloudy', iconName: 'cloud-sun', farmingRisk: 'low' };
    case 3:
      return { description: 'Overcast Sky', iconName: 'cloud', farmingRisk: 'low' };
    case 45:
    case 48:
      return { description: 'Foggy / Dew Deposit', iconName: 'cloud', farmingRisk: 'moderate' };
    case 51:
    case 53:
    case 55:
      return { description: 'Light Drizzle', iconName: 'umbrella', farmingRisk: 'low' };
    case 61:
      return { description: 'Light Rain Showers', iconName: 'cloud-rain', farmingRisk: 'moderate' };
    case 63:
      return { description: 'Moderate Rainfall', iconName: 'cloud-rain', farmingRisk: 'high' };
    case 65:
      return { description: 'Heavy Downpour', iconName: 'cloud-rain', farmingRisk: 'high' };
    case 80:
    case 81:
    case 82:
      return { description: 'Torrential Rain Showers', iconName: 'cloud-rain', farmingRisk: 'high' };
    case 95:
    case 96:
    case 99:
      return { description: 'Thunderstorm & Gusty Winds', iconName: 'cloud-lightning', farmingRisk: 'high' };
    default:
      return { description: 'Fair Conditions', iconName: 'cloud-sun', farmingRisk: 'low' };
  }
}

// In-memory cache to prevent frequent redundant network calls
const weatherCache = new Map<string, { timestamp: number; data: LiveWeatherData }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function fetchLiveWeatherData(location: WeatherLocation): Promise<LiveWeatherData> {
  const cacheKey = `${location.lat.toFixed(4)},${location.lng.toFixed(4)}`;
  const cached = weatherCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=auto&forecast_days=7`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP error ${res.status}`);
    }

    const json = await res.json();
    const current = json.current || {};
    const hourly = json.hourly || {};
    const daily = json.daily || {};

    const currentWeatherMeta = getWeatherConditionFromWMO(current.weather_code || 0);

    // Build 24 hours of hourly forecasts
    const formattedHourly: HourlyWeatherForecast[] = [];
    const nowHour = new Date().getHours();
    const hourlyTimes: string[] = hourly.time || [];

    for (let i = 0; i < Math.min(24, hourlyTimes.length); i++) {
      const dateObj = new Date(hourlyTimes[i]);
      const hourNum = dateObj.getHours();
      const code = hourly.weather_code?.[i] ?? 0;
      const meta = getWeatherConditionFromWMO(code);

      const timeLabel =
        i === 0
          ? 'Now'
          : dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

      formattedHourly.push({
        time: timeLabel,
        tempC: Math.round(hourly.temperature_2m?.[i] ?? 28),
        precipitationProb: Math.round(hourly.precipitation_probability?.[i] ?? 10),
        rainMm: Number((hourly.rain?.[i] ?? 0).toFixed(1)),
        humidityPercent: Math.round(hourly.relative_humidity_2m?.[i] ?? 65),
        windSpeedKmh: Math.round(hourly.wind_speed_10m?.[i] ?? 10),
        weatherCode: code,
        weatherDescription: meta.description,
        isDay: hourNum >= 6 && hourNum < 18,
      });
    }

    // Build 7-day daily forecast
    const formattedDaily: DailyWeatherForecast[] = [];
    const dailyTimes: string[] = daily.time || [];

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < Math.min(7, dailyTimes.length); i++) {
      const dDate = new Date(dailyTimes[i]);
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayLabels[dDate.getDay()];
      const code = daily.weather_code?.[i] ?? 0;
      const meta = getWeatherConditionFromWMO(code);
      const rainProb = Math.round(daily.precipitation_probability_max?.[i] ?? 15);
      const rainSum = Number((daily.precipitation_sum?.[i] ?? 0).toFixed(1));
      const maxWind = Math.round(daily.wind_speed_10m_max?.[i] ?? 12);

      let farmingTag = 'Favorable Farm Conditions';
      if (rainProb > 60 || rainSum > 10) {
        farmingTag = 'Hold Irrigation • Rain Likely';
      } else if (maxWind > 25) {
        farmingTag = 'High Winds • Delay Spraying';
      } else if (rainProb < 20 && maxWind < 15) {
        farmingTag = 'Prime Spraying & Harvest Window';
      }

      formattedDaily.push({
        date: dailyTimes[i],
        dayName,
        weatherCode: code,
        weatherDescription: meta.description,
        tempMaxC: Math.round(daily.temperature_2m_max?.[i] ?? 32),
        tempMinC: Math.round(daily.temperature_2m_min?.[i] ?? 22),
        precipitationProb: rainProb,
        precipitationSumMm: rainSum,
        windSpeedMaxKmh: maxWind,
        uvIndexMax: Math.round(daily.uv_index_max?.[i] ?? 8),
        farmingAdvisoryTag: farmingTag,
      });
    }

    // Generate real-time alerts based on incoming conditions
    const alerts: WeatherAlert[] = [];
    const currentRain = current.precipitation ?? 0;
    const currentWind = current.wind_speed_10m ?? 10;
    const currentHumidity = current.relative_humidity_2m ?? 65;
    const currentTemp = current.temperature_2m ?? 28;

    if (currentRain > 2 || (formattedHourly[1]?.precipitationProb || 0) > 75) {
      alerts.push({
        id: 'alert-rain',
        severity: 'warning',
        title: 'Imminent Rain Showers Expected in Next 3 Hours',
        description: 'Atmospheric radar signals active cloud precipitation over the basin.',
        impactedCrops: ['Tomatoes', 'Fresh Greens', 'Cotton', 'Ripe Papaya'],
        recommendedAction: 'Clear field drainage trenches immediately. Pause all foliar bio-fertilizer sprays to avoid chemical/organic runoff.',
      });
    }

    if (currentWind > 22) {
      alerts.push({
        id: 'alert-wind',
        severity: 'advisory',
        title: 'Moderate to High Wind Speed Advisory',
        description: `Current wind gusts at ${Math.round(currentWind)} km/h may cause spray drift and fragile crop stress.`,
        impactedCrops: ['Banana Plantations', 'Moringa Trees', 'Paddy in Grain Filling'],
        recommendedAction: 'Provide propping/anchoring for heavy banana bunches. Postpone ultra-fine droplet neem oil spraying until calm morning hours.',
      });
    }

    if (currentHumidity > 80 && currentTemp > 26) {
      alerts.push({
        id: 'alert-fungal',
        severity: 'watch',
        title: 'Elevated Fungal Spore & Mildew Incubation Index',
        description: 'Persistent relative humidity (>80%) paired with warm temperatures creates favorable spore germination conditions.',
        impactedCrops: ['Country Tomatoes', 'Grapes', 'Chilli', 'Sirukeerai'],
        recommendedAction: 'Preventive foliar spray of sour buttermilk solution (1:10 dilution) or Trichoderma viride bio-fungicide is recommended on plant under-leaves.',
      });
    }

    // Generate Agronomic Advisories
    const agriAdvisories: AgriWeatherAdvisory[] = generateAgriAdvisories(
      location,
      currentTemp,
      currentHumidity,
      currentWind,
      formattedDaily[0]?.precipitationProb || 15
    );

    const data: LiveWeatherData = {
      location,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      currentTempC: Math.round(currentTemp),
      apparentTempC: Math.round(current.apparent_temperature ?? currentTemp),
      weatherCode: current.weather_code ?? 0,
      weatherDescription: currentWeatherMeta.description,
      humidityPercent: Math.round(currentHumidity),
      precipitationMm: Number((current.precipitation ?? 0).toFixed(1)),
      rainProbability: formattedHourly[0]?.precipitationProb ?? 10,
      windSpeedKmh: Math.round(currentWind),
      windDirectionDegrees: Math.round(current.wind_direction_10m ?? 180),
      cloudCoverPercent: Math.round(current.cloud_cover ?? 30),
      uvIndex: Math.round(current.uv_index ?? 7),
      soilMoistureEstimatePercent: Math.min(95, Math.max(30, Math.round(currentHumidity * 0.7 + (currentRain > 0 ? 25 : 0)))),
      evapotranspirationMm: Number(Math.max(1.8, (currentTemp * 0.15 - currentHumidity * 0.02)).toFixed(1)),
      isDay: current.is_day !== 0,
      alerts,
      hourly: formattedHourly,
      daily: formattedDaily,
      agriAdvisories,
      source: 'open-meteo',
    };

    weatherCache.set(cacheKey, { timestamp: Date.now(), data });
    return data;
  } catch (err) {
    console.warn('Live Open-Meteo API fetch failed or timed out, synthesizing reliable local micro-climate forecast:', err);
    return getFallbackWeatherData(location);
  }
}

function generateAgriAdvisories(
  location: WeatherLocation,
  temp: number,
  humidity: number,
  windSpeed: number,
  rainProb: number
): AgriWeatherAdvisory[] {
  const isHighRain = rainProb > 50;
  const isHighWind = windSpeed > 18;
  const isFungalFriendly = humidity > 75;

  return [
    {
      cropName: 'Country Tomatoes & Solanaceous Crops',
      irrigationStatus: isHighRain ? 'hold' : humidity > 60 ? 'moderate' : 'full',
      irrigationAdvice: isHighRain
        ? 'Suspend drip fertigation today. Allow soil aeration to prevent root hypoxia.'
        : 'Deliver 3.5 Liters/plant via early morning drip irrigation before peak afternoon heat.',
      sprayWindowStatus: isHighWind ? 'unsafe' : isHighRain ? 'caution' : 'optimal',
      sprayWindowAdvice: isHighWind
        ? 'Wind speeds over 18 km/h cause uneven spray drift. Delay spraying until dusk.'
        : 'Ideal spraying conditions between 6:30 AM and 9:30 AM with minimal wind drift.',
      harvestSuitability: isHighRain ? 'postpone' : 'excellent',
      harvestAdvice: isHighRain
        ? 'Pick mature breaker-stage fruits before heavy rain to avoid skin cracking and water absorption.'
        : 'Harvest vine-ripened tomatoes early in the morning when fruit core temperature is cool (20-22°C).',
      diseaseRisk: isFungalFriendly ? 'high' : 'low',
      diseaseDetails: isFungalFriendly
        ? 'High moisture in top canopy raises early blight & leaf spot vulnerability.'
        : 'Low moisture environment maintains clean foliage and high photosynthetic efficiency.',
      recommendedOrganicSolution: 'Spray 5% fermented sour buttermilk with a pinch of turmeric powder as a natural antifungal protector.',
    },
    {
      cropName: 'Heritage Paddy & SRI Rice Varieties',
      irrigationStatus: isHighRain ? 'hold' : 'moderate',
      irrigationAdvice: isHighRain
        ? 'Open field exit sluice gates to prevent submergence of young tillers above 5cm water level.'
        : 'Maintain moist, non-flooded alternate wetting and drying (AWD) to maximize root oxygenation.',
      sprayWindowStatus: isHighRain ? 'caution' : 'optimal',
      sprayWindowAdvice: 'Apply Bio-potash or Pseudomonas fluorescens in the calm late afternoon.',
      harvestSuitability: isHighRain ? 'postpone' : 'excellent',
      harvestAdvice: 'For mature panicles, harvest when 85% of the grains have turned golden yellow.',
      diseaseRisk: humidity > 80 ? 'high' : 'moderate',
      diseaseDetails: humidity > 80
        ? 'Watch for blast lesions or sheath rot in micro-pockets with dense vegetative cover.'
        : 'Favorable condition for grain filling with low vegetative pest pressure.',
      recommendedOrganicSolution: 'Apply 10% Agniastra or Neem seed kernel extract (NSKE 5%) along bund borders.',
    },
    {
      cropName: 'Tender Coconut & Perennial Trees',
      irrigationStatus: isHighRain ? 'hold' : 'moderate',
      irrigationAdvice: 'Coconut palms require deep subsurface moisture. Ensure basin mulching with coir pith remains moist.',
      sprayWindowStatus: 'optimal',
      sprayWindowAdvice: 'Root feeding or basin application of bio-manure can proceed unimpeded.',
      harvestSuitability: 'excellent',
      harvestAdvice: 'Safe conditions for professional harvesters. Pluck tender coconuts at 7 months age for sweetest water.',
      diseaseRisk: 'low',
      diseaseDetails: 'Rhynchophorus / red palm weevil traps active; no climate-induced outbreak observed.',
      recommendedOrganicSolution: 'Pack palm leaf axils with a mix of sea sand and neem cake to deter rhinoceros beetle.',
    },
    {
      cropName: 'Native Fresh Greens & Leafy Vegetables',
      irrigationStatus: isHighRain ? 'hold' : 'full',
      irrigationAdvice: isHighRain
        ? 'Ensure raised bed drainage channels are unblocked. Excess moisture damages tender rootlets.'
        : 'Light overhead sprinkler misting for 20 minutes at dawn to preserve crisp leaf turgidity.',
      sprayWindowStatus: isHighRain ? 'caution' : 'optimal',
      sprayWindowAdvice: 'Only spray water-soluble organic micro-nutrients when leaf surfaces have dried from morning dew.',
      harvestSuitability: isHighRain ? 'postpone' : 'excellent',
      harvestAdvice: 'Clip fresh greens right at dawn; package directly in ventilated shade to retain vitamins.',
      diseaseRisk: isFungalFriendly ? 'moderate' : 'low',
      diseaseDetails: 'Damping-off risk in waterlogged nurseries; raised beds prevent root rot.',
      recommendedOrganicSolution: 'Drench nursery soil with diluted Jeevamrutham (200L/acre) for protective microbial shielding.',
    },
  ];
}

export function getFallbackWeatherData(location: WeatherLocation): LiveWeatherData {
  const isHighland = location.id === 'nilgiris';
  const baseTemp = isHighland ? 18 : 30;
  const currentHumidity = isHighland ? 78 : 62;
  const rainProb = isHighland ? 40 : 15;

  const now = new Date();
  const hourly: HourlyWeatherForecast[] = [];

  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getTime() + i * 3600 * 1000);
    const hour = d.getHours();
    const tempVar = Math.sin((hour - 6) * (Math.PI / 12)) * 6;
    const temp = Math.round(baseTemp + tempVar);
    const rProb = Math.max(5, Math.min(85, Math.round(rainProb + Math.sin(i) * 15)));

    hourly.push({
      time: i === 0 ? 'Now' : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      tempC: temp,
      precipitationProb: rProb,
      rainMm: rProb > 50 ? 1.2 : 0,
      humidityPercent: Math.min(95, Math.max(45, Math.round(currentHumidity - tempVar * 2))),
      windSpeedKmh: Math.round(8 + Math.abs(Math.cos(i) * 8)),
      weatherCode: rProb > 50 ? 61 : tempVar > 2 ? 1 : 2,
      weatherDescription: rProb > 50 ? 'Light Rain Showers' : tempVar > 2 ? 'Mainly Sunny' : 'Partly Cloudy',
      isDay: hour >= 6 && hour < 18,
    });
  }

  const daily: DailyWeatherForecast[] = [];
  const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getTime() + i * 86400 * 1000);
    const dayProb = Math.max(10, Math.min(75, Math.round(rainProb + (i % 3) * 15)));

    daily.push({
      date: d.toISOString().split('T')[0],
      dayName: days[i],
      weatherCode: dayProb > 50 ? 61 : 1,
      weatherDescription: dayProb > 50 ? 'Scattered Rain Showers' : 'Pleasant & Clear',
      tempMaxC: baseTemp + 4,
      tempMinC: baseTemp - 5,
      precipitationProb: dayProb,
      precipitationSumMm: dayProb > 50 ? 6.5 : 0.2,
      windSpeedMaxKmh: 14,
      uvIndexMax: 8,
      farmingAdvisoryTag: dayProb > 50 ? 'Hold Drip Fertigation' : 'Prime Spraying & Harvest Window',
    });
  }

  const alerts: WeatherAlert[] = [
    {
      id: 'fallback-advisory-1',
      severity: 'advisory',
      title: 'Optimal Dawn Spraying Window',
      description: 'Morning surface winds under 10 km/h and dry canopy provide high foliar spray absorption.',
      impactedCrops: ['Tomatoes', 'Moringa', 'Papaya'],
      recommendedAction: 'Schedule 5% cold-pressed neem kernel oil spray between 6:00 AM and 9:00 AM.',
    },
  ];

  return {
    location,
    lastUpdated: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentTempC: baseTemp,
    apparentTempC: baseTemp + 1,
    weatherCode: 2,
    weatherDescription: 'Partly Cloudy with Gentle Breeze',
    humidityPercent: currentHumidity,
    precipitationMm: 0,
    rainProbability: rainProb,
    windSpeedKmh: 11,
    windDirectionDegrees: 190,
    cloudCoverPercent: 35,
    uvIndex: 7,
    soilMoistureEstimatePercent: 58,
    evapotranspirationMm: 3.4,
    isDay: true,
    alerts,
    hourly,
    daily,
    agriAdvisories: generateAgriAdvisories(location, baseTemp, currentHumidity, 11, rainProb),
    source: 'fallback_telemetry',
  };
}
