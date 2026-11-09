import React, { useState } from 'react';
import { HistoryEntry } from '../../types';
import { formatDuration } from '../../utils/dateUtils';
import { getFaviconUrl } from '../../utils/domainColors';
import { Clock, Coffee, ChevronDown, ChevronRight, Globe } from 'lucide-react';

interface SessionGroupViewProps {
  entries: HistoryEntry[];
  onFilterDomain: (domain: string) => void;
}

interface Session {
  id: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  gapBeforeMinutes?: number;
  entries: HistoryEntry[];
  topDomains: { domain: string; count: number }[];
}

export const SessionGroupView: React.FC<SessionGroupViewProps> = ({ entries, onFilterDomain }) => {
  const sorted = [...entries].sort((a, b) => a.time_ms - b.time_ms);

  const sessions: Session[] = [];
  if (sorted.length > 0) {
    let currentSessionEntries: HistoryEntry[] = [sorted[0]];
    let lastMs = sorted[0].time_ms;

    for (let i = 1; i < sorted.length; i++) {
      const entry = sorted[i];
      const gapMs = entry.time_ms - lastMs;
      const gapMins = Math.round(gapMs / (60 * 1000));

      if (gapMins > 25) {
        const startEntry = currentSessionEntries[0];
        const endEntry = currentSessionEntries[currentSessionEntries.length - 1];
        const durationMins = Math.max(1, Math.round((endEntry.time_ms - startEntry.time_ms) / 60000));

        const domCounts = new Map<string, number>();
        currentSessionEntries.forEach((e) => domCounts.set(e.domain, (domCounts.get(e.domain) || 0) + 1));
        const topDomains = Array.from(domCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([domain, count]) => ({ domain, count }));

        sessions.push({
          id: sessions.length,
          startTime: startEntry.time_formatted,
          endTime: endEntry.time_formatted,
          durationMinutes: durationMins,
          entries: currentSessionEntries,
          topDomains,
        });

        currentSessionEntries = [entry];
      } else {
        currentSessionEntries.push(entry);
      }
      lastMs = entry.time_ms;
    }

    if (currentSessionEntries.length > 0) {
      const startEntry = currentSessionEntries[0];
      const endEntry = currentSessionEntries[currentSessionEntries.length - 1];
      const durationMins = Math.max(1, Math.round((endEntry.time_ms - startEntry.time_ms) / 60000));
      const domCounts = new Map<string, number>();
      currentSessionEntries.forEach((e) => domCounts.set(e.domain, (domCounts.get(e.domain) || 0) + 1));
      const topDomains = Array.from(domCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([domain, count]) => ({ domain, count }));

      sessions.push({
        id: sessions.length,
        startTime: startEntry.time_formatted,
        endTime: endEntry.time_formatted,
        durationMinutes: durationMins,
        entries: currentSessionEntries,
        topDomains,
      });
    }
  }

  const [expandedSessions, setExpandedSessions] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    sessions.forEach((s) => (init[s.id] = true));
    return init;
  });

  const toggleSession = (id: number) => {
    setExpandedSessions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-[#86868B] dark:text-[#A1A1A6] px-1 pb-1">
        {sessions.length} browsing session{sessions.length > 1 ? 's' : ''} with breaks &gt; 25 mins
      </div>

      {sessions.map((session, index) => {
        const isExpanded = expandedSessions[session.id] ?? true;

        let gapNotice = null;
        if (index > 0) {
          const prevEndMs = sessions[index - 1].entries[sessions[index - 1].entries.length - 1].time_ms;
          const curStartMs = session.entries[0].time_ms;
          const gapMinutes = Math.round((curStartMs - prevEndMs) / 60000);
          gapNotice = (
            <div className="flex items-center justify-center my-2">
              <div className="flex items-center gap-1.5 px-3 py-0.5 bg-black/[0.04] dark:bg-white/[0.08] text-[#86868B] dark:text-[#A1A1A6] rounded-full text-[11px] font-normal">
                <Coffee size={12} strokeWidth={2} />
                <span>{formatDuration(gapMinutes)} break</span>
              </div>
            </div>
          );
        }

        return (
          <React.Fragment key={session.id}>
            {gapNotice}
            <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <div
                onClick={() => toggleSession(session.id)}
                className="p-3.5 cursor-pointer hover:bg-black/[0.025] dark:hover:bg-white/[0.035] transition-colors flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[#86868B] p-0.5">
                    {isExpanded ? <ChevronDown size={14} strokeWidth={2} /> : <ChevronRight size={14} strokeWidth={2} />}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#007AFF] dark:text-[#0A84FF]" strokeWidth={2} />
                    <span className="font-medium text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                      Session {index + 1}: {session.startTime} – {session.endTime}
                    </span>
                  </div>

                  <span className="text-[11px] bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF] px-2 py-0.5 rounded-full font-medium">
                    {formatDuration(session.durationMinutes)}
                  </span>

                  <span className="text-[11px] text-[#86868B] dark:text-[#A1A1A6]">
                    ({session.entries.length} pages)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {session.topDomains.map(({ domain, count }) => (
                    <button
                      key={domain}
                      onClick={(e) => {
                        e.stopPropagation();
                        onFilterDomain(domain);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#86868B] dark:text-[#A1A1A6] hover:text-[#007AFF] transition-colors"
                    >
                      {domain} ({count})
                    </button>
                  ))}
                </div>
              </div>

              {isExpanded && (
                <div className="p-2 border-t border-black/[0.05] dark:border-white/[0.06] divide-y divide-black/[0.03] dark:divide-white/[0.04] max-h-80 overflow-y-auto">
                  {session.entries.map((entry) => {
                    const faviconUrl = getFaviconUrl(entry.domain, entry.favicon_url);
                    return (
                      <div
                        key={entry.id}
                        className="py-1.5 px-2 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[11px] text-[#86868B] dark:text-[#8E8E93] flex-shrink-0">
                            {entry.time_formatted}
                          </span>
                          {faviconUrl ? (
                            <img
                              src={faviconUrl}
                              alt=""
                              className="w-3.5 h-3.5 rounded-[2px] object-contain flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Globe size={13} className="text-[#86868B] flex-shrink-0" />
                          )}
                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-[12px] text-[#1D1D1F] dark:text-[#E5E5EA] hover:text-[#007AFF] dark:hover:text-[#0A84FF] hover:underline truncate"
                          >
                            {entry.title}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
