import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import dayjs from 'dayjs';
import { DatePicker } from '../../src/components/date-picker/date-picker';
import { TaoProvider } from '../../src/provider/tao-provider';

test('renders with placeholder', () => {
  render(<DatePicker />);
  expect(screen.getByText('YYYY-MM-DD')).toBeTruthy();
});

test('renders custom placeholder', () => {
  render(<DatePicker placeholder="Pick a date" />);
  expect(screen.getByText('Pick a date')).toBeTruthy();
});

test('displays formatted value', () => {
  render(<DatePicker value={dayjs('2026-06-15')} />);
  expect(screen.getByText('2026-06-15')).toBeTruthy();
});

test('picker=month shows month format', () => {
  render(<DatePicker picker="month" value={dayjs('2026-06-01')} />);
  expect(screen.getByText('2026-06')).toBeTruthy();
});

test('picker=year shows year format', () => {
  render(<DatePicker picker="year" value={dayjs('2026-01-01')} />);
  expect(screen.getByText('2026')).toBeTruthy();
});

test('click trigger opens popover with calendar', async () => {
  render(<DatePicker />);
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('grid')).toBeTruthy(); // calendar table
});

test('selecting a date triggers onChange', async () => {
  let result: string | null = null;
  const { container } = render(
    <DatePicker
      value={dayjs('2026-06-15')}
      onChange={(_, str) => { result = str; }}
    />,
  );
  await userEvent.click(container.querySelector('[data-tao-picker-trigger]')!);
  const cell20 = screen.getByText('20');
  await userEvent.click(cell20);
  expect(result).toBe('2026-06-20');
});

test('allowClear shows clear button on hover', async () => {
  const { container } = render(<DatePicker value={dayjs('2026-06-15')} allowClear />);
  const trigger = container.querySelector('[data-tao-picker-trigger]')!;
  await userEvent.hover(trigger);
  expect(screen.getByLabelText('Clear')).toBeTruthy();
});

test('clear button resets value', async () => {
  let cleared = false;
  const { container } = render(
    <DatePicker
      value={dayjs('2026-06-15')}
      allowClear
      onChange={(d) => { if (d === null) cleared = true; }}
    />,
  );
  const trigger = container.querySelector('[data-tao-picker-trigger]')!;
  await userEvent.hover(trigger);
  await userEvent.click(screen.getByLabelText('Clear'));
  expect(cleared).toBe(true);
});

test('inherits size from TaoProvider', () => {
  render(
    <TaoProvider size="small">
      <DatePicker />
    </TaoProvider>,
  );
  expect(screen.getByRole('button').dataset.taoSize).toBe('small');
});

test('disabled prevents opening', async () => {
  render(<DatePicker disabled />);
  expect(screen.getByRole('button')).toBeDisabled();
});

test('presets render as buttons', async () => {
  render(
    <DatePicker
      presets={[
        { label: 'Today', value: dayjs() },
        { label: 'Yesterday', value: dayjs().subtract(1, 'day') },
      ]}
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Today')).toBeTruthy();
  expect(screen.getByText('Yesterday')).toBeTruthy();
});
