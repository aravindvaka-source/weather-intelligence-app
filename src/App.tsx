import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { RecommendationsCard } from './components/RecommendationsCard';
import { HourlyForecast } from './components/HourlyForecast';
import { SevenDayForecast } from './components/SevenDayForecast';
import { FavoritesBar } from './components/FavoritesBar';
import { ErrorAlert } from './components/ErrorAlert';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { GeocodingResult, WeatherData, TempUnit, WindUnit, FavoriteCity } from './types/weather';
import { fetchWeatherData } from './services/openMeteo';
import { generateRecommendations } from './utils/weatherRecommendations';
import { RefreshCw, ExternalLink, Globe } from 'lucide-react';

const DEFAULT_CITY: GeocodingResult = {
  id: 1850147,
  name: 'Tokyo',
  latitude: 35.6762,
  longitude: 139.6503,
  country: 'Japan',
  country_code: 'JP',
  admin1: 'Tokyo',
  timezone: 'Asia/Tokyo',
};

export default function App() {
  const [currentCity, setCurrentCity] = useState<GeocodingResult>(() => {
    try {
      const saved = localStorage.getItem('weather_last_city');
      return saved ? JSON.parse(saved) : DEFAULT_CITY;
    } catch {
      return DEFAULT_CITY;
    }
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [tempUnit, setTempUnit] = useState<TempUnit>(() => {
    return (localStorage.getItem('weather_temp_unit') as TempUnit) || 'C';
  });

  const [windUnit, setWindUnit] = useState<WindUnit>(() => {
    return (localStorage.getItem('weather_wind_unit') as WindUnit) || 'kmh';
  });

  const [favorites, setFavorites] = useState<FavoriteCity[]>(() => {
    try {
      const saved = localStorage.getItem('weather_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save unit preferences
  const handleToggleTempUnit = (unit: TempUnit) => {
    setTempUnit(unit);
    localStorage.setItem('weather_temp_unit', unit);
  };

  const handleToggleWindUnit = (unit: WindUnit) => {
    setWindUnit(unit);
    localStorage.setItem('weather_wind_unit', unit);
  };

  // Load weather data
  const loadWeather = useCallback(async (city: GeocodingResult) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherData(city);
      setWeatherData(data);
      setCurrentCity(city);
      localStorage.setItem('weather_last_city', JSON.stringify(city));
    } catch (err: any) {
      console.error('Failed to load weather:', err);
      setError(
        err.message || 'Failed to connect to weather service. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(currentCity);
  }, [loadWeather]);

  // Favorites toggle
  const isCurrentFavorite = favorites.some((f) => f.id === currentCity.id);

  const handleToggleFavorite = () => {
    let updated: FavoriteCity[];
    if (isCurrentFavorite) {
      updated = favorites.filter((f) => f.id !== currentCity.id);
    } else {
      updated = [
        ...favorites,
        {
          id: currentCity.id,
          name: currentCity.name,
          country: currentCity.country,
          admin1: currentCity.admin1,
          latitude: currentCity.latitude,
          longitude: currentCity.longitude,
          timezone: currentCity.timezone,
        },
      ];
    }
    setFavorites(updated);
    localStorage.setItem('weather_favorites', JSON.stringify(updated));
  };

  const handleRemoveFavorite = (id: number) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('weather_favorites', JSON.stringify(updated));
  };

  const recommendations = weatherData ? generateRecommendations(weatherData) : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors pb-12">
      {/* Header with Search & Controls */}
      <Header
        onSelectCity={loadWeather}
        tempUnit={tempUnit}
        onToggleTempUnit={handleToggleTempUnit}
        windUnit={windUnit}
        onToggleWindUnit={handleToggleWindUnit}
        isLoading={isLoading}
        favorites={favorites}
      />

      {/* Saved / Favorite Cities Bar */}
      <FavoritesBar
        favorites={favorites}
        onSelectCity={loadWeather}
        onRemoveFavorite={handleRemoveFavorite}
      />

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4">
        {isLoading && !weatherData ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorAlert
            message={error}
            onRetry={() => loadWeather(currentCity)}
            onSearchDefault={() => loadWeather(DEFAULT_CITY)}
          />
        ) : weatherData ? (
          <div className="space-y-6">
            {/* Top Row: Current Weather */}
            <CurrentWeatherCard
              weather={weatherData}
              tempUnit={tempUnit}
              windUnit={windUnit}
              isFavorite={isCurrentFavorite}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Smart Activity Recommendations */}
            <RecommendationsCard recommendations={recommendations} />

            {/* 24-Hour Timeline */}
            <HourlyForecast weather={weatherData} tempUnit={tempUnit} />

            {/* 7-Day Forecast View */}
            <SevenDayForecast
              weather={weatherData}
              tempUnit={tempUnit}
              windUnit={windUnit}
            />
          </div>
        ) : null}
      </main>

      {/* Footer Attribution */}
      <footer className="w-full max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-500" />
          <span>Weather Intelligence • Powered by Open-Meteo Public APIs</span>
        </div>
        <div className="flex items-center gap-4">
          {weatherData && (
            <button
              onClick={() => loadWeather(currentCity)}
              disabled={isLoading}
              className="flex items-center gap-1.5 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          )}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            Open-Meteo Docs <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}
