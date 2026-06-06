import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import dayjs from 'dayjs';
import { RangePicker } from '../../src/components/date-picker/range-picker';

test('renders with placeholder', () => {
  render(<RangePicker />);
  expect(screen.getByText('Start date')).toBeTruthy();
  expect(screen.getByText('End date')).toBeTruthy();
});

test('displays formatted range values', () => {
  render(
    <RangePicker value={[dayjs('2026-06-01'), dayjs('2026-06-15')]} />,
  );
  expect(screen.getByText('2026-06-01')).toBeTruthy();
  expect(screen.getByText('2026-06-15')).toBeTruthy();
});

test('shows separator', () => {
  render(<RangePicker separator="→" />);
  expect(screen.getByText('→')).toBeTruthy();
});

test('click opens dual calendar panels', async () => {
  render(<RangePicker />);
  await userEvent.click(screen.getByRole('button'));
  // Should have 2 calendar grids
  const grids = screen.getAllByRole('grid');
  expect(grids.length).toBe(2);
});

test('clear button resets range', async () => {
  let cleared = false;
  const { container } = render(
    <RangePicker
      value={[dayjs('2026-06-01'), dayjs('2026-06-15')]}
      allowClear
      onChange={(d) => { if (d === null) cleared = true; }}
    />,
  );
  const trigger = container.querySelector('[data-tao-range-trigger]')!;
  await userEvent.hover(trigger);
  await userEvent.click(screen.getByLabelText('Clear'));
  expect(cleared).toBe(true);
});

test('presets render in range picker', async () => {
  render(
    <RangePicker
      presets={[
        { label: 'This week', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
      ]}
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByText('This week')).toBeTruthy();
});
