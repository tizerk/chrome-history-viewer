import React, { useState } from 'react';

interface HourlyChartProps {
  hourly: number[];
  activeHourFilter: number | null;
  onSelectHour: (hour: number | null) => void;
}

export const HourlyChart: React.FC<HourlyChartProps> = ({
  hourly,
  activeHourFilter,
  onSelectHour,
}) => {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  const maxVisits = Math.max(...hourly, 1);
  const totalVisits = hourly.reduce((a, b) => a + b, 0);

  const formatHourLabel = (h: number) => {
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    return h < 12 ? `${h} AM` : `${h - 12} PM`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Hourly Distribution
          </span>
          {activeHourFilter !== null && (
            <button
              onClick={() => onSelectHour(null)}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
            >
              (Filtered to {formatHourLabel(activeHourFilter)} • Clear)
            </button>
          )}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {hoveredHour !== null ? (
            <span>
              <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                {formatHourLabel(hoveredHour)}
              </strong>
              : {hourly[hoveredHour]} visits (
              {totalVisits > 0
                ? Math.round((hourly[hoveredHour] / totalVisits) * 100)
                : 0}
              %)
            </span>
          ) : (
            <span>Click any bar to filter by hour</span>
          )}
        </div>
      </div>

      <div className="flex items-end gap-1 sm:gap-1.5 h-20 pt-2 px-1">
        {hourly.map((count, hour) => {
          const heightPercent = maxVisits > 0 ? Math.max((count / maxVisits) * 100, 4) : 4;
          const isSelected = activeHourFilter === hour;
          const isFilteredOut = activeHourFilter !== null && !isSelected;

          return (
            <button
              key={hour}
              type="button"
              onClick={() => onSelectHour(isSelected ? null : hour)}
              onMouseEnter={() => setHoveredHour(hour)}
              onMouseLeave={() => setHoveredHour(null)}
              className={`flex-1 h-full flex flex-col justify-end items-center group relative focus:outline-hidden transition-all ${
                isFilteredOut ? 'opacity-35' : 'opacity-100'
              }`}
              title={`${formatHourLabel(hour)}: ${count} visits`}
            >
              <div
                style={{ height: `${count > 0 ? heightPercent : 4}%` }}
                className={`w-full rounded-t-sm transition-all duration-200 ${
                  isSelected
                    ? 'bg-brand-600 dark:bg-brand-400 shadow-md ring-2 ring-brand-500 ring-offset-1'
                    : count > 0
                    ? 'bg-brand-400/80 hover:bg-brand-500 dark:bg-brand-500/80 dark:hover:bg-brand-400'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-2 px-1 font-mono">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  );
};

