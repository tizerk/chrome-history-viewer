import fs from 'fs';
import path from 'path';

class HistoryService {
  constructor() {
    this.isLoaded = false;
    this.isLoading = false;
    this.filePath = path.resolve(process.cwd(), 'History.json');
    this.daysMap = new Map(); // YYYY-MM-DD -> { date, count, uniqueDomains, topDomains, hourly, entries }
    this.allTimeStats = null;
    this.sessions = [];
    this.dateList = [];
    this.totalEntries = 0;
  }

  extractDomain(urlStr) {
    try {
      const u = new URL(urlStr);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return 'other';
    }
  }

  formatLocalYMD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  async initialize() {
    if (this.isLoaded || this.isLoading) return;
    this.isLoading = true;

    if (!fs.existsSync(this.filePath)) {
      console.warn(`[HistoryService] File not found at ${this.filePath}`);
      this.isLoading = false;
      return;
    }

    try {
      console.log(`[HistoryService] Reading ${this.filePath}...`);
      const fileContent = fs.readFileSync(this.filePath, 'utf8');
      console.log(`[HistoryService] Parsing JSON...`);
      const data = JSON.parse(fileContent);

      const rawEntries = data['Browser History'] || [];
      this.sessions = data['Session'] || [];
      this.totalEntries = rawEntries.length;

      console.log(`[HistoryService] Indexing ${this.totalEntries} entries...`);
      const allTimeDomains = new Map();
      const allTimeHourly = new Array(24).fill(0);
      const dayOfWeekCounts = new Array(7).fill(0); // 0=Sun..6=Sat

      this.daysMap.clear();

      for (let i = 0; i < rawEntries.length; i++) {
        const item = rawEntries[i];
        const ms = Math.floor(item.time_usec / 1000);
        const dateObj = new Date(ms);
        const dateKey = this.formatLocalYMD(dateObj);

        let dayRecord = this.daysMap.get(dateKey);
        if (!dayRecord) {
          dayRecord = {
            date: dateKey,
            count: 0,
            hourly: new Array(24).fill(0),
            domainCounts: new Map(),
            entries: []
          };
          this.daysMap.set(dateKey, dayRecord);
        }

        const hour = dateObj.getHours();
        const dayOfWeek = dateObj.getDay();
        const domain = this.extractDomain(item.url);

        dayRecord.count++;
        dayRecord.hourly[hour]++;
        dayRecord.domainCounts.set(domain, (dayRecord.domainCounts.get(domain) || 0) + 1);

        allTimeHourly[hour]++;
        dayOfWeekCounts[dayOfWeek]++;
        allTimeDomains.set(domain, (allTimeDomains.get(domain) || 0) + 1);

        dayRecord.entries.push({
          id: i,
          time_usec: item.time_usec,
          time_ms: ms,
          iso_time: dateObj.toISOString(),
          time_formatted: dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }),
          title: item.title?.trim() || domain,
          url: item.url,
          domain,
          favicon_url: item.favicon_url || '',
          transition: item.page_transition_qualifier || 'CLICK'
        });
      }

      this.dateList = Array.from(this.daysMap.keys()).sort();

