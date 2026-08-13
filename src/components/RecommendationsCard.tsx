import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  CloudRain,
  Activity,
  Flame,
  ThermometerSnowflake,
  Smile,
  Umbrella,
  Shirt,
  Sun,
  SunMedium,
  Wind,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  LucideIcon
} from 'lucide-react';
import { SmartRecommendation } from '../types/weather';

interface RecommendationsCardProps {
  recommendations: SmartRecommendation[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  CloudRain,
  Activity,
  Flame,
  ThermometerSnowflake,
  Smile,
  Umbrella,
  Shirt,
  Sun,
  SunMedium,
  Wind,
  EyeOff,
  AlertTriangle,
};

export const RecommendationsCard: React.FC<RecommendationsCardProps> = ({
  recommendations,
}) => {
  const [filter, setFilter] = useState<'all' | 'fitness' | 'apparel' | 'safety' | 'health'>('all');

  const filtered = filter === 'all'
    ? recommendations
    : recommendations.filter((r) => r.category === filter);

  const getLevelStyle = (level: SmartRecommendation['level']) => {
    switch (level) {
      case 'alert':
        return {
          cardBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60',
          badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200',
          iconColor: 'text-rose-600 dark:text-rose-400',
          indicatorIcon: ShieldAlert,
        };
      case 'warning':
        return {
          cardBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
          badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200',
          iconColor: 'text-amber-600 dark:text-amber-400',
          indicatorIcon: AlertTriangle,
        };
      case 'success':
        return {
          cardBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60',
          badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          indicatorIcon: CheckCircle2,
        };
      default:
        return {
          cardBg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/60',
          badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-900/80 dark:text-sky-200',
          iconColor: 'text-sky-600 dark:text-sky-400',
          indicatorIcon: Info,
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Smart Planning Recommendations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automated weather intelligence insights for your daily activities
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'fitness', label: 'Fitness' },
              { id: 'apparel', label: 'Gear' },
              { id: 'safety', label: 'Safety' },
              { id: 'health', label: 'UV & Air' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                filter === tab.id
                  ? 'bg-slate-900 dark:bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Recommendations */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const levelStyle = getLevelStyle(item.level);
            const MainIcon = ICON_MAP[item.iconName] || Sparkles;
            const IndicatorIcon = levelStyle.indicatorIcon;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border ${levelStyle.cardBg} flex items-start gap-3.5 transition-all hover:shadow-sm`}
              >
                <div className={`p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-white/60 dark:border-slate-700/60 ${levelStyle.iconColor} shrink-0 mt-0.5`}>
                  <MainIcon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 ${levelStyle.badgeBg}`}>
                      <IndicatorIcon className="w-3 h-3" />
                      {item.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          No active recommendations for this filter. Weather conditions look smooth!
        </div>
      )}
    </div>
  );
};
