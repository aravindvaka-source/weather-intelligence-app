import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 space-y-6 animate-pulse">
      {/* Current Weather Card Skeleton */}
      <div className="bg-slate-200 dark:bg-slate-800 rounded-3xl p-8 h-80 w-full" />

      {/* Grid of 2 Skeleton Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-200 dark:bg-slate-800 rounded-3xl h-72 w-full" />
        <div className="bg-slate-200 dark:bg-slate-800 rounded-3xl h-72 w-full" />
      </div>

      {/* 7-Day Forecast Skeleton */}
      <div className="bg-slate-200 dark:bg-slate-800 rounded-3xl h-96 w-full" />
    </div>
  );
};
