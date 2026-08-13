import { GeocodingResult, WeatherData } from '../types/weather';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function searchCities(cityName: string): Promise<GeocodingResult[]> {
  const trimmed = cityName.trim();
  if (!trimmed) {
    return [];
  }

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(trimmed)}&count=8&language=en&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch city results (HTTP ${response.status})`);
  }

  const data = await response.json();
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  return data.results.map((item: any) => ({
    id: item.id,
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country || '',
    country_code: item.country_code || '',
    admin1: item.admin1 || '',
    timezone: item.timezone || 'auto',
    elevation: item.elevation,
  }));
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`
    );
    if (response.ok) {
      const data = await response.json();
      const name =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        data.name ||
        'Current Location';
      const country = data.address?.country || '';
      const country_code = (data.address?.country_code || '').toUpperCase();
      const admin1 = data.address?.state || data.address?.region || '';

      return {
        id: Math.floor(lat * 1000 + lon),
        name,
        latitude: lat,
        longitude: lon,
        country,
        country_code,
        admin1,
        timezone: 'auto',
      };
    }
  } catch (err) {
    console.warn('Reverse geocoding fallback triggered:', err);
  }

  return {
    id: Math.floor(lat * 1000 + lon),
    name: 'Current Location',
    latitude: lat,
    longitude: lon,
    country: '',
    country_code: '',
    timezone: 'auto',
  };
}

export async function fetchWeatherData(city: GeocodingResult): Promise<WeatherData> {
  const { latitude, longitude } = city;

  const url = `${FORECAST_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,surface_pressure,windspeed_10m,winddirection_10m,uv_index&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,windspeed_10m_max,uv_index_max&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch weather forecast (HTTP ${response.status})`);
  }

  const data = await response.json();

  if (!data.current_weather || !data.daily) {
    throw new Error('Incomplete weather data received from Open-Meteo API.');
  }

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone || city.timezone,
    elevation: data.elevation || 0,
    current_weather: data.current_weather,
    hourly: data.hourly,
    daily: data.daily,
    cityInfo: city,
    fetchedAt: new Date().toISOString(),
  };
}
