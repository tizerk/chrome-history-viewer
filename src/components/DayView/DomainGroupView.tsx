import React, { useState } from 'react';
import { HistoryEntry } from '../../types';
import { getFaviconUrl } from '../../utils/domainColors';
import { ChevronDown, ChevronRight, Globe } from 'lucide-react';

interface DomainGroupViewProps {
  entries: HistoryEntry[];
  onFilterDomain: (domain: string) => void;
}

export const DomainGroupView: React.FC<DomainGroupViewProps> = ({ entries, onFilterDomain }) => {
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});

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
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-[#86868B] dark:text-[#A1A1A6] px-1 pb-1">
        <span>{sortedDomains.length} websites visited</span>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="hover:text-[#007AFF] dark:hover:text-[#0A84FF] transition-colors"
          >
            Expand All
          </button>
          <span>•</span>
          <button
            onClick={collapseAll}
            className="hover:text-[#007AFF] dark:hover:text-[#0A84FF] transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)] divide-y divide-black/[0.05] dark:divide-white/[0.06]">
        {sortedDomains.map(([domain, domainEntries]) => {
          const isExpanded = expandedDomains[domain] ?? false;
          const faviconUrl = getFaviconUrl(domain, domainEntries[0]?.favicon_url);

          return (
            <div key={domain}>
              <div
                onClick={() => toggleDomain(domain)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-black/[0.025] dark:hover:bg-white/[0.035] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[#86868B] p-0.5">
                    {isExpanded ? <ChevronDown size={14} strokeWidth={2} /> : <ChevronRight size={14} strokeWidth={2} />}
                  </span>

                  {faviconUrl ? (
                    <img
                      src={faviconUrl}
                      alt=""
                      className="w-4 h-4 rounded-[3px] object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Globe size={14} className="text-[#86868B] flex-shrink-0" />
                  )}

                  <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7] text-[13px] truncate">
                    {domain}
                  </span>

                  <span className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] px-2 py-0.2 rounded-full bg-black/[0.04] dark:bg-white/[0.08]">
                    {domainEntries.length}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilterDomain(domain);
                  }}
                  className="text-xs text-[#007AFF] dark:text-[#0A84FF] hover:underline px-2 py-0.5"
                >
                  Filter
                </button>
              </div>

              {isExpanded && (
                <div className="pl-9 pr-3 py-1.5 bg-black/[0.015] dark:bg-white/[0.02] border-t border-black/[0.04] dark:border-white/[0.05] divide-y divide-black/[0.03] dark:divide-white/[0.04] max-h-80 overflow-y-auto">
                  {domainEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="py-1.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[11px] text-[#86868B] dark:text-[#8E8E93] flex-shrink-0">
                          {entry.time_formatted}
                        </span>
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
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
