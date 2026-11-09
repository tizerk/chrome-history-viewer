import React, { useState, useEffect, useRef } from 'react';
import { HistoryEntry } from '../../types';
import { formatDateReadable } from '../../utils/dateUtils';
import { getFaviconUrl } from '../../utils/domainColors';
import { Search, X, ArrowRight, Globe } from 'lucide-react';

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
    }, 200);

    return () => clearTimeout(timer);
  }, [query, onSearchGlobal]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl backdrop-blur-2xl bg-white/95 dark:bg-[#1E1E1E]/95 border border-black/10 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spotlight Search Header */}
        <div className="p-3.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center gap-3">
          <Search size={18} className="text-[#86868B] flex-shrink-0" strokeWidth={2} />
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
            placeholder="Search History..."
            className="w-full bg-transparent text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
              title="Clear"
            >
              <X size={15} strokeWidth={2} />
            </button>
          )}
          <kbd className="text-[10px] bg-black/[0.05] dark:bg-white/[0.1] text-[#86868B] dark:text-[#A1A1A6] px-1.5 py-0.5 rounded font-mono">
            esc
          </kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isSearching ? (
            <div className="py-12 text-center text-[#86868B] text-xs">
              <div className="w-5 h-5 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((entry) => {
              const faviconUrl = getFaviconUrl(entry.domain, entry.favicon_url);
              return (
                <div
                  key={entry.id}
                  className="px-3 py-2 rounded-xl hover:bg-black/[0.035] dark:hover:bg-white/[0.05] group flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {faviconUrl ? (
                      <img
                        src={faviconUrl}
                        alt=""
                        className="w-4 h-4 rounded-[3px] object-contain flex-shrink-0 mt-0.5"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Globe size={14} className="text-[#86868B] flex-shrink-0 mt-0.5" />
                    )}

                    <div className="min-w-0 flex-1">
                      {/* Clickable page link opening in new tab */}
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[13px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#007AFF] dark:hover:text-[#0A84FF] hover:underline truncate block"
                        title={entry.title}
                      >
                        {entry.title}
                      </a>

                      <div className="flex items-center gap-2 text-[11px] text-[#86868B] dark:text-[#A1A1A6] truncate mt-0.5">
                        <span className="font-medium text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70">{entry.domain}</span>
                        {entry.date && <span>• {formatDateReadable(entry.date)}</span>}
                        <span>• {entry.time_formatted}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Open Day history button */}
                    {entry.date && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectDate(entry.date!);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-black/[0.04] hover:bg-[#007AFF] hover:text-white dark:bg-white/[0.08] dark:hover:bg-[#007AFF] dark:hover:text-white text-[#1D1D1F] dark:text-[#F5F5F7] font-medium transition-colors"
                        title={`View full history for ${entry.date}`}
                      >
                        <span>Open Day</span>
                        <ArrowRight size={11} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : query.trim() ? (
            <div className="py-10 text-center text-[#86868B] text-xs">
              No results for "{query}"
            </div>
          ) : (
            <div className="py-10 text-center text-[#86868B] text-xs">
              Type to search titles, URLs, and domains
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
