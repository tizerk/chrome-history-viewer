export interface HistoryEntry {
  id: number;
  time_usec: number;
  time_ms: number;
  iso_time: string;
  time_formatted: string;
  title: string;
  url: string;
  domain: string;
  favicon_url: string;
  transition: string;
  date?: string;
}

export interface DayStats {
  uniqueDomains: number;
  topDomains: { domain: string; count: number }[];
  hourly: number[];
  sessionCount: number;
  firstTime: string | null;
  lastTime: string | null;
  estimatedActiveMinutes: number;
}

export interface DayDetails {
  date: string;
  exists: boolean;
  count: number;
  entries: HistoryEntry[];
  prevDate: string | null;
  nextDate: string | null;
  stats: DayStats | null;
}

export interface DaySummary {
  count: number;
  uniqueDomains: number;
  topDomains: { domain: string; count: number }[];
  hourly: number[];
}

export interface CalendarOverview {
  minDate: string | null;
  maxDate: string | null;
  totalDays: number;
  days: Record<string, DaySummary>;
}

export interface OverallStats {
  totalEntries: number;
  totalDays: number;
  minDate: string | null;
  maxDate: string | null;
  peakDay: { date: string; count: number };
  topDomains: { domain: string; count: number }[];
  hourlyDistribution: number[];
  dayOfWeekDistribution: number[];
}

export interface AppStatus {
  available: boolean;
  isLoading: boolean;
  totalEntries: number;
  totalDays: number;
  minDate: string | null;
  maxDate: string | null;
  peakDay: { date: string; count: number } | null;
}

export type ViewMode = 'timeline' | 'domain' | 'session';
export type SortOrder = 'desc' | 'asc';

