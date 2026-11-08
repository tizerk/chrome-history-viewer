import React, { useState } from 'react';
import { HistoryEntry } from '../../types';
import { formatDuration } from '../../utils/dateUtils';
import { getDomainColor, getFaviconUrl } from '../../utils/domainColors';
import { Clock, Coffee, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

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
  // Group entries by session (gap > 25 mins)
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
        // Close current session
        const startEntry = currentSessionEntries[0];
        const endEntry = currentSessionEntries[currentSessionEntries.length - 1];
        const durationMins = Math.max(1, Math.round((endEntry.time_ms - startEntry.time_ms) / 60000));

        // Top domains in session
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

  // Track expanded sessions (default all open)
  const [expandedSessions, setExpandedSessions] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    sessions.forEach((s) => (init[s.id] = true));
    return init;
  });

  const toggleSession = (id: number) => {
    setExpandedSessions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-500 pb-1">
        Found {sessions.length} browsing session{sessions.length > 1 ? 's' : ''} with breaks longer than 25 minutes.
      </div>

      {sessions.map((session, index) => {
        const isExpanded = expandedSessions[session.id] ?? true;

        // Gap from previous session
        let gapNotice = null;
        if (index > 0) {
          const prevEndMs = sessions[index - 1].entries[sessions[index - 1].entries.length - 1].time_ms;
          const curStartMs = session.entries[0].time_ms;
          const gapMinutes = Math.round((curStartMs - prevEndMs) / 60000);
          gapNotice = (
            <div className="flex items-center justify-center my-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700/80">
                <Coffee size={13} className="text-amber-500" />
                <span>{formatDuration(gapMinutes)} break</span>
              </div>
            </div>
          );
        }

        return (
          <React.Fragment key={session.id}>
            {gapNotice}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div
                onClick={() => toggleSession(session.id)}
                className="p-4 cursor-pointer bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-colors flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 p-0.5">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-brand-500" />
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                      Session {index + 1}: {session.startTime} – {session.endTime}
                    </span>
                  </div>

                  <span className="text-xs bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800 font-medium">
                    {formatDuration(session.durationMinutes)}
                  </span>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({session.entries.length} page{session.entries.length > 1 ? 's' : ''})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {session.topDomains.map(({ domain, count }) => {
                    const c = getDomainColor(domain);
                    return (
                      <button
                        key={domain}
                        onClick={(e) => {
                          e.stopPropagation();
                          onFilterDomain(domain);
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded-md border font-medium transition-colors ${c.bg} ${c.text} ${c.border}`}
                      >
                        {domain} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {isExpanded && (
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-96 overflow-y-auto">
                  {session.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="py-2 px-2 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg group"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="font-mono text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0">
                          {entry.time_formatted}
                        </span>
                        <img
                          src={getFaviconUrl(entry.domain, entry.favicon_url)}
                          alt=""
                          className="w-4 h-4 mt-0.5 rounded-xs object-contain flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="min-w-0">
                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-xs font-medium text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:underline line-clamp-1"
                          >
                            {entry.title}
                          </a>
                          <div className="text-[11px] text-slate-400 truncate font-mono">
                            {entry.url}
                          </div>
                        </div>
                      </div>

                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="p-1 text-slate-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

