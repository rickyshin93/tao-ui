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
