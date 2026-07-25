import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import dayjs from 'dayjs';
import { DatePicker } from '../../src/components/date-picker/date-picker';
import { TaoProvider } from '../../src/provider/tao-provider';

test('renders with placeholder', () => {
  render(<DatePicker />);
  expect(screen.getByRole('textbox')).toHaveAttribute(
    'placeholder',
    'YYYY-MM-DD',
  );
});

test('renders custom placeholder', () => {
  render(<DatePicker placeholder="Pick a date" />);
  expect(screen.getByRole('textbox')).toHaveAttribute(
    'placeholder',
    'Pick a date',
  );
});

test('displays formatted value', () => {
  render(<DatePicker value={dayjs('2026-06-15')} />);
  expect(screen.getByRole('textbox')).toHaveValue('2026-06-15');
});

test('PC trigger accepts a typed date and commits it with Enter', async () => {
  let result: string | null = null;
  render(
    <DatePicker
      mobile={false}
      onChange={(_, dateString) => {
        result = dateString;
      }}
    />,
  );

  await userEvent.type(screen.getByRole('textbox'), '2026-07-25{Enter}');

  expect(result).toBe('2026-07-25');
});

test('PC trigger rejects a typed date that does not match the format', async () => {
  let changeCount = 0;
  render(
    <DatePicker
      mobile={false}
      onChange={() => {
        changeCount += 1;
      }}
    />,
  );

  const input = screen.getByRole('textbox');
  await userEvent.type(input, '2026-02-31{Enter}');

  expect(changeCount).toBe(0);
  expect(input).toHaveValue('');
});

test('mobile trigger remains a button', () => {
  render(<DatePicker mobile />);
  expect(screen.getByRole('button')).toBeTruthy();
  expect(screen.queryByRole('textbox')).toBeNull();
});

test('picker=month shows month format', () => {
  render(<DatePicker picker="month" value={dayjs('2026-06-01')} />);
  expect(screen.getByRole('textbox')).toHaveValue('2026-06');
});

test('picker=year shows year format', () => {
  render(<DatePicker picker="year" value={dayjs('2026-01-01')} />);
  expect(screen.getByRole('textbox')).toHaveValue('2026');
});

test('click trigger opens popover with calendar', async () => {
  render(<DatePicker />);
  await userEvent.click(screen.getByRole('textbox'));
  expect(screen.getByRole('grid')).toBeTruthy(); // calendar table
});

test('selecting a date triggers onChange', async () => {
  let result: string | null = null;
  const { container } = render(
    <DatePicker
      value={dayjs('2026-06-15')}
      onChange={(_, str) => {
        result = str;
      }}
    />,
  );
  await userEvent.click(container.querySelector('[data-tao-picker-trigger]')!);
  const cell20 = screen.getByText('20');
  await userEvent.click(cell20);
  expect(result).toBe('2026-06-20');
});

test('allowClear shows clear button on hover', async () => {
  const { container } = render(
    <DatePicker value={dayjs('2026-06-15')} allowClear />,
  );
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
      onChange={(d) => {
        if (d === null) cleared = true;
      }}
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
  expect(
    screen.getByRole('textbox').closest('[data-tao-picker-trigger]'),
  ).toHaveAttribute('data-tao-size', 'small');
});

test('disabled prevents opening', async () => {
  render(<DatePicker disabled />);
  expect(screen.getByRole('textbox')).toBeDisabled();
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
  await userEvent.click(screen.getByRole('textbox'));
  expect(screen.getByText('Today')).toBeTruthy();
  expect(screen.getByText('Yesterday')).toBeTruthy();
});
