// Web Worker for background parsing of Google Takeout History.json
// Runs entirely off the main UI thread so the browser never freezes.

function extractDomain(urlStr: string): string {
  try {
    const m = urlStr.match(/^https?:\/\/([^/?#]+)/i);
    if (!m) return 'other';
    const host = m[1].toLowerCase();
    return host.startsWith('www.') ? host.slice(4) : host;
  } catch {
    return 'other';
  }
}

function formatLocalYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

self.onmessage = async (e: MessageEvent<{ file: File }>) => {
  try {
    const file = e.data.file;

    // Phase 1: Read file content in background
    self.postMessage({ type: 'progress', percent: 15, message: 'Reading Takeout file in background...' });
    const rawText = await file.text();

    // Phase 2: Parse JSON in background
    self.postMessage({ type: 'progress', percent: 45, message: 'Parsing JSON data...' });
    const parsedData = JSON.parse(rawText);
    const rawEntries: any[] = parsedData['Browser History'] || [];
    const totalEntries = rawEntries.length;

    self.postMessage({ type: 'progress', percent: 65, message: `Indexing ${totalEntries.toLocaleString()} visits...` });

    const daysMap = new Map<string, any>();
    const calendarDays: Record<string, any> = {};

    const progressStep = Math.max(1, Math.floor(totalEntries / 10));

    // Phase 3: Fast indexing
    for (let i = 0; i < totalEntries; i++) {
      const item = rawEntries[i];
      const ms = Math.floor(item.time_usec / 1000);
      const d = new Date(ms);
      const key = formatLocalYMD(d);

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
      dayDetails.stats.hourly[hour]++;

      const domain = extractDomain(item.url || '');

      dayDetails.entries.push({
        id: i,
        time_usec: item.time_usec,
        time_ms: ms,
        iso_time: d.toISOString(),
        time_formatted: d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }),
        title: item.title?.trim() || domain,
        url: item.url || '',
        domain,
        favicon_url: item.favicon_url || '',
        transition: item.page_transition_qualifier || 'CLICK'
      });

      if (i % progressStep === 0) {
        const percent = 65 + Math.round((i / totalEntries) * 25);
        self.postMessage({ type: 'progress', percent, message: `Processing history items (${Math.round((i / totalEntries) * 100)}%)...` });
      }
    }

    self.postMessage({ type: 'progress', percent: 92, message: 'Calculating daily analytics & sessions...' });

    const sortedDates = Array.from(daysMap.keys()).sort();

    // Calculate stats for each day
    for (let i = 0; i < sortedDates.length; i++) {
      const key = sortedDates[i];
      const dayDetails = daysMap.get(key)!;
      dayDetails.prevDate = i > 0 ? sortedDates[i - 1] : null;
      dayDetails.nextDate = i < sortedDates.length - 1 ? sortedDates[i + 1] : null;

      // Domain aggregation
      const domainMap = new Map<string, number>();
      for (const e of dayDetails.entries) {
        domainMap.set(e.domain, (domainMap.get(e.domain) || 0) + 1);
      }

      const topDomains = Array.from(domainMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([domain, count]) => ({ domain, count }));

      // Session detection (breaks > 25 mins)
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
        hourly: dayDetails.stats.hourly,
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

    self.postMessage({ type: 'progress', percent: 100, message: 'Done!' });

    // Transfer back results
    const daysArray = Array.from(daysMap.entries());
    self.postMessage({
      type: 'done',
      calendar: {
        minDate: sortedDates[0] || null,
        maxDate: sortedDates[sortedDates.length - 1] || null,
        totalDays: sortedDates.length,
        days: calendarDays
      },
      daysArray,
      totalEntries
    });
  } catch (err: any) {
    self.postMessage({ type: 'error', error: err.message || 'Worker processing failed' });
  }
};

