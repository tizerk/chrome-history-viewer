import React, { useEffect } from 'react';
import { OverallStats } from '../../types';
import { formatDateReadable } from '../../utils/dateUtils';
import { BarChart2, Calendar, X, Clock, Flame, Globe } from 'lucide-react';

interface OverallStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: OverallStats | null;
  onSelectDate: (dateStr: string) => void;
}

export const OverallStatsModal: React.FC<OverallStatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onSelectDate,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !stats) return null;

  const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxDayOfWeek = Math.max(...stats.dayOfWeekDistribution, 1);
  const maxHourly = Math.max(...stats.hourlyDistribution, 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl backdrop-blur-2xl bg-white/95 dark:bg-[#1E1E1E]/95 border border-black/10 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[82vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-[#007AFF] dark:text-[#0A84FF]" strokeWidth={2} />
            <h3 className="font-semibold text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7]">
              All-Time Analytics
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.1] transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-black/[0.025] dark:bg-white/[0.04] p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.05]">
              <div className="text-[11px] text-[#86868B] font-medium mb-0.5">Total Visits</div>
              <div className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                {stats.totalEntries.toLocaleString()}
              </div>
            </div>

            <div className="bg-black/[0.025] dark:bg-white/[0.04] p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.05]">
              <div className="text-[11px] text-[#86868B] font-medium mb-0.5">Active Days</div>
              <div className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                {stats.totalDays.toLocaleString()}
              </div>
            </div>

            <div className="bg-black/[0.025] dark:bg-white/[0.04] p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.05]">
              <div className="text-[11px] text-[#86868B] font-medium mb-0.5">Daily Average</div>
              <div className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                {stats.totalDays > 0 ? Math.round(stats.totalEntries / stats.totalDays) : 0}
              </div>
            </div>

            <div className="bg-black/[0.025] dark:bg-white/[0.04] p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.05]">
              <div className="text-[11px] text-[#86868B] font-medium mb-0.5 flex items-center gap-1">
                <Flame size={12} className="text-[#FF9500]" strokeWidth={2} />
                <span>Peak Day</span>
              </div>
              <div className="text-[13px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {stats.peakDay ? (
                  <button
                    onClick={() => {
                      onSelectDate(stats.peakDay.date);
                      onClose();
                    }}
                    className="text-[#007AFF] dark:text-[#0A84FF] hover:underline"
                  >
                    {stats.peakDay.count.toLocaleString()} visits
                  </button>
                ) : (
                  '–'
                )}
              </div>
            </div>
          </div>

          {/* Date range callout */}
          {stats.minDate && stats.maxDate && (
            <div className="text-xs text-[#86868B] dark:text-[#A1A1A6] flex items-center gap-1.5 bg-black/[0.025] dark:bg-white/[0.04] p-2.5 rounded-xl border border-black/[0.04] dark:border-white/[0.05]">
              <Calendar size={13} className="text-[#007AFF] flex-shrink-0" strokeWidth={2} />
              <span>
                History from <strong>{formatDateReadable(stats.minDate)}</strong> to{' '}
                <strong>{formatDateReadable(stats.maxDate)}</strong>
              </span>
            </div>
          )}

          {/* Day of Week Distribution */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] dark:text-[#8E8E93] mb-2">
              Weekly Distribution
            </div>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((dayName, idx) => {
                const count = stats.dayOfWeekDistribution[idx];
                const heightPercent = Math.max((count / maxDayOfWeek) * 100, 6);
                return (
                  <div key={dayName} className="flex flex-col items-center">
                    <div className="w-full h-20 bg-black/[0.025] dark:bg-white/[0.04] rounded-lg p-1 flex flex-col justify-end items-center">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[12px] bg-[#007AFF] rounded-full transition-all"
                        title={`${dayName}: ${count.toLocaleString()} visits`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mt-1">
                      {dayName}
                    </span>
                    <span className="text-[9px] text-[#86868B] font-mono">
                      {Math.round(count / 1000)}k
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hourly 24h Distribution */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] dark:text-[#8E8E93] mb-2 flex items-center gap-1.5">
              <Clock size={12} strokeWidth={2} />
              <span>Activity by Hour of Day</span>
            </div>
            <div className="flex items-end gap-1.5 h-16 pt-1 px-1">
              {stats.hourlyDistribution.map((count, hour) => {
                const heightPercent = Math.max((count / maxHourly) * 100, 4);
                return (
                  <div
                    key={hour}
                    className="flex-1 h-full flex flex-col justify-end items-center"
                    title={`${hour}:00 - ${count.toLocaleString()} visits`}
                  >
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[6px] bg-[#007AFF]/75 hover:bg-[#007AFF] rounded-full transition-all"
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-[#86868B] mt-1.5 px-1 font-mono">
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>11 PM</span>
            </div>
          </div>

          {/* Top 20 Most Visited Websites */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] dark:text-[#8E8E93] mb-2 flex items-center gap-1.5">
              <Globe size={12} strokeWidth={2} />
              <span>Top Websites (All Time)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {stats.topDomains.slice(0, 20).map(({ domain, count }, idx) => {
                const percent = Math.round((count / stats.totalEntries) * 100);

                return (
                  <div
                    key={domain}
                    className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono text-[#86868B] w-4">
                        #{idx + 1}
                      </span>
                      <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                        {domain}
                      </span>
                    </div>

                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {count.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#86868B] ml-1">({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
