import { CalendarOverview, DayDetails } from '../types';

export interface ParseResult {
  calendar: CalendarOverview;
  daysMap: Map<string, DayDetails>;
  totalEntries: number;
}

export async function parseHistoryFile(
  file: File,
  onProgress?: (percent: number, message: string) => void
): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker(
        new URL('../workers/parser.worker.ts', import.meta.url),
        { type: 'module' }
      );

      worker.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === 'progress') {
          if (onProgress) onProgress(msg.percent, msg.message);
        } else if (msg.type === 'done') {
          const daysMap = new Map<string, DayDetails>(msg.daysArray);
          worker.terminate();
          resolve({
            calendar: msg.calendar,
            daysMap,
            totalEntries: msg.totalEntries
          });
        } else if (msg.type === 'error') {
          worker.terminate();
          reject(new Error(msg.error || 'Parsing error in worker'));
        }
      };

      worker.onerror = (err) => {
        worker.terminate();
        reject(new Error(err.message || 'Worker thread error'));
      };

      worker.postMessage({ file });
    } catch (err) {
      reject(err);
    }
  });
}
