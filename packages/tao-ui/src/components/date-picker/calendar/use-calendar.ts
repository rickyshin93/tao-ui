import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

/**
 * Generate 6×7 matrix of days for a calendar month view.
 * Includes fill days from prev/next month; legacy callers start on Monday.
 */
export function getCalendarWeeks(viewDate: Dayjs, weekStartsOn = 1): Dayjs[][] {
  const startOfMonth = viewDate.startOf('month');
  const offset = (startOfMonth.day() - weekStartsOn + 7) % 7;
  const start = startOfMonth.subtract(offset, 'day');

  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => start.add(week * 7 + day, 'day')),
  );
}

/**
 * Generate 12 months for a given year.
 */
export function getMonths(year: number): Dayjs[] {
  return Array.from({ length: 12 }, (_, i) =>
    dayjs().year(year).month(i).startOf('month'),
  );
}

/**
 * Generate 12 years for the decade containing the given year.
 * Decade: e.g. 2026 → 2020-2031 (decade start - 1 to decade end + 1).
 */
export function getYears(year: number): Dayjs[] {
  const decadeStart = Math.floor(year / 10) * 10;
  return Array.from({ length: 12 }, (_, i) =>
    dayjs()
      .year(decadeStart + i)
      .startOf('year'),
  );
}
