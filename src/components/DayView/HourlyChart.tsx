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
    <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] dark:text-[#8E8E93]">
            Hourly Activity
          </span>
          {activeHourFilter !== null && (
            <button
              onClick={() => onSelectHour(null)}
              className="text-[11px] text-[#007AFF] dark:text-[#0A84FF] hover:underline font-medium"
            >
              (Filtered to {formatHourLabel(activeHourFilter)} • Clear)
            </button>
          )}
        </div>

        <div className="text-[12px] text-[#86868B] dark:text-[#A1A1A6]">
          {hoveredHour !== null ? (
            <span>
              <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">
                {formatHourLabel(hoveredHour)}
              </strong>
              : {hourly[hoveredHour]} visits (
              {totalVisits > 0
                ? Math.round((hourly[hoveredHour] / totalVisits) * 100)
                : 0}
              %)
            </span>
          ) : (
            <span className="text-[11px]">Click a bar to filter</span>
          )}
        </div>
      </div>

      {/* Screen Time style vertical capsule bars */}
      <div className="flex items-end gap-1.5 sm:gap-2 h-16 pt-1 px-1">
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
                isFilteredOut ? 'opacity-25' : 'opacity-100'
              }`}
              title={`${formatHourLabel(hour)}: ${count} visits`}
            >
              <div
                style={{ height: `${count > 0 ? heightPercent : 4}%` }}
                className={`w-full max-w-[8px] rounded-full transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#007AFF] shadow-xs ring-2 ring-[#007AFF]/30'
                    : count > 0
                    ? 'bg-[#007AFF]/75 hover:bg-[#007AFF] dark:bg-[#0A84FF]/75 dark:hover:bg-[#0A84FF]'
                    : 'bg-black/[0.06] dark:bg-white/[0.08]'
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="flex justify-between text-[10px] text-[#86868B] dark:text-[#8E8E93] mt-2 px-1 font-mono">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  );
};
