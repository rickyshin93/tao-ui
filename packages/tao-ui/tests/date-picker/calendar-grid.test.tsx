import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { CalendarGrid } from '../../src/components/date-picker/calendar/calendar-grid';

test('arrow keys move calendar focus by day', () => {
  render(
    <CalendarGrid
      viewDate={dayjs('2026-06-15')}
      value={dayjs('2026-06-15')}
      onSelect={() => {}}
    />,
  );

  const day15 = screen.getByRole('button', { name: '2026-06-15' });
  const day16 = screen.getByRole('button', { name: '2026-06-16' });
  day15.focus();
  fireEvent.keyDown(day15, { key: 'ArrowRight' });

  expect(document.activeElement).toBe(day16);
  expect(day15.tabIndex).toBe(-1);
  expect(day16.tabIndex).toBe(0);
});

test('arrow navigation stops searching when no later date is available', () => {
  const onlyDate = dayjs('2026-06-15');
  let navigationChecks = 0;
  let navigating = false;
  render(
    <CalendarGrid
      viewDate={onlyDate}
      value={onlyDate}
      onSelect={() => {}}
      disabledDate={(date) => {
        // Let the baseline finish after scanning well beyond the visible dates.
        if (navigating && ++navigationChecks > 84) return false;
        return !date.isSame(onlyDate, 'day');
      }}
    />,
  );
  const current = screen.getByRole('button', { name: '2026-06-15' });
  current.focus();
  navigating = true;
  fireEvent.keyDown(current, { key: 'ArrowRight' });
  expect(navigationChecks).toBeLessThanOrEqual(84);
  expect(document.activeElement).toBe(current);
});

test('the calendar keeps an enabled tab stop after its focused date is disabled', () => {
  const selected = dayjs('2026-06-15');
  const { rerender } = render(
    <CalendarGrid viewDate={selected} value={selected} onSelect={() => {}} />,
  );
  expect(screen.getByRole('button', { name: '2026-06-15' }).tabIndex).toBe(0);
  rerender(
    <CalendarGrid
      viewDate={selected}
      value={selected}
      onSelect={() => {}}
      disabledDate={(date) => !date.isSame(selected.add(1, 'day'), 'day')}
    />,
  );
  expect(screen.getByRole('button', { name: '2026-06-16' }).tabIndex).toBe(0);
});
