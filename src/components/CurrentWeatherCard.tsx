import React from 'react';
import {
  MapPin,
  Heart,
  Wind,
  Droplets,
  CloudRain,
  Sun,
  Gauge,
  Sunrise,
  Sunset,
  ArrowUpRight,
  ArrowDownRight,
  Thermometer
} from 'lucide-react';
import { WeatherData, TempUnit, WindUnit } from '../types/weather';
import { getWMODetails } from '../utils/wmoCodes';
import {
  formatTemp,
  formatSpeed,
  getWindDirectionLabel,
  convertTemp
} from '../utils/weatherRecommendations';

interface CurrentWeatherCardProps {
  weather: WeatherData;
  tempUnit: TempUnit;
  windUnit: WindUnit;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  tempUnit,
  windUnit,
  isFavorite,
  onToggleFavorite,
}) => {
  const { current_weather, daily, hourly, cityInfo } = weather;
  const wmo = getWMODetails(current_weather.weathercode);
  const IconComponent = wmo.icon;

  const todayMaxC = daily.temperature_2m_max?.[0] ?? current_weather.temperature;
  const todayMinC = daily.temperature_2m_min?.[0] ?? current_weather.temperature;
  const precipSum = daily.precipitation_sum?.[0] ?? 0;
  const precipProb = daily.precipitation_probability_max?.[0] ?? 0;
  const uvMax = daily.uv_index_max?.[0] ?? 0;

  // Hourly relative humidity / apparent temp at current index if available
  const currentHumidity = hourly?.relativehumidity_2m?.[0] ?? 60;
  const apparentTempC = hourly?.apparent_temperature?.[0] ?? current_weather.temperature;
  const pressure = hourly?.surface_pressure?.[0] ?? 1013;

  // Sunrise / Sunset formatting
  const sunriseRaw = daily.sunrise?.[0];
  const sunsetRaw = daily.sunset?.[0];

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const getUVBadge = (uv: number) => {
    if (uv < 3) return { label: 'Low', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
    if (uv < 6) return { label: 'Moderate', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
    if (uv < 8) return { label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' };
    if (uv < 11) return { label: 'Very High', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' };
    return { label: 'Extreme', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' };
  };

  const uvBadge = getUVBadge(uvMax);

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 md:p-8 border shadow-lg transition-all ${wmo.cardBgLight}`}>
      {/* Background Decorative Blur Circle */}
      <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-current opacity-10 blur-3xl pointer-events-none" />

      {/* Top Header: Location Name & Pin/Favorite */}
      <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {cityInfo.name}
            </h2>
            {cityInfo.country_code && (
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                {cityInfo.country_code}
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
            {[cityInfo.admin1, cityInfo.country].filter(Boolean).join(', ')}
          </p>
        </div>

        <button
          onClick={onToggleFavorite}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`p-2.5 rounded-2xl border transition-all ${
            isFavorite
              ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/30'
              : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-rose-500 border-slate-200/80 dark:border-slate-700/80'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Main Temperature & Condition Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-8 relative z-10">
        {/* Big Temp */}
        <div className="flex items-baseline gap-4">
          <span className="text-6xl md:text-7xl font-extrabold tracking-tighter text-slate-900 dark:text-white">
            {formatTemp(current_weather.temperature, tempUnit)}
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Thermometer className="w-4 h-4 text-sky-500" />
              Feels like {formatTemp(apparentTempC, tempUnit)}
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center text-rose-600 dark:text-rose-400">
                <ArrowUpRight className="w-3.5 h-3.5" /> High: {formatTemp(todayMaxC, tempUnit)}
              </span>
              <span className="flex items-center text-blue-600 dark:text-blue-400">
                <ArrowDownRight className="w-3.5 h-3.5" /> Low: {formatTemp(todayMinC, tempUnit)}
              </span>
            </div>
          </div>
        </div>

        {/* Condition Icon & Text */}
        <div className="flex items-center gap-4 md:justify-end">
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/40 shadow-xs">
            <IconComponent className="w-12 h-12 md:w-14 md:h-14 text-sky-600 dark:text-sky-400 animate-pulse-slow" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              {wmo.label}
            </div>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-xs">
              {wmo.description}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Key Weather Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
        {/* Wind */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Wind className="w-3.5 h-3.5 text-sky-500" /> Wind
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white">
            {formatSpeed(current_weather.windspeed, windUnit)}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            {getWindDirectionLabel(current_weather.winddirection)} ({current_weather.winddirection}°)
          </div>
        </div>

        {/* Humidity */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-500" /> Humidity
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white">
            {currentHumidity}%
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            {currentHumidity > 70 ? 'High Humidity' : currentHumidity < 35 ? 'Dry Air' : 'Comfortable'}
          </div>
        </div>

        {/* Precipitation */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <CloudRain className="w-3.5 h-3.5 text-indigo-500" /> Precip
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white">
            {precipSum.toFixed(1)} mm
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            {precipProb}% max chance
          </div>
        </div>

        {/* UV Index */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" /> UV Index
            </span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
            {uvMax.toFixed(1)}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${uvBadge.color}`}>
              {uvBadge.label}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Max UV today
          </div>
        </div>

        {/* Pressure */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Gauge className="w-3.5 h-3.5 text-emerald-500" /> Pressure
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white">
            {Math.round(pressure)} hPa
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Surface pressure
          </div>
        </div>

        {/* Sunrise / Sunset */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Sunrise className="w-3.5 h-3.5 text-amber-500" /> Daylight
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sunrise className="w-3 h-3 text-amber-500" /> {formatTime(sunriseRaw)}
            </span>
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between mt-0.5">
            <span className="flex items-center gap-1">
              <Sunset className="w-3 h-3 text-orange-500" /> {formatTime(sunsetRaw)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
