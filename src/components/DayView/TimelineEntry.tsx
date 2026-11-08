import React, { useState } from 'react';
import { HistoryEntry } from '../../types';
import { getFaviconUrl } from '../../utils/domainColors';
import { Copy, Check, Globe, ChevronDown, ChevronRight, CornerDownRight } from 'lucide-react';

export interface CollapsedGroup {
  leadEntry: HistoryEntry;
  duplicates: HistoryEntry[];
}

interface TimelineEntryProps {
  group: CollapsedGroup;
  onFilterDomain: (domain: string) => void;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({ group, onFilterDomain }) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [faviconFailed, setFaviconFailed] = useState(false);

  const { leadEntry, duplicates } = group;
  const hasDuplicates = duplicates.length > 0;

  const handleCopy = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group/row transition-colors px-3 py-2 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        {/* Time, Favicon, Title, Domain */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {/* Time */}
          <span className="font-mono text-[11px] text-[#86868B] dark:text-[#8E8E93] mt-0.5 flex-shrink-0 w-16">
            {leadEntry.time_formatted}
          </span>

          {/* Favicon */}
          <div className="mt-0.5 flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {!faviconFailed ? (
              <img
                src={getFaviconUrl(leadEntry.domain, leadEntry.favicon_url)}
                alt=""
                className="w-4 h-4 object-contain rounded-[3px]"
                onError={() => setFaviconFailed(true)}
              />
            ) : (
              <Globe size={13} className="text-[#86868B]" />
            )}
          </div>

          {/* Title & Domain */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <a
                href={leadEntry.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[13px] font-normal text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#007AFF] dark:hover:text-[#0A84FF] hover:underline line-clamp-1 transition-colors"
              >
                {leadEntry.title}
              </a>

              <button
                type="button"
                onClick={() => onFilterDomain(leadEntry.domain)}
                className="text-[11px] text-[#86868B] dark:text-[#8E8E93] hover:text-[#007AFF] dark:hover:text-[#0A84FF] transition-colors"
                title={`Filter ${leadEntry.domain}`}
              >
                {leadEntry.domain}
              </button>
            </div>

            <div className="text-[11px] text-[#86868B]/70 dark:text-[#8E8E93]/70 truncate font-mono mt-0.5">
              {leadEntry.url}
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {hasDuplicates && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-[#86868B] dark:text-[#A1A1A6] font-medium transition-colors"
              title="Toggle repeated visits"
            >
              {isExpanded ? <ChevronDown size={12} strokeWidth={2} /> : <ChevronRight size={12} strokeWidth={2} />}
              +{duplicates.length}
            </button>
          )}

          <button
            onClick={(e) => handleCopy(e, leadEntry.url)}
            className="p-1 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white rounded-md opacity-0 group-hover/row:opacity-100 hover:bg-black/[0.05] dark:hover:bg-white/[0.1] transition-all"
            title="Copy URL"
          >
            {copied ? <Check size={13} className="text-[#34C759]" strokeWidth={2} /> : <Copy size={13} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Expandable duplicate visits */}
      {hasDuplicates && isExpanded && (
        <div className="mt-2 ml-16 pl-3 border-l border-black/[0.08] dark:border-white/[0.1] space-y-1.5 py-1">
          {duplicates.map((dup) => (
            <div
              key={dup.id}
              className="flex items-center justify-between text-xs py-0.5 rounded-md hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <CornerDownRight size={12} className="text-[#86868B] flex-shrink-0" />
                <span className="font-mono text-[#86868B] text-[11px] flex-shrink-0">
                  {dup.time_formatted}
                </span>
                <a
                  href={dup.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="truncate text-[12px] hover:underline text-[#1D1D1F] dark:text-[#E5E5EA]"
                >
                  {dup.title}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
