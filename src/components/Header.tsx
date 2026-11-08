import React from 'react';
import { Search, BarChart2, Upload, Moon, Sun, History } from 'lucide-react';
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
  const isDataLoaded = Boolean(appStatus?.available && appStatus.totalEntries > 0);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/85 dark:bg-[#161618]/85 border-b border-black/[0.06] dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity with macOS Squircle Icon */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative group">
            <div className="w-10 h-10 rounded-[11px] bg-gradient-to-b from-[#0A84FF] via-[#007AFF] to-[#0055D4] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,122,255,0.25)] ring-1 ring-black/5 dark:ring-white/20 transition-transform group-hover:scale-105">
              <History size={20} strokeWidth={2.2} className="drop-shadow-xs" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[15px] sm:text-[16px] text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Chrome History
              </span>
            </div>

            {isDataLoaded ? (
              <div className="flex items-center gap-1.5 text-[11px] text-[#86868B] dark:text-[#A1A1A6] font-normal leading-tight mt-0.5">
                <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {appStatus!.totalEntries.toLocaleString()}
                </span>
                <span>items</span>
                <span className="opacity-40">•</span>
                <span>{appStatus!.totalDays} days</span>
              </div>
            ) : (
              <p className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] leading-none mt-0.5">
                No history loaded
              </p>
            )}
          </div>
        </div>

        {/* Middle: Prominent Centered Spotlight Search Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6">
          <button
            type="button"
            onClick={isDataLoaded ? onOpenSearch : onOpenUpload}
            className="w-full h-10 px-3.5 rounded-full bg-black/[0.04] hover:bg-black/[0.07] dark:bg-white/[0.07] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.1] flex items-center justify-between text-left transition-all group shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:outline-hidden focus:ring-2 focus:ring-[#007AFF]/40"
            title={isDataLoaded ? "Search history (⌘K)" : "Upload History.json"}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Search
                size={16}
                className="text-[#86868B] dark:text-[#A1A1A6] group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF] transition-colors flex-shrink-0"
                strokeWidth={2}
              />
              <span className="text-[13px] text-[#86868B] dark:text-[#A1A1A6] truncate font-normal">
                {isDataLoaded ? "Search history titles, websites, or URLs..." : "Upload History.json to search..."}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
              <kbd className="hidden sm:inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-white dark:bg-[#2C2C2E] border border-black/[0.08] dark:border-white/[0.12] text-[11px] font-mono text-[#86868B] dark:text-[#A1A1A6] shadow-2xs group-hover:border-[#007AFF]/30 transition-colors">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right: macOS Toolbar Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Stats Button */}
          {isDataLoaded && (
            <button
              onClick={onOpenStats}
              className="h-9 px-3 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="All-Time Analytics"
            >
              <BarChart2 size={15} className="text-[#007AFF] dark:text-[#0A84FF]" strokeWidth={2} />
              <span className="hidden md:inline">Analytics</span>
            </button>
          )}

          {/* Import Button */}
          <button
            onClick={onOpenUpload}
            className="h-9 px-3 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            title="Import Takeout JSON"
          >
            <Upload size={14} strokeWidth={2} />
            <span className="hidden sm:inline">Import JSON</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/[0.1] text-[#86868B] dark:text-[#A1A1A6] transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
          </button>
        </div>
      </div>
    </header>
  );
};
