import { CalendarOverview, DayDetails, DaySummary, HistoryEntry } from '../types';
import { formatDateYMD } from './dateUtils';

export interface ParseResult {
  calendar: CalendarOverview;
  daysMap: Map<string, DayDetails>;
  totalEntries: number;
}

export function extractDomain(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return 'other';
  }
}

export async function parseHistoryFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 50));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));

    reader.onload = () => {
      try {
        if (onProgress) onProgress(60);
        const rawText = reader.result as string;
        const data = JSON.parse(rawText);
        const list: any[] = data['Browser History'] || [];

        if (onProgress) onProgress(75);

        const daysMap = new Map<string, DayDetails>();
        const calendarDays: Record<string, DaySummary> = {};

        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          const ms = Math.floor(item.time_usec / 1000);
          const d = new Date(ms);
          const key = formatDateYMD(d);

          let dayDetails = daysMap.get(key);
          if (!dayDetails) {
            dayDetails = {
              date: key,
              exists: true,
              count: 0,
              entries: [],
              prevDate: null,
              nextDate: null,
              stats: {
                uniqueDomains: 0,
                topDomains: [],
                hourly: new Array(24).fill(0),
                sessionCount: 1,
                firstTime: null,
                lastTime: null,
                estimatedActiveMinutes: 0
              }
            };
            daysMap.set(key, dayDetails);
          }

          const hour = d.getHours();
          dayDetails.count++;
          dayDetails.stats!.hourly[hour]++;

          const domain = extractDomain(item.url);

          const entry: HistoryEntry = {
            id: i,
            time_usec: item.time_usec,
            time_ms: ms,
            iso_time: d.toISOString(),
            time_formatted: d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }),
            title: item.title?.trim() || domain,
            url: item.url,
            domain,
            favicon_url: item.favicon_url || '',
            transition: item.page_transition_qualifier || 'CLICK'
          };

          dayDetails.entries.push(entry);
        }

        const sortedDates = Array.from(daysMap.keys()).sort();

        // Calculate stats for each day
        for (let i = 0; i < sortedDates.length; i++) {
          const key = sortedDates[i];
          const dayDetails = daysMap.get(key)!;
          dayDetails.prevDate = i > 0 ? sortedDates[i - 1] : null;
          dayDetails.nextDate = i < sortedDates.length - 1 ? sortedDates[i + 1] : null;

          // Domain counts
          const domainMap = new Map<string, number>();
          for (const e of dayDetails.entries) {
            domainMap.set(e.domain, (domainMap.get(e.domain) || 0) + 1);
          }

          const topDomains = Array.from(domainMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([domain, count]) => ({ domain, count }));

          const sortedEntries = [...dayDetails.entries].sort((a, b) => a.time_ms - b.time_ms);
          let sessionCount = 1;
          let totalActiveMs = 0;
          if (sortedEntries.length > 0) {
            let lastMs = sortedEntries[0].time_ms;
            for (let j = 1; j < sortedEntries.length; j++) {
              const diff = sortedEntries[j].time_ms - lastMs;
              if (diff > 25 * 60 * 1000) {
                sessionCount++;
              } else {
                totalActiveMs += Math.min(diff, 10 * 60 * 1000);
              }
              lastMs = sortedEntries[j].time_ms;
            }
          }

          dayDetails.stats = {
            uniqueDomains: domainMap.size,
            topDomains: topDomains.slice(0, 15),
            hourly: dayDetails.stats!.hourly,
            sessionCount,
            firstTime: sortedEntries[0]?.time_formatted || null,
            lastTime: sortedEntries[sortedEntries.length - 1]?.time_formatted || null,
            estimatedActiveMinutes: Math.max(1, Math.round(totalActiveMs / (60 * 1000)))
          };

          calendarDays[key] = {
            count: dayDetails.count,
            uniqueDomains: domainMap.size,
            topDomains: topDomains.slice(0, 3),
            hourly: dayDetails.stats.hourly
          };
        }

        if (onProgress) onProgress(100);

        resolve({
          calendar: {
            minDate: sortedDates[0] || null,
            maxDate: sortedDates[sortedDates.length - 1] || null,
            totalDays: sortedDates.length,
            days: calendarDays
          },
          daysMap,
          totalEntries: list.length
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsText(file);
  });
}

