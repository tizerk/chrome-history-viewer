import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CalendarView } from './components/Calendar/CalendarView';
import { DayView } from './components/DayView/DayView';
import { GlobalSearchModal } from './components/Modals/GlobalSearchModal';
import { OverallStatsModal } from './components/Modals/OverallStatsModal';
import { FileUploadModal } from './components/Modals/FileUploadModal';
import { AppStatus, CalendarOverview, DayDetails, HistoryEntry, OverallStats } from './types';
import { ParseResult } from './utils/clientParser';

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // App & Data states
  const [appStatus, setAppStatus] = useState<AppStatus | null>(null);
  const [calendarOverview, setCalendarOverview] = useState<CalendarOverview | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dayDetails, setDayDetails] = useState<DayDetails | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [customDaysMap, setCustomDaysMap] = useState<Map<string, DayDetails> | null>(null);

  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingDay, setIsLoadingDay] = useState(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initial data fetch from server
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [statusRes, calRes, statsRes] = await Promise.all([
          fetch('/api/status'),
          fetch('/api/calendar'),
          fetch('/api/stats')
        ]);

        if (statusRes.ok && calRes.ok) {
          const statusData: AppStatus = await statusRes.json();
          const calData: CalendarOverview = await calRes.json();

          setAppStatus(statusData);
          setCalendarOverview(calData);

          if (statsRes.ok) {
            const statsData: OverallStats = await statsRes.json();
            setOverallStats(statsData);
          }

          // Default select the latest date
          if (calData.maxDate) {
            setSelectedDate(calData.maxDate);
          }
        }
      } catch (err) {
        console.warn('Backend API not responding or running client-only:', err);
      } finally {
        setIsInitialLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Fetch or load day details whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;

    // Check if we have custom uploaded data in memory
    if (customDaysMap) {
      const rec = customDaysMap.get(selectedDate);
      if (rec) {
        setDayDetails(rec);
      } else {
        setDayDetails({
          date: selectedDate,
          exists: false,
          count: 0,
          entries: [],
          prevDate: null,
          nextDate: null,
          stats: null
        });
      }
      return;
    }

    // Otherwise fetch from server API
    async function fetchDay() {
      setIsLoadingDay(true);
      try {
        const res = await fetch(`/api/day?date=${encodeURIComponent(selectedDate)}`);
        if (res.ok) {
          const data: DayDetails = await res.json();
          setDayDetails(data);
        }
      } catch (err) {
        console.error('Failed to load day details:', err);
      } finally {
        setIsLoadingDay(false);
      }
    }

    fetchDay();
  }, [selectedDate, customDaysMap]);

  // Global search callback
  const handleGlobalSearch = useCallback(
    async (query: string): Promise<HistoryEntry[]> => {
      if (customDaysMap) {
        // Search client-side
        const q = query.toLowerCase().trim();
        const results: HistoryEntry[] = [];
        for (const [d, rec] of customDaysMap.entries()) {
          for (const e of rec.entries) {
            if (e.title.toLowerCase().includes(q) || e.url.toLowerCase().includes(q) || e.domain.toLowerCase().includes(q)) {
              results.push({ ...e, date: d });
              if (results.length >= 50) return results;
            }
          }
        }
        return results;
      }

      // Search server
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        return data.results || [];
      }
      return [];
    },
    [customDaysMap]
  );

  // Handle uploaded file result
  const handleFileParsed = (result: ParseResult, _fileName: string) => {
    setCalendarOverview(result.calendar);
    setCustomDaysMap(result.daysMap);
    setAppStatus({
      available: true,
      isLoading: false,
      totalEntries: result.totalEntries,
      totalDays: result.calendar.totalDays,
      minDate: result.calendar.minDate,
      maxDate: result.calendar.maxDate,
      peakDay: null,
    });

    if (result.calendar.maxDate) {
      setSelectedDate(result.calendar.maxDate);
    }
  };

  // Keyboard navigation & search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }

      // Ignore arrow keys if typing in input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'ArrowLeft' && dayDetails?.prevDate) {
        setSelectedDate(dayDetails.prevDate);
      } else if (e.key === 'ArrowRight' && dayDetails?.nextDate) {
        setSelectedDate(dayDetails.nextDate);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dayDetails?.prevDate, dayDetails?.nextDate]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
      {/* App Header */}
      <Header
        appStatus={appStatus}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400">
            <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">
              Loading Chrome History...
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Indexing calendar days and visits from Google Takeout
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Sticky Calendar Column */}
            <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 space-y-4">
              <CalendarView
                calendarOverview={calendarOverview}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </aside>

            {/* Right: Daily History Inspector */}
            <section className="lg:col-span-7 xl:col-span-8 min-w-0">
              <DayView
                dayDetails={dayDetails}
                isLoading={isLoadingDay}
                onSelectDate={setSelectedDate}
              />
            </section>
          </div>
        )}
      </main>

      {/* Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectDate={setSelectedDate}
        onSearchGlobal={handleGlobalSearch}
      />

      <OverallStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={overallStats}
        onSelectDate={setSelectedDate}
      />

      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onFileParsed={handleFileParsed}
      />
    </div>
  );
};
