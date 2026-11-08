import React, { useState, useRef } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setError('Please select a valid Chrome history JSON file (e.g. History.json from Google Takeout).');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProgress(10);

    try {
      const result = await parseHistoryFile(file, (p) => setProgress(p));
      onFileParsed(result, file.name);
      onClose();
    } catch (err: any) {
      console.error('File parsing error:', err);
      setError(err?.message || 'Failed to parse JSON file. Ensure it is a valid Takeout export.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
            Load Takeout History File
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Select or drop your Google Takeout <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">History.json</code> file to explore it in the calendar.
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
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
              : 'border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 bg-slate-50/50 dark:bg-slate-800/30'
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

          <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <UploadCloud size={24} />
          </div>

          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Click to upload or drag & drop
          </div>
          <div className="text-xs text-slate-400 font-mono">
            History.json (Google Takeout format)
          </div>
        </div>

        {/* Progress bar */}
        {isProcessing && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Parsing and indexing JSON...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                style={{ width: `${progress}%` }}
                className="bg-brand-600 h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>
        )}

        {/* Error notice */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

