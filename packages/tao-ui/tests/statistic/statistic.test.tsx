import { afterEach, expect, rstest, test } from '@rstest/core';
import { act, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import {
  Statistic,
  type StatisticRef,
} from '../../src/components/statistic/statistic';

afterEach(() => rstest.useRealTimers());

test('formats groups and truncates precision while preserving large numeric strings', () => {
  const { rerender, container } = render(
    <Statistic
      value="12345678901234567890.9876"
      precision={2}
      groupSeparator=" "
      decimalSeparator=","
    />,
  );
  expect(container.textContent).toBe('12 345 678 901 234 567 890,98');
  rerender(<Statistic value={1e-7} />);
  expect(container.textContent).toBe('0.0000001');
  rerender(<Statistic value="unknown" />);
  expect(container.textContent).toBe('unknown');
  rerender(<Statistic value={-2} precision={2} />);
  expect(container.textContent).toBe('-2.00');
});
test('custom formatting, value wrapping and semantic slots coexist', () => {
  const ref = createRef<StatisticRef>();
  render(
    <Statistic
      ref={ref}
      title={0}
      value={42}
      prefix="$"
      suffix="USD"
      formatter={(value) => `Total ${value}`}
      valueRender={(node) => <strong>{node}</strong>}
      valueStyle={{ color: 'blue' }}
      styles={{ content: { color: 'green' }, value: { fontWeight: 700 } }}
    />,
  );
  expect(screen.getByText('Total 42').parentElement?.tagName).toBe('STRONG');
  expect(
    screen.getByText('Total 42').closest('[data-tao-statistic-content]'),
  ).toHaveStyle({ color: 'green' });
  expect(ref.current?.nativeElement).toContainElement(screen.getByText('USD'));
  expect(screen.getByText('0')).toBeTruthy();
});
test('loading replaces the value without removing its title', () => {
  const { rerender } = render(<Statistic title="Revenue" value={42} loading />);
  expect(screen.queryByText('42')).toBeNull();
  expect(screen.getByText('Revenue')).toBeTruthy();
  rerender(<Statistic title="Revenue" value={42} loading={false} />);
  expect(screen.getByText('42')).toBeTruthy();
});
test('countdown ticks, clamps its display, finishes once and stops callbacks', () => {
  rstest.useFakeTimers();
  rstest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  const onFinish = rstest.fn();
  const onChange = rstest.fn();
  render(
    <Statistic.Timer
      type="countdown"
      value={Date.now() + 1000}
      format="ss.SSS"
      onFinish={onFinish}
      onChange={onChange}
    />,
  );
  expect(screen.getByText('01.000')).toBeTruthy();
  act(() => rstest.advanceTimersByTime(1100));
  expect(screen.getByText('00.000')).toBeTruthy();
  expect(onFinish).toHaveBeenCalledTimes(1);
  const calls = onChange.mock.calls.length;
  act(() => rstest.advanceTimersByTime(1000));
  expect(onChange).toHaveBeenCalledTimes(calls);
});
test('countup formats literals, restarts for new values and tears down on unmount', () => {
  rstest.useFakeTimers();
  rstest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  const onFinish = rstest.fn();
  const onChange = rstest.fn();
  const start = Date.now() - 90061000;
  const { rerender, unmount } = render(
    <Statistic.Timer
      type="countup"
      value={start}
      format="D [days] HH:mm:ss"
      onFinish={onFinish}
      onChange={onChange}
    />,
  );
  expect(screen.getByText('1 days 01:01:01')).toBeTruthy();
  act(() => rstest.advanceTimersByTime(1010));
  expect(onFinish).not.toHaveBeenCalled();
  rerender(
    <Statistic.Countdown
      value={Date.now() + 1000}
      format="ss"
      onFinish={onFinish}
      onChange={onChange}
    />,
  );
  act(() => rstest.advanceTimersByTime(1100));
  expect(onFinish).toHaveBeenCalledTimes(1);
  unmount();
  expect(rstest.getTimerCount()).toBe(0);
});
