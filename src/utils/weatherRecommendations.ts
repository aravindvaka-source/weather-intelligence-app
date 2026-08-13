import { WeatherData, SmartRecommendation, TempUnit, WindUnit } from '../types/weather';
import { getWMODetails } from './wmoCodes';

export function generateRecommendations(data: WeatherData): SmartRecommendation[] {
  const recommendations: SmartRecommendation[] = [];
  const current = data.current_weather;
  const tempC = current.temperature;
  const windKmh = current.windspeed;
  const weatherCode = current.weathercode;
  const wmo = getWMODetails(weatherCode);

  const todayMaxC = data.daily.temperature_2m_max?.[0] ?? tempC;
  const todayMinC = data.daily.temperature_2m_min?.[0] ?? tempC;
  const precipSum = data.daily.precipitation_sum?.[0] ?? 0;
  const precipProb = data.daily.precipitation_probability_max?.[0] ?? 0;
  const uvMax = data.daily.uv_index_max?.[0] ?? 0;

  // 1. Fitness & Outdoor Activities
  if (wmo.category === 'thunderstorm' || weatherCode >= 95) {
    recommendations.push({
      id: 'fit-thunderstorm',
      category: 'fitness',
      title: 'Indoor Workout Advisory',
      description: 'Thunderstorms present lightning hazard. Postpone outdoor runs and switch to indoor cardio or strength training.',
      level: 'alert',
      iconName: 'Zap',
    });
  } else if (precipSum > 2 || precipProb > 60 || ['rain', 'drizzle'].includes(wmo.category)) {
    recommendations.push({
      id: 'fit-rain',
      category: 'fitness',
      title: 'Rainy Outdoor Activity',
      description: `Rain expected (${precipSum.toFixed(1)} mm, ${precipProb}% chance). Choose indoor gym session or gear up with waterproof trail shoes.`,
      level: 'warning',
      iconName: 'CloudRain',
    });
  } else if (tempC >= 12 && tempC <= 23 && windKmh < 25) {
    recommendations.push({
      id: 'fit-great',
      category: 'fitness',
      title: 'Optimal Running & Cycling Weather',
      description: 'Comfortable temperature and gentle breeze make it ideal for long outdoor runs, cycling, or park walks.',
      level: 'success',
      iconName: 'Activity',
    });
  } else if (tempC > 30) {
    recommendations.push({
      id: 'fit-heat',
      category: 'fitness',
      title: 'High Heat Fitness Caution',
      description: 'Elevated temperatures above 30°C. Schedule workouts early in the morning or evening, and hydrate frequently.',
      level: 'warning',
      iconName: 'Flame',
    });
  } else if (tempC < 5) {
    recommendations.push({
      id: 'fit-cold',
      category: 'fitness',
      title: 'Cold Weather Running',
      description: 'Chilly conditions outside. Warm up thoroughly indoors and wear moisture-wicking thermal base layers.',
      level: 'info',
      iconName: 'ThermometerSnowflake',
    });
  } else {
    recommendations.push({
      id: 'fit-moderate',
      category: 'fitness',
      title: 'Good Conditions for Outdoors',
      description: 'Fair weather for casual outdoor exercises and walking around town.',
      level: 'info',
      iconName: 'Smile',
    });
  }

  // 2. Apparel & Gear Recommendations
  if (precipSum > 0.5 || precipProb > 30 || ['rain', 'drizzle', 'thunderstorm'].includes(wmo.category)) {
    recommendations.push({
      id: 'gear-umbrella',
      category: 'apparel',
      title: 'Bring an Umbrella Today',
      description: `Precipitation probability is ${precipProb}%. Pack a compact umbrella or rain shell when leaving home.`,
      level: precipProb > 50 ? 'warning' : 'info',
      iconName: 'Umbrella',
    });
  } else {
    recommendations.push({
      id: 'gear-no-rain',
      category: 'apparel',
      title: 'Dry Conditions Ahead',
      description: 'Minimal chance of precipitation today. No umbrella needed.',
      level: 'success',
      iconName: 'Sun',
    });
  }

  // Cold / Warm Clothing
  if (tempC <= 0) {
    recommendations.push({
      id: 'apparel-freezing',
      category: 'apparel',
      title: 'Sub-Zero Heavy Winter Gear',
      description: 'Freezing temperatures! Wear heavy insulated coat, beanie, thermal gloves, and insulated boots.',
      level: 'alert',
      iconName: 'Shirt',
    });
  } else if (tempC <= 10) {
    recommendations.push({
      id: 'apparel-cold',
      category: 'apparel',
      title: 'Layer Up in Cold Weather',
      description: 'Temps under 10°C. A warm jacket, scarf, and long pants are recommended.',
      level: 'info',
      iconName: 'Shirt',
    });
  } else if (tempC >= 24) {
    recommendations.push({
      id: 'apparel-warm',
      category: 'apparel',
      title: 'Light & Breathable Clothing',
      description: 'Warm conditions ahead. Wear breathable cotton/linen fabrics, sunglasses, and comfortable footwear.',
      level: 'info',
      iconName: 'SunMedium',
    });
  }

  // Sun Protection / UV
  if (uvMax >= 6) {
    recommendations.push({
      id: 'health-uv',
      category: 'health',
      title: `High UV Exposure Alert (UV ${uvMax.toFixed(1)})`,
      description: 'Strong ultraviolet radiation around midday. Apply SPF 30+ sunscreen, wear UV sunglasses and a brimmed hat.',
      level: 'warning',
      iconName: 'Sun',
    });
  }

  // 3. Wind & Travel Safety
  if (windKmh >= 35) {
    recommendations.push({
      id: 'safety-wind',
      category: 'safety',
      title: `High Wind Caution (${windKmh} km/h)`,
      description: 'Brisk wind gusts detected. Secure loose outdoor outdoor furniture and take caution while driving on high bridges.',
      level: 'warning',
      iconName: 'Wind',
    });
  }

  // Fog & Visibility
  if (wmo.category === 'fog') {
    recommendations.push({
      id: 'safety-fog',
      category: 'safety',
      title: 'Low Visibility Fog Warning',
      description: 'Dense fog lowers road visibility. Drive with low-beam headlights and maintain safe braking distance.',
      level: 'warning',
      iconName: 'EyeOff',
    });
  }

  // Ice / Snow Travel
  if (wmo.category === 'snow' || weatherCode === 56 || weatherCode === 57 || weatherCode === 66 || weatherCode === 67) {
    recommendations.push({
      id: 'safety-snow',
      category: 'safety',
      title: 'Slick Road Hazard',
      description: 'Snow or freezing precipitation creates icy roads. Drive cautiously and wear high-traction winter shoes.',
      level: 'alert',
      iconName: 'AlertTriangle',
    });
  }

  return recommendations;
}

export function convertTemp(celsius: number, unit: TempUnit): number {
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatTemp(celsius: number, unit: TempUnit): string {
  const converted = convertTemp(celsius, unit);
  return `${converted}°${unit}`;
}

export function convertSpeed(kmh: number, unit: WindUnit): number {
  if (unit === 'mph') {
    return Math.round(kmh * 0.621371);
  }
  if (unit === 'ms') {
    return Math.round((kmh * 1000) / 3600);
  }
  return Math.round(kmh);
}

export function formatSpeed(kmh: number, unit: WindUnit): string {
  const converted = convertSpeed(kmh, unit);
  const label = unit === 'mph' ? 'mph' : unit === 'ms' ? 'm/s' : 'km/h';
  return `${converted} ${label}`;
}

export function getWindDirectionLabel(degree: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degree / 22.5) % 16;
  return directions[index];
}
