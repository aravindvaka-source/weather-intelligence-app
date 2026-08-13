import React, { useState } from 'react';
import { Clock, TrendingUp, CloudRain } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { WeatherData, TempUnit } from '../types/weather';
import { getWMODetails } from '../utils/wmoCodes';
import { convertTemp } from '../utils/weatherRecommendations';

interface HourlyForecastProps {
  weather: WeatherData;
  tempUnit: TempUnit;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  weather,
  tempUnit,
}) => {
  const [metric, setMetric] = useState<'temp' | 'precip'>('temp');

  if (!weather.hourly || !weather.hourly.time || weather.hourly.time.length === 0) {
    return null;
  }

  // Get current hour index
  const now = new Date();
  let startIndex = 0;
  if (weather.hourly.time) {
    const found = weather.hourly.time.findIndex((t) => new Date(t) >= now);
    if (found !== -1) startIndex = found;
  }

  // Next 24 hours
  const hourlySlice = weather.hourly.time.slice(startIndex, startIndex + 24).map((timeStr, idx) => {
    const actualIdx = startIndex + idx;
    const rawTemp = weather.hourly?.temperature_2m?.[actualIdx] ?? 0;
    const displayTemp = convertTemp(rawTemp, tempUnit);
    const precipProb = weather.hourly?.precipitation_probability?.[actualIdx] ?? 0;
    const code = weather.hourly?.weathercode?.[actualIdx] ?? 0;
    const wmo = getWMODetails(code);

    const date = new Date(timeStr);
    const timeLabel = idx === 0 ? 'Now' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      timeLabel,
      temp: displayTemp,
      precipProb,
      code,
      wmoLabel: wmo.label,
      IconComponent: wmo.icon,
      isoTime: timeStr,
    };
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Top Title & Chart Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900/50">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              24-Hour Forecast Timeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hourly temperature trend and precipitation probability
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
          <button
            onClick={() => setMetric('temp')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              metric === 'temp'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Temperature
          </button>
          <button
            onClick={() => setMetric('precip')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              metric === 'precip'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" /> Precip Chance
          </button>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="h-44 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlySlice} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="precipGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="timeLabel" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis
              domain={metric === 'temp' ? ['auto', 'auto'] : [0, 100]}
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              unit={metric === 'temp' ? `°${tempUnit}` : '%'}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700 space-y-1">
                      <div className="font-bold text-sky-400">{data.timeLabel}</div>
                      <div>Condition: {data.wmoLabel}</div>
                      <div>
                        {metric === 'temp'
                          ? `Temperature: ${data.temp}°${tempUnit}`
                          : `Precip Chance: ${data.precipProb}%`}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {metric === 'temp' ? (
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#0284c7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#tempGradient)"
              />
            ) : (
              <Area
                type="monotone"
                dataKey="precipProb"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#precipGradient)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Horizontal Cards Strip */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
        {hourlySlice.map((item, index) => {
          const Icon = item.IconComponent;
          return (
            <div
              key={index}
              className={`p-3 rounded-2xl border min-w-[85px] flex flex-col items-center justify-between text-center transition-all ${
                index === 0
                  ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-300 dark:border-sky-800 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700/80'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {item.timeLabel}
              </span>
              <Icon className="w-6 h-6 text-sky-600 dark:text-sky-400 my-1" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {item.temp}°{tempUnit}
              </div>
              <div className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-0.5">
                <CloudRain className="w-2.5 h-2.5" />
                {item.precipProb}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
