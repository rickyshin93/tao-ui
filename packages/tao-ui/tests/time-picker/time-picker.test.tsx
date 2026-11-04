import { expect, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import dayjs from 'dayjs';
import { createRef } from 'react';
import {
  TimePicker,
  type TimePickerRef,
} from '../../src/components/time-picker/time-picker';
import { TaoProvider, zhCN } from '../../src/provider/tao-provider';

test('formats a controlled time and updates when the parent changes it', () => {
  const { rerender } = render(
    <TimePicker value={dayjs('2026-11-04T13:30:45')} format="HH:mm" />,
  );
  expect(screen.getByRole('textbox')).toHaveValue('13:30');
  rerender(<TimePicker value={dayjs('2026-11-04T09:15:00')} format="HH:mm" />);
  expect(screen.getByRole('textbox')).toHaveValue('09:15');
});

test('clear emits the public null value and onClear', () => {
  const changes: (string | null)[] = [];
  let clears = 0;
  render(
    <TimePicker
      value={dayjs('2026-11-04T13:30:45')}
      allowClear={{ label: 'Reset time', tabIndex: -1 }}
      onClear={() => {
        clears += 1;
      }}
      onChange={(date) => changes.push(date?.format('HH:mm') ?? null)}
    />,
  );
  const clear = screen.getByRole('button', { name: 'Reset time' });
  expect(clear.tabIndex).toBe(-1);
  fireEvent.click(clear);
  expect(changes).toEqual([null]);
  expect(clears).toBe(1);
});

test('inherited disabled state prevents editing and clearing', () => {
  render(
    <TaoProvider disabled>
      <TimePicker defaultValue={dayjs('2026-11-04T13:30:45')} />
    </TaoProvider>,
  );
  expect(screen.getByRole('textbox')).toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
});

test('clear disabled configuration hides the action without disabling the input', () => {
  render(
    <TimePicker
      defaultValue={dayjs('2026-11-04T13:30:45')}
      allowClear={{ disabled: true }}
    />,
  );
  expect(screen.getByRole('textbox')).not.toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
});

test('selecting time respects step intervals, disabled hours and confirmation', async () => {
  const changes: string[] = [];
  render(
    <TimePicker
      defaultValue={dayjs('2026-11-04T13:30:00')}
      format="HH:mm"
      minuteStep={15}
      disabledTime={() => ({ disabledHours: () => [14] })}
      onChange={(date) => changes.push(date?.format('HH:mm') ?? '')}
    />,
  );
  fireEvent.click(screen.getByRole('textbox'));
  const hours = await screen.findByRole('listbox', { name: 'Select an hour' });
  const minutes = screen.getByRole('listbox', { name: 'Select a minute' });
  expect(within(minutes).getAllByRole('option')).toHaveLength(4);
  const hour14 = within(hours).getByRole('option', { name: '14 hours' });
  expect(hour14).toHaveAttribute('aria-disabled', 'true');
  fireEvent.click(hour14);
  expect(changes).toEqual([]);
  fireEvent.click(within(hours).getByRole('option', { name: '15 hours' }));
  expect(changes).toEqual([]);
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  await waitFor(() => expect(changes).toEqual(['15:30']));
});

test('semantic callbacks and custom panels retain provider theme and locale', async () => {
  const { container } = render(
    <TaoProvider
      locale={zhCN}
      theme={{ mode: 'dark', token: { colorPrimary: '#713fff' } }}
    >
      <TimePicker
        defaultOpen
        defaultValue={dayjs('2026-11-04T13:30:00')}
        size="small"
        classNames={({ props }) => ({
          root: `size-${props.size}`,
          popup: { content: 'time-content' },
        })}
        styles={{ input: { color: 'red' } }}
        addon={() => <span>Extra controls</span>}
      />
    </TaoProvider>,
  );
  expect(container.querySelector('[data-tao-time-picker]')).toHaveClass(
    'size-small',
  );
  expect(screen.getByRole('textbox')).toHaveStyle({ color: 'red' });
  const panel = await screen.findByText('Extra controls');
  expect(panel.closest('[data-tao-time-popup]')).toHaveAttribute(
    'data-tao-theme',
    'dark',
  );
  expect(panel.closest('[data-tao-time-popup]')).toHaveStyle({
    '--tao-color-primary': '#713fff',
  });
  expect(screen.getByRole('button', { name: '确定' })).toBeTruthy();
});

test('public ref focuses and blurs the input', () => {
  const ref = createRef<TimePickerRef>();
  render(<TimePicker ref={ref} />);
  act(() => ref.current?.focus());
  expect(screen.getByRole('textbox')).toHaveFocus();
  expect(ref.current?.nativeElement).toHaveAttribute('data-tao-time-picker');
  act(() => ref.current?.blur());
  expect(screen.getByRole('textbox')).not.toHaveFocus();
});

test('RangePicker formats both ends and clears the range with the upstream payload', () => {
  const changes: unknown[] = [];
  render(
    <TimePicker.RangePicker
      defaultValue={[
        dayjs('2026-11-04T09:00:00'),
        dayjs('2026-11-04T18:30:00'),
      ]}
      format="HH:mm"
      onChange={(values, strings) => changes.push([values, strings])}
    />,
  );
  const inputs = screen.getAllByRole('textbox');
  expect(inputs[0]).toHaveValue('09:00');
  expect(inputs[1]).toHaveValue('18:30');
  fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(changes).toEqual([[null, null]]);
  expect(inputs[0]).toHaveValue('');
  expect(inputs[1]).toHaveValue('');
});
