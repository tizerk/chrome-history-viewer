import React, { useState } from 'react';
import { HistoryEntry } from '../../types';
import { getDomainColor, getFaviconUrl } from '../../utils/domainColors';
import { ExternalLink, Copy, Check, Globe, ChevronDown, ChevronRight, CornerDownRight } from 'lucide-react';

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
  const domainColors = getDomainColor(leadEntry.domain);
  const hasDuplicates = duplicates.length > 0;

  const handleCopy = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group/row relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 pb-5 transition-colors">
      {/* Timeline indicator node */}
      <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-2 border-brand-500 group-hover/row:scale-125 transition-transform" />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 shadow-xs hover:border-brand-300 dark:hover:border-brand-700/60 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {leadEntry.time_formatted}
            </span>

            <button
              onClick={() => onFilterDomain(leadEntry.domain)}
              className={`text-xs px-2 py-0.5 rounded-md font-medium border transition-colors ${domainColors.bg} ${domainColors.text} ${domainColors.border} hover:opacity-85`}
              title={`Filter all entries on ${leadEntry.domain}`}
            >
              {leadEntry.domain}
            </button>

            {leadEntry.transition === 'CLIENT_REDIRECT' && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-1.5 py-0.2 rounded-sm font-mono">
                Redirect
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {hasDuplicates && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                title="Toggle repeated visits"
              >
                {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                +{duplicates.length} repeat{duplicates.length > 1 ? 's' : ''}
              </button>
            )}

            <button
              onClick={(e) => handleCopy(e, leadEntry.url)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>

            <a
              href={leadEntry.url}
              target="_blank"
              rel="noreferrer noopener"
              className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Open link in new tab"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Title and Favicon */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {!faviconFailed ? (
              <img
                src={getFaviconUrl(leadEntry.domain, leadEntry.favicon_url)}
                alt=""
                className="w-4 h-4 object-contain rounded-xs"
                onError={() => setFaviconFailed(true)}
              />
            ) : (
              <Globe size={14} className="text-slate-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <a
              href={leadEntry.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 hover:underline line-clamp-2 transition-colors break-words"
            >
              {leadEntry.title}
            </a>

            <div className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5 font-mono">
              {leadEntry.url}
            </div>
          </div>
        </div>

        {/* Expandable duplicate visits */}
        {hasDuplicates && isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Consecutive repeated visits:
            </div>
            {duplicates.map((dup) => (
              <div
                key={dup.id}
                className="flex items-center justify-between text-xs pl-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <CornerDownRight size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="font-mono text-slate-500 text-[11px] flex-shrink-0">
                    {dup.time_formatted}
                  </span>
                  <a
                    href={dup.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="truncate hover:underline text-slate-700 dark:text-slate-300"
                  >
                    {dup.title}
                  </a>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={dup.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-1 text-slate-400 hover:text-brand-600"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

