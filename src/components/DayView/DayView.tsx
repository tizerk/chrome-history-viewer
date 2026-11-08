import React, { useState, useMemo } from 'react';
import { DayDetails, SortOrder, ViewMode } from '../../types';
import { formatDateReadable, formatDuration } from '../../utils/dateUtils';
import { HourlyChart } from './HourlyChart';
import { CollapsedGroup, TimelineEntry } from './TimelineEntry';
import { DomainGroupView } from './DomainGroupView';
import { SessionGroupView } from './SessionGroupView';
import { getDomainColor } from '../../utils/domainColors';
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

  // Reset filters when date changes
  React.useEffect(() => {
    setSearchQuery('');
    setSelectedDomain(null);
    setSelectedHour(null);
  }, [dayDetails?.date]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    if (!dayDetails?.entries) return [];

    let list = [...dayDetails.entries];

    // Filter by domain
    if (selectedDomain) {
      list = list.filter((e) => e.domain.toLowerCase() === selectedDomain.toLowerCase());
    }

    // Filter by hour
    if (selectedHour !== null) {
      list = list.filter((e) => {
        const d = new Date(e.time_ms);
        return d.getHours() === selectedHour;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.url.toLowerCase().includes(q) ||
          e.domain.toLowerCase().includes(q)
      );
    }

    // Sort order
    list.sort((a, b) => {
      return sortOrder === 'desc' ? b.time_ms - a.time_ms : a.time_ms - b.time_ms;
    });

    return list;
  }, [dayDetails?.entries, selectedDomain, selectedHour, searchQuery, sortOrder]);

  // Group consecutive duplicates for Timeline view
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
        // Same url or same title within 10 minutes
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

  // Export JSON
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
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Loading activity for selected date...</p>
      </div>
    );
  }

  if (!dayDetails || !dayDetails.exists || dayDetails.count === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar size={28} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
          No Browsing Activity
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          There are no recorded Chrome history visits on {dayDetails ? formatDateReadable(dayDetails.date) : 'this day'}.
        </p>
        {dayDetails?.prevDate && (
          <button
            onClick={() => onSelectDate(dayDetails.prevDate!)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 rounded-lg text-sm font-medium transition-colors"
          >
            <ChevronLeft size={16} />
            Jump to previous active day ({dayDetails.prevDate})
          </button>
        )}
      </div>
    );
  }

  const { stats } = dayDetails;
  const isFiltering = Boolean(searchQuery.trim() || selectedDomain || selectedHour !== null);

  return (
    <div className="space-y-6">
      {/* Date Header & Quick Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1">
              Browsing Activity For
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {formatDateReadable(dayDetails.date)}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => dayDetails.prevDate && onSelectDate(dayDetails.prevDate)}
              disabled={!dayDetails.prevDate}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              title={dayDetails.prevDate ? `Previous active day: ${dayDetails.prevDate}` : 'No earlier active days'}
            >
              <ChevronLeft size={16} />
              <span>Previous Day</span>
            </button>

            <button
              onClick={() => dayDetails.nextDate && onSelectDate(dayDetails.nextDate)}
              disabled={!dayDetails.nextDate}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              title={dayDetails.nextDate ? `Next active day: ${dayDetails.nextDate}` : 'No later active days'}
            >
              <span>Next Day</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Quick Day Stats Strip (3 stats: Total Visits, Unique Sites, Active Time) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              <Activity size={14} className="text-brand-500" />
              <span>Total Visits</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {dayDetails.count.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              <Globe size={14} className="text-emerald-500" />
              <span>Unique Sites</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {stats?.uniqueDomains || 0}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              <Clock size={14} className="text-indigo-500" />
              <span>Active Time</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Top Websites Today
            </span>
            {selectedDomain && (
              <button
                onClick={() => setSelectedDomain(null)}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
              >
                Clear site filter
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {stats.topDomains.map(({ domain, count }) => {
              const colors = getDomainColor(domain);
              const isSelected = selectedDomain?.toLowerCase() === domain.toLowerCase();

              return (
                <button
                  key={domain}
                  type="button"
                  onClick={() => setSelectedDomain(isSelected ? null : domain)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    isSelected
                      ? 'ring-2 ring-brand-500 ring-offset-1 font-semibold bg-brand-50 dark:bg-brand-950 border-brand-400'
                      : `${colors.bg} ${colors.text} ${colors.border} hover:opacity-85`
                  }`}
                >
                  {domain} <span className="opacity-70 font-mono text-[11px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Real-time search inside current day */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search titles, URLs or domains in this day..."
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('domain')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'domain'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              By Site
            </button>
            <button
              onClick={() => setViewMode('session')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'session'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              By Session
            </button>
          </div>
        </div>

        {/* Secondary controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Collapse duplicates checkbox (only for timeline) */}
            {viewMode === 'timeline' && (
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={collapseDuplicates}
                  onChange={(e) => setCollapseDuplicates(e.target.checked)}
                  className="rounded-sm text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                />
                <span>Collapse consecutive duplicates</span>
              </label>
            )}

            {/* Sort order toggle (only for timeline and by site, NOT by session) */}
            {viewMode !== 'session' && (
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              >
                <ArrowUpDown size={13} />
                <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
              </button>
            )}
          </div>

          {/* Export action */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportDayJSON}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              title="Export this day's entries as JSON"
            >
              <Download size={13} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Active filters notice with clear, high-contrast coloration */}
        {isFiltering && (
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-lg text-xs text-slate-800 dark:text-slate-100 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={13} className="text-brand-600 dark:text-brand-400 flex-shrink-0" />
              <span>
                Showing <strong className="text-brand-600 dark:text-brand-400">{filteredEntries.length}</strong> of{' '}
                <strong>{dayDetails.count}</strong> visits
                {selectedDomain && (
                  <span>
                    {' '}on <em className="not-italic font-semibold text-slate-900 dark:text-white">"{selectedDomain}"</em>
                  </span>
                )}
                {selectedHour !== null && (
                  <span>
                    {' '}during <em className="not-italic font-semibold text-slate-900 dark:text-white">{selectedHour}:00</em>
                  </span>
                )}
                {searchQuery && (
                  <span>
                    {' '}matching <em className="not-italic font-semibold text-slate-900 dark:text-white">"{searchQuery}"</em>
                  </span>
                )}
              </span>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDomain(null);
                setSelectedHour(null);
              }}
              className="underline font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 ml-3 flex-shrink-0"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center shadow-xs">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            No entries found matching your active filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDomain(null);
              setSelectedHour(null);
            }}
            className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'timeline' ? (
        <div className="pt-2">
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
