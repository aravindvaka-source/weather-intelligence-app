export type TempUnit = 'C' | 'F';
export type WindUnit = 'kmh' | 'mph' | 'ms';

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  timezone: string;
  elevation?: number;
}

export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  is_day: number;
  time: string;
}

export interface HourlyData {
  time: string[];
  temperature_2m: number[];
  relativehumidity_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weathercode: number[];
  surface_pressure: number[];
  windspeed_10m: number[];
  winddirection_10m: number[];
  uv_index: number[];
}

export interface DailyData {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max?: number[];
  apparent_temperature_min?: number[];
  sunrise?: string[];
  sunset?: string[];
  precipitation_sum: number[];
  precipitation_probability_max?: number[];
  windspeed_10m_max?: number[];
  uv_index_max?: number[];
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  elevation: number;
  current_weather: CurrentWeather;
  hourly?: HourlyData;
  daily: DailyData;
  cityInfo: GeocodingResult;
  fetchedAt: string;
}

export interface SmartRecommendation {
  id: string;
  category: 'fitness' | 'apparel' | 'safety' | 'health' | 'general';
  title: string;
  description: string;
  level: 'info' | 'success' | 'warning' | 'alert';
  iconName: string;
}

export interface FavoriteCity {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}
