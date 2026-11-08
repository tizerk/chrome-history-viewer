import React, { useState, useMemo } from 'react';
import { DayDetails, SortOrder, ViewMode } from '../../types';
import { formatDateReadable, formatDuration } from '../../utils/dateUtils';
import { HourlyChart } from './HourlyChart';
import { CollapsedGroup, TimelineEntry } from './TimelineEntry';
import { DomainGroupView } from './DomainGroupView';
import { SessionGroupView } from './SessionGroupView';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Activity,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowUpDown,
  X
} from 'lucide-react';

interface DayViewProps {
  dayDetails: DayDetails | null;
  isLoading: boolean;
  onSelectDate: (dateStr: string) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  dayDetails,
  isLoading,
  onSelectDate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [collapseDuplicates, setCollapseDuplicates] = useState(true);

  React.useEffect(() => {
    setSearchQuery('');
    setSelectedDomain(null);
    setSelectedHour(null);
  }, [dayDetails?.date]);

  const filteredEntries = useMemo(() => {
    if (!dayDetails?.entries) return [];

    let list = [...dayDetails.entries];

    if (selectedDomain) {
      list = list.filter((e) => e.domain.toLowerCase() === selectedDomain.toLowerCase());
    }

    if (selectedHour !== null) {
      list = list.filter((e) => {
        const d = new Date(e.time_ms);
        return d.getHours() === selectedHour;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.url.toLowerCase().includes(q) ||
          e.domain.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      return sortOrder === 'desc' ? b.time_ms - a.time_ms : a.time_ms - b.time_ms;
    });

    return list;
  }, [dayDetails?.entries, selectedDomain, selectedHour, searchQuery, sortOrder]);

  const collapsedTimelineGroups = useMemo<CollapsedGroup[]>(() => {
    if (!collapseDuplicates) {
      return filteredEntries.map((e) => ({ leadEntry: e, duplicates: [] }));
    }

    const groups: CollapsedGroup[] = [];
    let currentGroup: CollapsedGroup | null = null;

    for (const entry of filteredEntries) {
      if (!currentGroup) {
        currentGroup = { leadEntry: entry, duplicates: [] };
      } else {
        const isSame =
          entry.url === currentGroup.leadEntry.url ||
          (entry.title === currentGroup.leadEntry.title && entry.domain === currentGroup.leadEntry.domain);

        const timeDiffMs = Math.abs(entry.time_ms - currentGroup.leadEntry.time_ms);

        if (isSame && timeDiffMs < 10 * 60 * 1000) {
          currentGroup.duplicates.push(entry);
        } else {
          groups.push(currentGroup);
          currentGroup = { leadEntry: entry, duplicates: [] };
        }
      }
    }

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [filteredEntries, collapseDuplicates]);

  const exportDayJSON = () => {
    if (!dayDetails) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dayDetails, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chrome-history-${dayDetails.date}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-[#86868B]">
        <div className="w-6 h-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Loading activity...</p>
      </div>
    );
  }

  if (!dayDetails || !dayDetails.exists || dayDetails.count === 0) {
    return (
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="w-12 h-12 bg-black/[0.03] dark:bg-white/[0.05] text-[#86868B] rounded-full flex items-center justify-center mx-auto mb-3">
          <Calendar size={22} strokeWidth={1.75} />
        </div>
        <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
          No Activity
        </h3>
        <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] max-w-sm mx-auto mb-5">
          No Chrome history recorded on {dayDetails ? formatDateReadable(dayDetails.date) : 'this day'}.
        </p>
        {dayDetails?.prevDate && (
          <button
            onClick={() => onSelectDate(dayDetails.prevDate!)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#007AFF]/10 hover:bg-[#007AFF]/15 text-[#007AFF] dark:text-[#0A84FF] rounded-full text-xs font-medium transition-colors"
          >
            <ChevronLeft size={14} strokeWidth={2} />
            Jump to previous day ({dayDetails.prevDate})
          </button>
        )}
      </div>
    );
  }

  const { stats } = dayDetails;
  const isFiltering = Boolean(searchQuery.trim() || selectedDomain || selectedHour !== null);

  return (
    <div className="space-y-4">
      {/* Date Header & Quick Navigation */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.05] dark:border-white/[0.06]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#007AFF] dark:text-[#0A84FF] mb-0.5">
              Activity For
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              {formatDateReadable(dayDetails.date)}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => dayDetails.prevDate && onSelectDate(dayDetails.prevDate)}
              disabled={!dayDetails.prevDate}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-xs font-normal text-[#1D1D1F] dark:text-[#F5F5F7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={dayDetails.prevDate ? `Previous day: ${dayDetails.prevDate}` : 'No earlier days'}
            >
              <ChevronLeft size={14} strokeWidth={2} />
              <span>Previous</span>
            </button>

            <button
              onClick={() => dayDetails.nextDate && onSelectDate(dayDetails.nextDate)}
              disabled={!dayDetails.nextDate}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-xs font-normal text-[#1D1D1F] dark:text-[#F5F5F7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={dayDetails.nextDate ? `Next day: ${dayDetails.nextDate}` : 'No later days'}
            >
              <span>Next</span>
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* 3 Metric Cards (Screen Time inspired) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="bg-black/[0.025] dark:bg-white/[0.04] p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.05]">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#86868B] dark:text-[#8E8E93] mb-1">
              <Activity size={13} className="text-[#007AFF] dark:text-[#0A84FF]" strokeWidth={2} />
              <span>Total Visits</span>
            </div>
            <div className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              {dayDetails.count.toLocaleString()}
            </div>
          </div>

          <div className="bg-black/[0.025] dark:bg-white/[0.04] p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.05]">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#86868B] dark:text-[#8E8E93] mb-1">
              <Globe size={13} className="text-[#34C759]" strokeWidth={2} />
              <span>Websites</span>
            </div>
            <div className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              {stats?.uniqueDomains || 0}
            </div>
          </div>

          <div className="bg-black/[0.025] dark:bg-white/[0.04] p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.05]">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#86868B] dark:text-[#8E8E93] mb-1">
              <Clock size={13} className="text-[#5856D6]" strokeWidth={2} />
              <span>Active Time</span>
            </div>
            <div className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              ~{formatDuration(stats?.estimatedActiveMinutes || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Chart */}
      {stats?.hourly && (
        <HourlyChart
          hourly={stats.hourly}
          activeHourFilter={selectedHour}
          onSelectHour={setSelectedHour}
        />
      )}

      {/* Top Domains Pill Cloud */}
      {stats?.topDomains && stats.topDomains.length > 0 && (
        <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] dark:text-[#8E8E93]">
              Top Sites
            </span>
            {selectedDomain && (
              <button
                onClick={() => setSelectedDomain(null)}
                className="text-[11px] text-[#007AFF] dark:text-[#0A84FF] hover:underline font-medium"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {stats.topDomains.map(({ domain, count }) => {
              const isSelected = selectedDomain?.toLowerCase() === domain.toLowerCase();

              return (
                <button
                  key={domain}
                  type="button"
                  onClick={() => setSelectedDomain(isSelected ? null : domain)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                    isSelected
                      ? 'bg-[#007AFF] text-white shadow-xs font-semibold'
                      : 'bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7]'
                  }`}
                >
                  {domain} <span className="opacity-60 text-[11px] ml-0.5">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls & Filter Toolbar */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Real-time search inside current day */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" strokeWidth={2} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in this day..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] border-0 focus:outline-hidden focus:ring-2 focus:ring-[#007AFF]/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
              >
                <X size={13} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Apple Segmented Control */}
          <div className="flex items-center bg-black/[0.05] dark:bg-white/[0.08] p-0.5 rounded-full self-start sm:self-auto">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-[#636366] text-[#1D1D1F] dark:text-white shadow-xs'
                  : 'text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('domain')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === 'domain'
                  ? 'bg-white dark:bg-[#636366] text-[#1D1D1F] dark:text-white shadow-xs'
                  : 'text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              By Site
            </button>
            <button
              onClick={() => setViewMode('session')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === 'session'
                  ? 'bg-white dark:bg-[#636366] text-[#1D1D1F] dark:text-white shadow-xs'
                  : 'text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              By Session
            </button>
          </div>
        </div>

        {/* Secondary controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-black/[0.05] dark:border-white/[0.06] text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {viewMode === 'timeline' && (
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-[#86868B] dark:text-[#A1A1A6]">
                <input
                  type="checkbox"
                  checked={collapseDuplicates}
                  onChange={(e) => setCollapseDuplicates(e.target.checked)}
                  className="rounded text-[#007AFF] focus:ring-[#007AFF] h-3.5 w-3.5"
                />
                <span>Collapse repeats</span>
              </label>
            )}

            {viewMode !== 'session' && (
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-1 text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
              >
                <ArrowUpDown size={12} strokeWidth={2} />
                <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportDayJSON}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] text-[11px] font-normal transition-colors"
              title="Export as JSON"
            >
              <Download size={12} strokeWidth={2} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Active filters callout */}
        {isFiltering && (
          <div className="flex items-center justify-between bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.08] px-3 py-1.5 rounded-xl text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter size={12} className="text-[#007AFF] dark:text-[#0A84FF] flex-shrink-0" strokeWidth={2} />
              <span>
                Showing <strong className="font-semibold text-[#007AFF] dark:text-[#0A84FF]">{filteredEntries.length}</strong> of{' '}
                <strong>{dayDetails.count}</strong> visits
                {selectedDomain && <span> on <em className="not-italic font-semibold">"{selectedDomain}"</em></span>}
                {selectedHour !== null && <span> at <em className="not-italic font-semibold">{selectedHour}:00</em></span>}
                {searchQuery && <span> matching <em className="not-italic font-semibold">"{searchQuery}"</em></span>}
              </span>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDomain(null);
                setSelectedHour(null);
              }}
              className="text-[#007AFF] dark:text-[#0A84FF] hover:underline font-medium ml-2 text-[11px]"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Main Content List / Canvas */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mb-3">
            No visits matching your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDomain(null);
              setSelectedHour(null);
            }}
            className="px-3 py-1.5 bg-[#007AFF] text-white rounded-full text-xs font-medium hover:bg-[#0062CC] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'timeline' ? (
        <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)] divide-y divide-black/[0.03] dark:divide-white/[0.04]">
          {collapsedTimelineGroups.map((group) => (
            <TimelineEntry
              key={group.leadEntry.id}
              group={group}
              onFilterDomain={(dom) => setSelectedDomain(dom)}
            />
          ))}
        </div>
      ) : viewMode === 'domain' ? (
        <DomainGroupView
          entries={filteredEntries}
          onFilterDomain={(dom) => setSelectedDomain(dom)}
        />
      ) : (
        <SessionGroupView
          entries={filteredEntries}
          onFilterDomain={(dom) => setSelectedDomain(dom)}
        />
      )}
    </div>
  );
};
