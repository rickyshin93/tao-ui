import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { createRef } from 'react';
import {
  Calendar,
  type CalendarRef,
} from '../../src/components/calendar/calendar';

test('date selection reports its source and controlled state follows the parent', () => {
  const values: string[] = [];
  const sources: string[] = [];
  const { container, rerender } = render(
    <Calendar
      value={dayjs('2026-11-04')}
      onChange={(value) => values.push(value.format('YYYY-MM-DD'))}
      onSelect={(_, info) => sources.push(info.source)}
    />,
  );
  fireEvent.click(container.querySelector('[title="2026-11-05"]')!);
  expect(values).toEqual(['2026-11-05']);
  expect(sources).toEqual(['date']);
  expect(container.querySelector('[title="2026-11-04"]')?.className).toContain(
    'selected',
  );
  rerender(<Calendar value={dayjs('2026-11-05')} />);
  expect(container.querySelector('[title="2026-11-05"]')?.className).toContain(
    'selected',
  );
});

test('mode and header navigation preserve callback sources and obey the valid range', () => {
  const sources: string[] = [];
  const panels: string[] = [];
  render(
    <Calendar
      defaultValue={dayjs('2026-11-04')}
      validRange={[dayjs('2026-03-01'), dayjs('2027-08-31')]}
      onSelect={(_, info) => sources.push(info.source)}
      onPanelChange={(date, mode) =>
        panels.push(`${date.format('YYYY-MM')}:${mode}`)
      }
    />,
  );
  fireEvent.change(screen.getByRole('combobox', { name: 'Month' }), {
    target: { value: '9' },
  });
  expect(sources).toEqual(['month']);
  expect(panels).toEqual(['2026-10:month']);
  fireEvent.click(screen.getByRole('radio', { name: 'Year' }));
  expect(panels).toEqual(['2026-10:month', '2026-10:year']);
  expect(screen.queryByRole('combobox', { name: 'Month' })).toBeNull();
});

test('disabled dates cannot select; custom cells and semantic parts render', () => {
  const values: string[] = [];
  const { container } = render(
    <Calendar
      defaultValue={dayjs('2026-11-04')}
      disabledDate={(date) => date.date() === 5}
      onSelect={(date) => values.push(date.format('YYYY-MM-DD'))}
      cellRender={(date) => (date.date() === 6 ? 'Deployment' : null)}
      classNames={{ itemContent: 'event-slot' }}
      styles={{ header: { padding: 7 } }}
    />,
  );
  fireEvent.click(container.querySelector('[title="2026-11-05"]')!);
  expect(values).toEqual([]);
  expect(screen.getAllByText('Deployment')[0].className).toBe('event-slot');
  expect(container.querySelector('[data-tao-calendar-header]')).toHaveStyle({
    padding: '7px',
  });
});

test('custom header sends customize events, ref exposes root, and full rendering replaces content', () => {
  const sources: string[] = [];
  const ref = createRef<CalendarRef>();
  render(
    <Calendar
      ref={ref}
      defaultValue={dayjs('2026-11-04')}
      fullscreen={false}
      headerRender={({ value, onChange }) => (
        <button type="button" onClick={() => onChange(value.add(1, 'day'))}>
          Advance
        </button>
      )}
      onSelect={(_, info) => sources.push(info.source)}
      fullCellRender={(date) => <span>Day {date.date()}</span>}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Advance' }));
  expect(sources).toEqual(['customize']);
  expect(ref.current?.nativeElement).toHaveAttribute(
    'data-fullscreen',
    'false',
  );
  expect(screen.getAllByText('Day 5').length).toBeGreaterThan(0);
});
