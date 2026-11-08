import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { CalendarView } from './components/Calendar/CalendarView';
import { DayView } from './components/DayView/DayView';
import { GlobalSearchModal } from './components/Modals/GlobalSearchModal';
import { OverallStatsModal } from './components/Modals/OverallStatsModal';
import { FileUploadModal } from './components/Modals/FileUploadModal';
import { AppStatus, CalendarOverview, DayDetails, HistoryEntry, OverallStats } from './types';
import { parseHistoryFile, ParseResult } from './utils/clientParser';
import { History, UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // App & Data states - starts with NO data
  const [appStatus, setAppStatus] = useState<AppStatus | null>(null);
  const [calendarOverview, setCalendarOverview] = useState<CalendarOverview | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dayDetails, setDayDetails] = useState<DayDetails | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [customDaysMap, setCustomDaysMap] = useState<Map<string, DayDetails> | null>(null);

  // Upload state for the welcome screen
  const [isParsingLanding, setIsParsingLanding] = useState(false);
  const [landingProgress, setLandingProgress] = useState(0);
  const [landingError, setLandingError] = useState<string | null>(null);
  const [isDraggingLanding, setIsDraggingLanding] = useState(false);
  const landingFileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle uploaded file result
  const handleFileParsed = useCallback((result: ParseResult, _fileName?: string) => {
    setCalendarOverview(result.calendar);
    setCustomDaysMap(result.daysMap);

    // Compute overall stats from parsed days
    const domainCounts = new Map<string, number>();
    const hourlyDistribution = new Array(24).fill(0);
    const dayOfWeekDistribution = new Array(7).fill(0);
    let peakDay = { date: '', count: 0 };

    for (const [dateStr, dayRec] of result.daysMap.entries()) {
      if (dayRec.count > peakDay.count) {
        peakDay = { date: dateStr, count: dayRec.count };
      }
      for (const entry of dayRec.entries) {
        domainCounts.set(entry.domain, (domainCounts.get(entry.domain) || 0) + 1);
        const d = new Date(entry.time_ms);
        hourlyDistribution[d.getHours()]++;
        dayOfWeekDistribution[d.getDay()]++;
      }
    }

    const topDomains = Array.from(domainCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([domain, count]) => ({ domain, count }));

    setOverallStats({
      totalEntries: result.totalEntries,
      totalDays: result.calendar.totalDays,
      minDate: result.calendar.minDate,
      maxDate: result.calendar.maxDate,
      peakDay,
      topDomains,
      hourlyDistribution,
      dayOfWeekDistribution,
    });

    setAppStatus({
      available: true,
      isLoading: false,
      totalEntries: result.totalEntries,
      totalDays: result.calendar.totalDays,
      minDate: result.calendar.minDate,
      maxDate: result.calendar.maxDate,
      peakDay,
    });

    if (result.calendar.maxDate) {
      setSelectedDate(result.calendar.maxDate);
    }
  }, []);

  // Landing file selector / drop handler
  const handleLandingFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setLandingError('Please select a valid Chrome history JSON file (e.g. History.json).');
      return;
    }

    setLandingError(null);
    setIsParsingLanding(true);
    setLandingProgress(10);

    try {
      const result = await parseHistoryFile(file, (p) => setLandingProgress(p));
      handleFileParsed(result, file.name);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setLandingError(err?.message || 'Failed to parse JSON file.');
    } finally {
      setIsParsingLanding(false);
    }
  };

  // Sync day details whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate || !customDaysMap) return;

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
        stats: null,
      });
    }
  }, [selectedDate, customDaysMap]);

  // Global search callback
  const handleGlobalSearch = useCallback(
    async (query: string): Promise<HistoryEntry[]> => {
      if (!customDaysMap) return [];
      const q = query.toLowerCase().trim();
      const results: HistoryEntry[] = [];
      for (const [d, rec] of customDaysMap.entries()) {
        for (const e of rec.entries) {
          if (
            e.title.toLowerCase().includes(q) ||
            e.url.toLowerCase().includes(q) ||
            e.domain.toLowerCase().includes(q)
          ) {
            results.push({ ...e, date: d });
            if (results.length >= 50) return results;
          }
        }
      }
      return results;
    },
    [customDaysMap]
  );

  // Keyboard navigation & search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (calendarOverview) {
          setIsSearchOpen((prev) => !prev);
        } else {
          setIsUploadOpen(true);
        }
      }

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
  }, [dayDetails?.prevDate, dayDetails?.nextDate, calendarOverview]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans selection:bg-[#007AFF] selection:text-white transition-colors">
      {/* App Header */}
      <Header
        appStatus={appStatus}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!calendarOverview ? (
          /* Empty / Welcome Landing Screen */
          <div className="max-w-xl mx-auto py-8 sm:py-14 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Apple App Icon */}
            <div className="w-16 h-16 rounded-[18px] bg-gradient-to-b from-[#0A84FF] via-[#007AFF] to-[#0055D4] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(0,122,255,0.25)] mx-auto mb-5 ring-1 ring-black/5 dark:ring-white/20">
              <History size={32} strokeWidth={2.2} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mb-2">
              Welcome to Chrome History
            </h2>
            <p className="text-sm text-[#86868B] dark:text-[#A1A1A6] max-w-md mx-auto mb-8 leading-relaxed">
              Upload your Google Takeout <code className="bg-black/[0.05] dark:bg-white/[0.1] px-1.5 py-0.5 rounded font-mono text-[12px] text-[#1D1D1F] dark:text-white">History.json</code> file to explore your browsing activity by calendar date, website, and session.
            </p>

            {/* Apple Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingLanding(true);
              }}
              onDragLeave={() => setIsDraggingLanding(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingLanding(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleLandingFile(e.dataTransfer.files[0]);
                }
              }}
              className={`bg-white dark:bg-[#1C1C1E] border-2 border-dashed rounded-3xl p-8 sm:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all ${
                isDraggingLanding
                  ? 'border-[#007AFF] bg-[#007AFF]/5'
                  : 'border-black/10 dark:border-white/10 hover:border-[#007AFF]/50'
              }`}
            >
              <input
                ref={landingFileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleLandingFile(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF] rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud size={24} strokeWidth={2} />
              </div>

              <div className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                Drag and drop your History.json file here
              </div>
              <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mb-5">
                Processed privately inside your browser
              </p>

              <button
                type="button"
                onClick={() => landingFileInputRef.current?.click()}
                disabled={isParsingLanding}
                className="px-6 py-2.5 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                Choose File
              </button>

              {/* Progress bar */}
              {isParsingLanding && (
                <div className="mt-6 max-w-xs mx-auto space-y-1.5">
                  <div className="flex justify-between text-[11px] text-[#86868B]">
                    <span>Indexing history...</span>
                    <span>{landingProgress}%</span>
                  </div>
                  <div className="w-full bg-black/[0.05] dark:bg-white/[0.1] rounded-full h-1.5 overflow-hidden">
                    <div
                      style={{ width: `${landingProgress}%` }}
                      className="bg-[#007AFF] h-full rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              {/* Error notice */}
              {landingError && (
                <div className="mt-5 p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-2xl flex items-start gap-2 text-xs text-[#FF3B30] text-left">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span>{landingError}</span>
                </div>
              )}
            </div>

            {/* Quick helper notes */}
            <div className="mt-8 text-left bg-black/[0.025] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] rounded-2xl p-4 text-xs text-[#86868B] dark:text-[#A1A1A6] space-y-1.5">
              <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#34C759]" strokeWidth={2} />
                <span>How to export from Google Takeout:</span>
              </div>
              <ol className="list-decimal list-inside space-y-0.5 pl-1">
                <li>Visit <a href="https://takeout.google.com" target="_blank" rel="noreferrer" className="text-[#007AFF] hover:underline">takeout.google.com</a></li>
                <li>Deselect all, check <strong>Chrome</strong> (select <strong>History</strong> only)</li>
                <li>Download the export archive and drop the extracted <code>History.json</code> here</li>
              </ol>
            </div>
          </div>
        ) : (
          /* Active 2-Column Split View when data is loaded */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Sticky Calendar Column */}
            <aside className="lg:col-span-4 lg:sticky lg:top-20 space-y-3">
              <CalendarView
                calendarOverview={calendarOverview}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </aside>

            {/* Right: Daily History Inspector */}
            <section className="lg:col-span-8 min-w-0">
              <DayView
                dayDetails={dayDetails}
                isLoading={false}
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
