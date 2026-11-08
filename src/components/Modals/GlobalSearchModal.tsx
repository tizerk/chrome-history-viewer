import React, { useState, useEffect, useRef } from 'react';
import { HistoryEntry } from '../../types';
import { formatDateReadable } from '../../utils/dateUtils';
import { getDomainColor, getFaviconUrl } from '../../utils/domainColors';
import { Search, X, Calendar, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (dateStr: string) => void;
  onSearchGlobal: (query: string) => Promise<HistoryEntry[]>;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectDate,
  onSearchGlobal,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HistoryEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle escape key globally when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await onSearchGlobal(query);
        setResults(res);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, onSearchGlobal]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
              }
            }}
            placeholder="Search all Chrome history titles, URLs, and domains..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-1 rounded-md"
            title="Close (Esc)"
          >
            Esc
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isSearching ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Searching across entire history...
            </div>
          ) : results.length > 0 ? (
            results.map((entry) => {
              const domainColors = getDomainColor(entry.domain);
              return (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
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
                        className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-brand-600 hover:underline line-clamp-1"
                      >
                        {entry.title}
                      </a>

                      <div className="text-[11px] text-slate-400 truncate font-mono mt-0.5">
                        {entry.url}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-md border font-medium ${domainColors.bg} ${domainColors.text} ${domainColors.border}`}
                        >
                          {entry.domain}
                        </span>

                        {entry.date && (
                          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            <Calendar size={11} className="text-slate-400" />
                            {formatDateReadable(entry.date)} ({entry.time_formatted})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {entry.date && (
                      <button
                        onClick={() => {
                          onSelectDate(entry.date!);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-medium hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
                        title="Jump to this date on calendar"
                      >
                        <span>Open Day</span>
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : query.trim() ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching pages found for "{query}".
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              Type to search all titles, URLs, and domains across your history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
