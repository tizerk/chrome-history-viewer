export function formatDateYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateYMD(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateReadable(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseDateYMD(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatMonthYear(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export interface CalendarDay {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function getCalendarMonthDays(year: number, month: number): CalendarDay[] {
  // month is 0-indexed (0 = Jan, 11 = Dec)
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 6 = Sat
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];

  const todayStr = formatDateYMD(new Date());

  // Previous month padding days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const dateStr = formatDateYMD(prevDate);
    days.push({
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr
    });
  }

  // Current month days
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const curDate = new Date(year, month, i);
    const dateStr = formatDateYMD(curDate);
    days.push({
      dateStr,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dateStr === todayStr
    });
  }

  // Next month padding days to complete 35 or 42 grid cells
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(year, month + 1, i);
    const dateStr = formatDateYMD(nextDate);
    days.push({
      dateStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateStr === todayStr
    });
  }

  return days;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

