import React from 'react';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  onSearchDefault?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onRetry,
  onSearchDefault,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-3xl text-center shadow-xs">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-900 dark:text-rose-200 mb-1">
        Unable to Load Weather Data
      </h3>
      <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto mb-5 leading-relaxed">
        {message}
      </p>
      <div className="flex items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        )}
        {onSearchDefault && (
          <button
            onClick={onSearchDefault}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 shadow-xs transition-all"
          >
            <Search className="w-3.5 h-3.5" /> Load Tokyo
          </button>
        )}
      </div>
    </div>
  );
};
