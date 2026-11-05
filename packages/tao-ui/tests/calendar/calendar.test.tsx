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

test('mode and header navigation preserve callback sources and obey the valid range', async () => {
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
  const month = screen.getByRole('combobox', { name: 'Month' });
  expect(month).toHaveAttribute('data-tao-select');
  fireEvent.keyDown(month, { key: 'ArrowDown' });
  fireEvent.click(await screen.findByRole('option', { name: 'Oct' }));
  expect(sources).toEqual(['month']);
  expect(panels).toEqual(['2026-10:month']);
  fireEvent.keyDown(screen.getByRole('combobox', { name: 'Year' }), {
    key: 'ArrowDown',
  });
  expect(await screen.findAllByRole('option')).toHaveLength(2);
  fireEvent.click(screen.getByRole('option', { name: '2027' }));
  expect(sources).toEqual(['month', 'year']);
  expect(panels).toEqual(['2026-10:month', '2027-08:month']);
  fireEvent.keyDown(screen.getByRole('combobox', { name: 'Month' }), {
    key: 'ArrowDown',
  });
  expect(await screen.findAllByRole('option')).toHaveLength(8);
  expect(screen.queryByRole('option', { name: 'Sep' })).toBeNull();
  fireEvent.click(screen.getByRole('option', { name: 'Jul' }));
  fireEvent.click(screen.getByRole('radio', { name: 'Year' }));
  expect(panels).toEqual([
    '2026-10:month',
    '2027-08:month',
    '2027-07:month',
    '2027-07:year',
  ]);
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
  expect(container.querySelector('[data-tao-calendar-toolbar]')).toHaveStyle({
    padding: '7px',
  });
});

test('Segmented mode switching supports keyboard input and controlled mode', () => {
  const panels: string[] = [];
  const { rerender } = render(
    <Calendar
      value={dayjs('2026-11-04')}
      mode="month"
      onPanelChange={(_, mode) => panels.push(mode)}
    />,
  );
  expect(
    screen.getByRole('radiogroup', { name: 'Calendar view' }),
  ).toHaveAttribute('data-tao-segmented');
  fireEvent.keyDown(screen.getByRole('radio', { name: 'Month' }), {
    key: 'ArrowRight',
  });
  expect(panels).toEqual(['year']);
  expect(screen.getByRole('radio', { name: 'Month' })).toBeChecked();
  expect(screen.getByRole('combobox', { name: 'Month' })).toBeTruthy();
  rerender(<Calendar value={dayjs('2026-11-04')} mode="year" />);
  expect(screen.getByRole('radio', { name: 'Year' })).toBeChecked();
  expect(screen.queryByRole('combobox', { name: 'Month' })).toBeNull();
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
