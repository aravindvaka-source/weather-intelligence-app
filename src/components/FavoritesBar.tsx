import React from 'react';
import { Heart, Trash2, MapPin } from 'lucide-react';
import { FavoriteCity, GeocodingResult } from '../types/weather';

interface FavoritesBarProps {
  favorites: FavoriteCity[];
  onSelectCity: (city: GeocodingResult) => void;
  onRemoveFavorite: (id: number) => void;
}

export const FavoritesBar: React.FC<FavoritesBarProps> = ({
  favorites,
  onSelectCity,
  onRemoveFavorite,
}) => {
  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Saved Cities
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="group flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 transition-all cursor-pointer"
            onClick={() =>
              onSelectCity({
                id: fav.id,
                name: fav.name,
                country: fav.country,
                country_code: '',
                admin1: fav.admin1,
                latitude: fav.latitude,
                longitude: fav.longitude,
                timezone: fav.timezone,
              })
            }
          >
            <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400">
              {fav.name}
            </span>
            {fav.country && (
              <span className="text-[10px] text-slate-400">
                {fav.country}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFavorite(fav.id);
              }}
              title="Remove from saved cities"
              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
