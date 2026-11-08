import React from 'react';
import { Calendar, Search, BarChart3, UploadCloud, Moon, Sun } from 'lucide-react';
import { AppStatus } from '../types';

interface HeaderProps {
  appStatus: AppStatus | null;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSearch: () => void;
  onOpenStats: () => void;
  onOpenUpload: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appStatus,
  isDarkMode,
  onToggleDarkMode,
  onOpenSearch,
  onOpenStats,
  onOpenUpload,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <Calendar size={22} className="stroke-[2.2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                Chrome History Calendar
              </h1>
            </div>

            {appStatus && appStatus.available && (
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {appStatus.totalEntries.toLocaleString()} visits across {appStatus.totalDays} active days
              </p>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
            title="Search history (Cmd+K)"
          >
            <Search size={14} className="text-slate-400" />
            <span className="hidden sm:inline">Search all history</span>
            <kbd className="hidden sm:inline-block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded text-[10px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Stats Button */}
          <button
            onClick={onOpenStats}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="All-Time Analytics"
          >
            <BarChart3 size={15} className="text-brand-500" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Load another Takeout JSON"
          >
            <UploadCloud size={15} className="text-indigo-500" />
            <span className="hidden md:inline">Import JSON</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};