      // Top all-time domains
      const sortedAllTimeDomains = Array.from(allTimeDomains.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(([domain, count]) => ({ domain, count }));

      // Find top active day
      let peakDay = { date: '', count: 0 };
      for (const [d, rec] of this.daysMap.entries()) {
        if (rec.count > peakDay.count) {
          peakDay = { date: d, count: rec.count };
        }
      }

      this.allTimeStats = {
        totalEntries: this.totalEntries,
        totalDays: this.daysMap.size,
        minDate: this.dateList[0] || null,
        maxDate: this.dateList[this.dateList.length - 1] || null,
        peakDay,
        topDomains: sortedAllTimeDomains,
        hourlyDistribution: allTimeHourly,
        dayOfWeekDistribution: dayOfWeekCounts
      };

      this.isLoaded = true;
      this.isLoading = false;
      console.log(`[HistoryService] Successfully indexed ${this.daysMap.size} days. Date range: ${this.dateList[0]} to ${this.dateList[this.dateList.length - 1]}`);
    } catch (err) {
      console.error('[HistoryService] Error initializing:', err);
      this.isLoading = false;
    }
  }

  getStatus() {
    return {
      available: this.isLoaded,
      isLoading: this.isLoading,
      totalEntries: this.totalEntries,
      totalDays: this.daysMap.size,
      minDate: this.dateList[0] || null,
      maxDate: this.dateList[this.dateList.length - 1] || null,
      peakDay: this.allTimeStats?.peakDay || null,
    };
  }

  getCalendarOverview() {
    const calendar = {};
    for (const [date, rec] of this.daysMap.entries()) {
      const topDomains = Array.from(rec.domainCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([domain, count]) => ({ domain, count }));

      calendar[date] = {
        count: rec.count,
        uniqueDomains: rec.domainCounts.size,
        topDomains,
        hourly: rec.hourly
      };
    }
    return {
      minDate: this.dateList[0] || null,
      maxDate: this.dateList[this.dateList.length - 1] || null,
      totalDays: this.daysMap.size,
      days: calendar
    };
  }

  getDay(dateStr) {
    const rec = this.daysMap.get(dateStr);
    if (!rec) {
      return {
        date: dateStr,
        exists: false,
        count: 0,
        entries: [],
        stats: null
      };
    }

    const topDomains = Array.from(rec.domainCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([domain, count]) => ({ domain, count }));

    // Find date index to provide previous and next active dates
    const currentIndex = this.dateList.indexOf(dateStr);
    const prevDate = currentIndex > 0 ? this.dateList[currentIndex - 1] : null;
    const nextDate = currentIndex < this.dateList.length - 1 ? this.dateList[currentIndex + 1] : null;

    // Detect browsing sessions (gap > 25 mins)
    const sortedEntries = [...rec.entries].sort((a, b) => a.time_ms - b.time_ms);
    let sessionCount = 1;
    let totalActiveMs = 0;
    if (sortedEntries.length > 0) {
      let lastMs = sortedEntries[0].time_ms;
      for (let i = 1; i < sortedEntries.length; i++) {
        const diff = sortedEntries[i].time_ms - lastMs;
        if (diff > 25 * 60 * 1000) {
          sessionCount++;
        } else {
          totalActiveMs += Math.min(diff, 10 * 60 * 1000);
        }
        lastMs = sortedEntries[i].time_ms;
      }
    }

    return {
      date: dateStr,
      exists: true,
      count: rec.count,
      entries: rec.entries,
      prevDate,
      nextDate,
      stats: {
        uniqueDomains: rec.domainCounts.size,
        topDomains,
        hourly: rec.hourly,
        sessionCount,
        firstTime: sortedEntries[0]?.time_formatted || null,
        lastTime: sortedEntries[sortedEntries.length - 1]?.time_formatted || null,
        estimatedActiveMinutes: Math.max(1, Math.round(totalActiveMs / (60 * 1000)))
      }
    };
  }

  search(query, limit = 50) {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    const results = [];

    // Search newest first
    for (let i = this.dateList.length - 1; i >= 0; i--) {
      const dateKey = this.dateList[i];
      const rec = this.daysMap.get(dateKey);
      if (!rec) continue;

      for (const entry of rec.entries) {
        if (
          entry.title.toLowerCase().includes(q) ||
          entry.url.toLowerCase().includes(q) ||
          entry.domain.toLowerCase().includes(q)
        ) {
          results.push({ ...entry, date: dateKey });
          if (results.length >= limit) return results;
        }
      }
    }
    return results;
  }

  getOverallStats() {
    return this.allTimeStats;
  }

  getSessions() {
    return this.sessions;
  }
}

export const historyService = new HistoryService();

