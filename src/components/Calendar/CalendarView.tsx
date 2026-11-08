import React, { useState, useMemo } from 'react';
import { CalendarOverview } from '../../types';
import {
  CalendarDay,
  formatMonthYear,
  getCalendarMonthDays,
  parseDateYMD,
} from '../../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';

interface CalendarViewProps {
  calendarOverview: CalendarOverview | null;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  calendarOverview,
  selectedDate,
  onSelectDate,
}) => {
  // Initialize view year & month from selectedDate or latest date
  const initialDate = useMemo(() => {
    if (selectedDate) return parseDateYMD(selectedDate);
    if (calendarOverview?.maxDate) return parseDateYMD(calendarOverview.maxDate);
    return new Date();
  }, [selectedDate, calendarOverview?.maxDate]);

  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth()); // 0-11
  const [hoveredDay, setHoveredDay] = useState<{ day: CalendarDay; count: number; topDomains?: any[] } | null>(null);

  // Sync view when selectedDate changes if not in current view
  React.useEffect(() => {
    if (selectedDate) {
      const d = parseDateYMD(selectedDate);
      if (d.getFullYear() !== viewYear || d.getMonth() !== viewMonth) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [selectedDate]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Calendar days grid
  const monthDays = useMemo(() => {
    return getCalendarMonthDays(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

  // Statistics for the currently viewed month
  const monthStats = useMemo(() => {
    if (!calendarOverview?.days) return { visits: 0, activeDays: 0, topDomain: null };

    const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
    let visits = 0;
    let activeDays = 0;
    const domainCounts = new Map<string, number>();

    for (const [d, rec] of Object.entries(calendarOverview.days)) {
      if (d.startsWith(prefix)) {
        visits += rec.count;
        activeDays++;
        rec.topDomains.forEach((t) => {
          domainCounts.set(t.domain, (domainCounts.get(t.domain) || 0) + t.count);
        });
      }
    }

    let topDomain = null;
    let maxDomainCount = 0;
    for (const [dom, cnt] of domainCounts.entries()) {
      if (cnt > maxDomainCount) {
        maxDomainCount = cnt;
        topDomain = dom;
      }
    }

    return { visits, activeDays, topDomain };
  }, [calendarOverview?.days, viewYear, viewMonth]);

  // Heat map intensity calculator
  const getHeatClass = (count: number, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-brand-600 text-white font-bold ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900';
    }
    if (count === 0) {
      return 'text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/60';
    }
    if (count <= 50) {
      return 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-800/60 hover:bg-sky-100';
    }
    if (count <= 200) {
      return 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-700 hover:bg-blue-200';
    }
    if (count <= 500) {
      return 'bg-brand-500 text-white font-medium hover:bg-brand-600 shadow-xs';
    }
    // > 500 visits
    return 'bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs ring-1 ring-indigo-400';
  };

  const availableYears = useMemo(() => {
    if (!calendarOverview?.minDate || !calendarOverview?.maxDate) {
      return [viewYear];
    }
    const minYear = parseDateYMD(calendarOverview.minDate).getFullYear();
    const maxYear = parseDateYMD(calendarOverview.maxDate).getFullYear();
    const years = [];
    for (let y = minYear; y <= maxYear; y++) {
      years.push(y);
    }
    return years;
  }, [calendarOverview?.minDate, calendarOverview?.maxDate, viewYear]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs select-none">
      {/* Month & Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <CalendarIcon size={18} className="text-brand-500" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 tracking-tight">
            {formatMonthYear(viewYear, viewMonth)}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Previous month"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Quick Year Selector */}
          {availableYears.length > 1 && (
            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {monthDays.map((calDay) => {
          const daySummary = calendarOverview?.days?.[calDay.dateStr];
          const visitCount = daySummary?.count || 0;
          const isSelected = selectedDate === calDay.dateStr;

          return (
            <div
              key={calDay.dateStr}
              className="relative aspect-square"
              onMouseEnter={() =>
                setHoveredDay({
                  day: calDay,
                  count: visitCount,
                  topDomains: daySummary?.topDomains,
                })
              }
              onMouseLeave={() => setHoveredDay(null)}
            >
              <button
                type="button"
                onClick={() => onSelectDate(calDay.dateStr)}
                className={`w-full h-full rounded-xl flex flex-col items-center justify-center text-xs transition-all duration-150 relative ${
                  !calDay.isCurrentMonth ? 'opacity-30' : 'opacity-100'
                } ${getHeatClass(visitCount, isSelected)}`}
              >
                <span className="font-medium text-[13px]">{calDay.dayNumber}</span>
                {visitCount > 0 && !isSelected && (
                  <span className="text-[9px] font-mono opacity-85 leading-none mt-0.5">
                    {visitCount > 999 ? `${Math.round(visitCount / 1000)}k` : visitCount}
                  </span>
                )}
                {isSelected && (
                  <span className="text-[9px] font-mono leading-none mt-0.5">
                    {visitCount}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Hover Tooltip display */}
      <div className="min-h-[38px] mt-3 py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
        {hoveredDay ? (
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {hoveredDay.day.dateStr}
            </span>
            : <span className="font-bold text-brand-600 dark:text-brand-400">{hoveredDay.count}</span> visits
            {hoveredDay.topDomains && hoveredDay.topDomains.length > 0 && (
              <span className="text-slate-400 ml-1">
                (top: {hoveredDay.topDomains[0].domain})
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">
            Click any date on the calendar to view its history
          </span>
        )}
      </div>

      {/* Month Summary Bar */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
        <div>
          <span>This month: </span>
          <strong className="text-slate-800 dark:text-slate-200 font-semibold">
            {monthStats.visits.toLocaleString()}
          </strong>{' '}
          visits across{' '}
          <strong className="text-slate-800 dark:text-slate-200 font-semibold">
            {monthStats.activeDays}
          </strong>{' '}
          days
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>Less active</span>
        <div className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 rounded-xs bg-slate-100 dark:bg-slate-800" title="0 visits" />
          <span className="w-3.5 h-3.5 rounded-xs bg-sky-100 dark:bg-sky-950/60" title="1-50 visits" />
          <span className="w-3.5 h-3.5 rounded-xs bg-blue-200 dark:bg-blue-900/60" title="51-200 visits" />
          <span className="w-3.5 h-3.5 rounded-xs bg-brand-500" title="201-500 visits" />
          <span className="w-3.5 h-3.5 rounded-xs bg-indigo-600" title="500+ visits" />
        </div>
        <span>More active</span>
      </div>
    </div>
  );
};
