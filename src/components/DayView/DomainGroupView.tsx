import React, { useState } from 'react';
import { HistoryEntry } from '../../types';
import { getDomainColor, getFaviconUrl } from '../../utils/domainColors';
import { ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

interface DomainGroupViewProps {
  entries: HistoryEntry[];
  onFilterDomain: (domain: string) => void;
}

export const DomainGroupView: React.FC<DomainGroupViewProps> = ({ entries, onFilterDomain }) => {
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});

  // Group entries by domain
  const groups = entries.reduce<Record<string, HistoryEntry[]>>((acc, entry) => {
    if (!acc[entry.domain]) {
      acc[entry.domain] = [];
    }
    acc[entry.domain].push(entry);
    return acc;
  }, {});

  const sortedDomains = Object.entries(groups).sort(
    (a, b) => b[1].length - a[1].length
  );

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domain]: !prev[domain],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    sortedDomains.forEach(([d]) => (all[d] = true));
    setExpandedDomains(all);
  };

  const collapseAll = () => {
    setExpandedDomains({});
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
        <span>{sortedDomains.length} unique sites visited today</span>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="hover:text-brand-600 dark:hover:text-brand-400 font-medium"
          >
            Expand All
          </button>
          <span>•</span>
          <button
            onClick={collapseAll}
            className="hover:text-brand-600 dark:hover:text-brand-400 font-medium"
          >
            Collapse All
          </button>
        </div>
      </div>

      {sortedDomains.map(([domain, domainEntries]) => {
        const isExpanded = expandedDomains[domain] ?? false;
        const domainColor = getDomainColor(domain);

        return (
          <div
            key={domain}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div
              onClick={() => toggleDomain(domain)}
              className="flex items-center justify-between p-3.5 cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                <img
                  src={getFaviconUrl(domain, domainEntries[0]?.favicon_url)}
                  alt=""
                  className="w-5 h-5 rounded-xs object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
                  {domain}
                </span>

                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${domainColor.bg} ${domainColor.text} ${domainColor.border}`}
                >
                  {domainEntries.length} visit{domainEntries.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilterDomain(domain);
                  }}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline px-2 py-1"
                >
                  Filter this site
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-96 overflow-y-auto">
                {domainEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="py-2 px-2 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg group"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="font-mono text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0">
                        {entry.time_formatted}
                      </span>
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
        );
      })}
    </div>
  );
};

