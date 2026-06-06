import { expect, test } from '@rstest/core';
import dayjs from 'dayjs';
import { getCalendarWeeks, getMonths, getYears } from '../../src/components/date-picker/calendar/use-calendar';

// ---- getCalendarWeeks ----

test('returns 6 weeks of 7 days each', () => {
  const weeks = getCalendarWeeks(dayjs('2026-06-01'));
  expect(weeks).toHaveLength(6);
  for (const week of weeks) {
    expect(week).toHaveLength(7);
  }
});

test('first cell is Monday of the week containing the 1st', () => {
  // June 2026: 1st is Monday
  const weeks = getCalendarWeeks(dayjs('2026-06-15'));
  expect(weeks[0][0].format('YYYY-MM-DD')).toBe('2026-06-01');
});

test('includes previous month fill days', () => {
  // May 2026: 1st is Friday → week starts from Monday Apr 27
  const weeks = getCalendarWeeks(dayjs('2026-05-10'));
  expect(weeks[0][0].format('YYYY-MM-DD')).toBe('2026-04-27');
});

test('all 42 cells are unique consecutive days', () => {
  const weeks = getCalendarWeeks(dayjs('2026-06-01'));
  const flat = weeks.flat();
  for (let i = 1; i < flat.length; i++) {
    expect(flat[i].diff(flat[i - 1], 'day')).toBe(1);
  }
});

// ---- getMonths ----

test('returns 12 months', () => {
  const months = getMonths(2026);
  expect(months).toHaveLength(12);
  expect(months[0].format('YYYY-MM')).toBe('2026-01');
  expect(months[11].format('YYYY-MM')).toBe('2026-12');
});

// ---- getYears ----

test('returns 12 years for the decade', () => {
  const years = getYears(2026);
  expect(years).toHaveLength(12);
  expect(years[0].year()).toBe(2020);
  expect(years[11].year()).toBe(2031);
});
