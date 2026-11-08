import React, { useState, useRef, useEffect } from 'react';
import { parseHistoryFile, ParseResult } from '../../utils/clientParser';
import { UploadCloud, AlertCircle, X } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileParsed: (result: ParseResult, fileName: string) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onFileParsed,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('Indexing Takeout history...');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setError('Please select a valid Chrome history JSON file (History.json).');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProgress(10);
    setProgressMessage('Reading Takeout file in background...');

    try {
      const result = await parseHistoryFile(file, (p, msg) => {
        setProgress(p);
        if (msg) setProgressMessage(msg);
      });
      onFileParsed(result, file.name);
      onClose();
    } catch (err: any) {
      console.error('File parsing error:', err);
      setError(err?.message || 'Failed to parse JSON file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md backdrop-blur-2xl bg-white/95 dark:bg-[#1E1E1E]/95 border border-black/10 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
            Import History
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.1]"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mb-4">
          Drop your Google Takeout <code className="bg-black/[0.05] dark:bg-white/[0.1] px-1 py-0.5 rounded text-[11px] font-mono">History.json</code> file to inspect it in the calendar.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#007AFF] bg-[#007AFF]/5'
              : 'border-black/15 dark:border-white/15 hover:border-[#007AFF] dark:hover:border-[#0A84FF] bg-black/[0.02] dark:bg-white/[0.03]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-10 h-10 bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF] rounded-full flex items-center justify-center mx-auto mb-2.5">
            <UploadCloud size={20} strokeWidth={2} />
          </div>

          <div className="text-[13px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-0.5">
            Choose a file or drag it here
          </div>
          <div className="text-[11px] text-[#86868B] font-mono">
            History.json
          </div>
        </div>

        {/* Progress bar */}
        {isProcessing && (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[11px] text-[#86868B]">
              <span className="truncate pr-2">{progressMessage}</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="w-full bg-black/[0.05] dark:bg-white/[0.1] rounded-full h-1.5 overflow-hidden">
              <div
                style={{ width: `${progress}%` }}
                className="bg-[#007AFF] h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl flex items-start gap-2 text-xs text-[#FF3B30]">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" strokeWidth={2} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
