import React from 'react';
import { OverallStats } from '../../types';
import { formatDateReadable } from '../../utils/dateUtils';
import { getDomainColor } from '../../utils/domainColors';
import { BarChart3, Calendar, Globe, X, Flame, Clock } from 'lucide-react';

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
  if (!isOpen || !stats) return null;

  const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxDayOfWeek = Math.max(...stats.dayOfWeekDistribution, 1);
  const maxHourly = Math.max(...stats.hourlyDistribution, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BarChart3 size={20} className="text-brand-500" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
              All-Time Chrome Browsing Insights
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-400 font-medium mb-1">Total History Items</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalEntries.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-400 font-medium mb-1">Active Browsing Days</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalDays.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-400 font-medium mb-1">Average Visits / Day</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalDays > 0 ? Math.round(stats.totalEntries / stats.totalDays) : 0}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
                <Flame size={13} className="text-amber-500" />
                <span>Peak Day</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {stats.peakDay ? (
                  <button
                    onClick={() => {
                      onSelectDate(stats.peakDay.date);
                      onClose();
                    }}
                    className="text-brand-600 dark:text-brand-400 hover:underline text-left"
                  >
                    {stats.peakDay.count.toLocaleString()} visits ({stats.peakDay.date})
                  </button>
                ) : (
                  '–'
                )}
              </div>
            </div>
          </div>

          {/* Date Range notice */}
          {stats.minDate && stats.maxDate && (
            <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <Calendar size={14} className="text-brand-500 flex-shrink-0" />
              <span>
                Data spans from <strong>{formatDateReadable(stats.minDate)}</strong> to{' '}
                <strong>{formatDateReadable(stats.maxDate)}</strong>.
              </span>
            </div>
          )}

          {/* Day of Week Distribution */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Activity by Day of Week</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((dayName, idx) => {
                const count = stats.dayOfWeekDistribution[idx];
                const heightPercent = Math.max((count / maxDayOfWeek) * 100, 6);
                return (
                  <div key={dayName} className="flex flex-col items-center">
                    <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 flex flex-col justify-end items-center">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-brand-500 dark:bg-brand-400 rounded-sm transition-all"
                        title={`${dayName}: ${count.toLocaleString()} visits`}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1.5">
                      {dayName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {Math.round(count / 1000)}k
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All-Time Hourly Distribution */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock size={14} />
              <span>All-Time Browsing Hours (24h)</span>
            </div>
            <div className="flex items-end gap-1 h-20 pt-2 px-1">
              {stats.hourlyDistribution.map((count, hour) => {
                const heightPercent = Math.max((count / maxHourly) * 100, 4);
                return (
                  <div
                    key={hour}
                    className="flex-1 h-full flex flex-col justify-end items-center group relative"
                    title={`${hour}:00 - ${count.toLocaleString()} visits`}
                  >
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-brand-400 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-400 rounded-t-xs transition-all"
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1 font-mono">
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>11 PM</span>
            </div>
          </div>

          {/* Top 20 All-Time Domains */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Globe size={14} />
              <span>Top 20 Most Visited Domains (All Time)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {stats.topDomains.slice(0, 20).map(({ domain, count }, idx) => {
                const colors = getDomainColor(domain);
                const percent = Math.round((count / stats.totalEntries) * 100);

                return (
                  <div
                    key={domain}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold font-mono text-slate-400 w-5">
                        #{idx + 1}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md border font-semibold truncate ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        {domain}
                      </span>
                    </div>

                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {count.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">({percent}%)</span>
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

