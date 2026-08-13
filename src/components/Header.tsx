import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Compass, X, Sparkles, Heart } from 'lucide-react';
import { GeocodingResult, TempUnit, WindUnit, FavoriteCity } from '../types/weather';
import { searchCities, reverseGeocode } from '../services/openMeteo';

interface HeaderProps {
  onSelectCity: (city: GeocodingResult) => void;
  tempUnit: TempUnit;
  onToggleTempUnit: (unit: TempUnit) => void;
  windUnit: WindUnit;
  onToggleWindUnit: (unit: WindUnit) => void;
  isLoading: boolean;
  favorites: FavoriteCity[];
}

const POPULAR_CITIES = [
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan', code: 'JP' },
  { name: 'London', lat: 51.5074, lon: -0.1278, country: 'United Kingdom', code: 'GB' },
  { name: 'New York', lat: 40.7128, lon: -74.006, country: 'United States', code: 'US' },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France', code: 'FR' },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia', code: 'AU' },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'United Arab Emirates', code: 'AE' },
];

export const Header: React.FC<HeaderProps> = ({
  onSelectCity,
  tempUnit,
  onToggleTempUnit,
  windUnit,
  onToggleWindUnit,
  isLoading,
  favorites,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchCities(query);
        setResults(res);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: GeocodingResult) => {
    onSelectCity(city);
    setQuery('');
    setShowDropdown(false);
  };

  const handleCurrentLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const city = await reverseGeocode(lat, lon);
          onSelectCity(city);
        } catch (err) {
          setGeoError('Could not determine city name from current location.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location access denied. Please search for your city manually.');
        } else {
          setGeoError('Failed to fetch current location.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <header className="w-full max-w-7xl mx-auto px-4 pt-6 pb-4">
      {/* Top Branding & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Weather Intelligence
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/50">
                <Sparkles className="w-3 h-3 text-sky-500" /> Open-Meteo
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time global weather, 7-day outlook & smart planning
            </p>
          </div>
        </div>

        {/* Unit Toggles */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Temperature Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onToggleTempUnit('C')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                tempUnit === 'C'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => onToggleTempUnit('F')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                tempUnit === 'F'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              °F
            </button>
          </div>

          {/* Wind Speed Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onToggleWindUnit('kmh')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                windUnit === 'kmh'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              km/h
            </button>
            <button
              onClick={() => onToggleWindUnit('mph')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                windUnit === 'mph'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              mph
            </button>
          </div>
        </div>
      </div>

      {/* Main Search Input & Auto Location Button */}
      <div className="relative max-w-3xl mx-auto" ref={dropdownRef}>
        <div className="relative flex items-center">
          <div className="absolute left-4 text-slate-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setShowDropdown(true);
            }}
            placeholder="Search any city globally (e.g. Tokyo, Paris, Chicago, Mumbai)..."
            className="w-full pl-12 pr-28 py-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 text-sm md:text-base placeholder:text-slate-400 transition-all"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowDropdown(false);
              }}
              className="absolute right-24 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleCurrentLocation}
            disabled={isLocating || isLoading}
            title="Use My Current Location"
            className="absolute right-2.5 px-3 py-2 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-600 dark:text-sky-300 rounded-xl border border-sky-200/60 dark:border-sky-800/50 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <MapPin className={`w-3.5 h-3.5 ${isLocating ? 'animate-ping' : ''}`} />
            <span className="hidden sm:inline">Location</span>
          </button>
        </div>

        {/* Dropdown Results */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden z-50 divide-y divide-slate-100 dark:divide-slate-700/50 max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                Searching cities globally...
              </div>
            ) : results.length > 0 ? (
              results.map((city) => (
                <button
                  key={`${city.id}-${city.latitude}-${city.longitude}`}
                  onClick={() => handleSelect(city)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between transition-colors group"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 flex items-center gap-1.5">
                      {city.name}
                      {city.country_code && (
                        <span className="text-xs text-slate-400 font-normal">
                          ({city.country_code})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {[city.admin1, city.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                  </span>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                No cities found matching "{query}". Check spelling or try a larger city name.
              </div>
            )}
          </div>
        )}
      </div>

      {geoError && (
        <div className="max-w-3xl mx-auto mt-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
          <span>{geoError}</span>
          <button onClick={() => setGeoError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Popular Cities Quick Bar */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar max-w-3xl mx-auto">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          Popular:
        </span>
        {POPULAR_CITIES.map((c) => (
          <button
            key={c.name}
            onClick={() =>
              handleSelect({
                id: Math.floor(c.lat * 1000),
                name: c.name,
                latitude: c.lat,
                longitude: c.lon,
                country: c.country,
                country_code: c.code,
                timezone: 'auto',
              })
            }
            className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-medium shrink-0 transition-all shadow-xs"
          >
            {c.name}
          </button>
        ))}
      </div>
    </header>
  );
};
