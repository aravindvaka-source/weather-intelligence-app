import React, { useState } from 'react';
import {
  Calendar,
  CloudRain,
  Sun,
  Wind,
  Sunrise,
  Sunset,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { WeatherData, TempUnit, WindUnit } from '../types/weather';
import { getWMODetails } from '../utils/wmoCodes';
import { convertTemp, formatSpeed } from '../utils/weatherRecommendations';

interface SevenDayForecastProps {
  weather: WeatherData;
  tempUnit: TempUnit;
  windUnit: WindUnit;
}

export const SevenDayForecast: React.FC<SevenDayForecastProps> = ({
  weather,
  tempUnit,
  windUnit,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const { daily } = weather;

  if (!daily || !daily.time || daily.time.length === 0) {
    return null;
  }

  // Calculate global min and max for temperature bar relative scaling
  const allMaxs = daily.temperature_2m_max.map((t) => convertTemp(t, tempUnit));
  const allMins = daily.temperature_2m_min.map((t) => convertTemp(t, tempUnit));
  const globalMax = Math.max(...allMaxs);
  const globalMin = Math.min(...allMins);
  const tempRange = Math.max(1, globalMax - globalMin);

  const formatDayName = (timeStr: string, index: number) => {
    if (index === 0) return 'Today';
    const date = new Date(timeStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDateLabel = (timeStr: string) => {
    const date = new Date(timeStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            7-Day Weather Outlook
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily temperature ranges, condition indicators & precipitation
          </p>
        </div>
      </div>

      {/* Daily List */}
      <div className="space-y-3">
        {daily.time.map((timeStr, idx) => {
          const maxTempC = daily.temperature_2m_max[idx];
          const minTempC = daily.temperature_2m_min[idx];
          const maxTempConverted = convertTemp(maxTempC, tempUnit);
          const minTempConverted = convertTemp(minTempC, tempUnit);
          const wmoCode = daily.weathercode[idx];
          const wmo = getWMODetails(wmoCode);
          const Icon = wmo.icon;

          const precipSum = daily.precipitation_sum?.[idx] ?? 0;
          const precipProb = daily.precipitation_probability_max?.[idx] ?? 0;
          const uvMax = daily.uv_index_max?.[idx] ?? 0;
          const maxWindKmh = daily.windspeed_10m_max?.[idx] ?? 0;
          const sunrise = daily.sunrise?.[idx];
          const sunset = daily.sunset?.[idx];

          const isExpanded = expandedIndex === idx;

          // Bar positioning calculations
          const leftPercent = Math.max(0, Math.min(100, ((minTempConverted - globalMin) / tempRange) * 100));
          const widthPercent = Math.max(5, Math.min(100 - leftPercent, ((maxTempConverted - minTempConverted) / tempRange) * 100));

          return (
            <div
              key={timeStr}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-slate-50 dark:bg-slate-700/40 border-sky-300 dark:border-sky-800 shadow-xs'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50/80 dark:hover:bg-slate-700/30'
              }`}
            >
              {/* Row Bar */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Day & Condition */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatDayName(timeStr, idx)}
                      </span>
                      <span className="text-xs text-slate-400 font-normal">
                        {formatDateLabel(timeStr)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {wmo.label}
                    </div>
                  </div>
                </div>

                {/* Precip Chance */}
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 min-w-[80px]">
                  <CloudRain className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{precipProb}%</span>
                  {precipSum > 0 && <span className="text-[10px]">({precipSum.toFixed(1)}mm)</span>}
                </div>

                {/* Relative Temp Visual Bar */}
                <div className="flex items-center gap-3 flex-1 max-w-xs">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-8 text-right shrink-0">
                    {minTempConverted}°
                  </span>
                  <div className="relative h-2.5 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white w-8 shrink-0">
                    {maxTempConverted}°
                  </span>
                </div>

                <div className="text-slate-400 p-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Expanded Details Panel */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white/60 dark:bg-slate-800/60">
                  <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-700/50">
                    <span className="text-slate-400 block mb-0.5">Precipitation Sum</span>
                    <span className="font-bold text-slate-900 dark:text-white">{precipSum.toFixed(1)} mm</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-700/50">
                    <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                      <Wind className="w-3 h-3 text-sky-500" /> Max Wind Speed
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatSpeed(maxWindKmh, windUnit)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-700/50">
                    <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-500" /> Max UV Index
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{uvMax.toFixed(1)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-700/50">
                    <span className="text-slate-400 block mb-0.5">Daylight Cycle</span>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="flex items-center gap-0.5"><Sunrise className="w-3 h-3 text-amber-500" />{formatTime(sunrise)}</span>
                      <span className="flex items-center gap-0.5"><Sunset className="w-3 h-3 text-orange-500" />{formatTime(sunset)}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
