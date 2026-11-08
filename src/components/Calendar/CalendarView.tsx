import React, { useState, useMemo } from 'react';
import { CalendarOverview } from '../../types';
import {
  CalendarDay,
  formatMonthYear,
  getCalendarMonthDays,
  parseDateYMD,
} from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const initialDate = useMemo(() => {
    if (selectedDate) return parseDateYMD(selectedDate);
    if (calendarOverview?.maxDate) return parseDateYMD(calendarOverview.maxDate);
    return new Date();
  }, [selectedDate, calendarOverview?.maxDate]);

  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());
  const [hoveredDay, setHoveredDay] = useState<{ day: CalendarDay; count: number; topDomains?: any[] } | null>(null);

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

  const monthDays = useMemo(() => {
    return getCalendarMonthDays(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

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

  // Clean uniform styling without heat gradient colors
  const getDayStyle = (isSelected: boolean) => {
    if (isSelected) {
      return 'bg-[#007AFF] text-white font-semibold shadow-xs';
    }
    return 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08]';
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
    <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] select-none">
      {/* Month & Navigation Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
          {formatMonthYear(viewYear, viewMonth)}
        </h3>

        <div className="flex items-center gap-1">
          {availableYears.length > 1 && (
            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="text-xs bg-black/[0.04] dark:bg-white/[0.08] rounded-md px-2 py-1 font-medium text-[#1D1D1F] dark:text-[#F5F5F7] border-0 focus:outline-hidden cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="bg-white dark:bg-[#1C1C1E]">
                  {yr}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:text-[#A1A1A6] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.1] transition-colors"
            title="Previous month"
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>

          <button
            onClick={handleNextMonth}
            className="p-1 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:text-[#A1A1A6] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.1] transition-colors"
            title="Next month"
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Weekday Labels (Apple Calendar style) */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-[#8E8E93] dark:text-[#636366] mb-1.5">
        <span>S</span>
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span>S</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((calDay) => {
          const daySummary = calendarOverview?.days?.[calDay.dateStr];
          const visitCount = daySummary?.count || 0;
          const isSelected = selectedDate === calDay.dateStr;
          const hasActivity = visitCount > 0;

          return (
            <div
              key={calDay.dateStr}
              className="aspect-square flex items-center justify-center relative"
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
                className={`w-8 h-8 rounded-full flex flex-col items-center justify-center text-[13px] transition-all relative ${
                  !calDay.isCurrentMonth ? 'opacity-25' : 'opacity-100'
                } ${getDayStyle(isSelected)}`}
              >
                <span className={`leading-none ${hasActivity ? '-mt-0.5' : ''}`}>
                  {calDay.dayNumber}
                </span>
                {hasActivity && (
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      isSelected ? 'bg-white' : 'bg-[#007AFF] dark:bg-[#0A84FF]'
                    }`}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Hover Info bar */}
      <div className="min-h-[32px] mt-2 px-2.5 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] text-[12px] flex items-center justify-between text-[#86868B] dark:text-[#A1A1A6]">
        {hoveredDay ? (
          <div>
            <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {hoveredDay.day.dateStr}
            </span>
            : <span className="font-medium text-[#007AFF] dark:text-[#0A84FF]">{hoveredDay.count}</span> visits
            {hoveredDay.topDomains && hoveredDay.topDomains.length > 0 && (
              <span className="ml-1 opacity-80">
                • {hoveredDay.topDomains[0].domain}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[11px] opacity-75">
            Select a date to inspect history
          </span>
        )}
      </div>

      {/* Month Summary Bar */}
      <div className="mt-2 pt-2.5 border-t border-black/[0.05] dark:border-white/[0.06] text-[11px] text-[#86868B] dark:text-[#A1A1A6]">
        <span>{monthStats.visits.toLocaleString()} visits across {monthStats.activeDays} days</span>
      </div>
    </div>
  );
};
