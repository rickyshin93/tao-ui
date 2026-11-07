import { expect, rstest, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { RangePicker } from '../../src/components/date-picker/range-picker';

test.each([
  {
    picker: 'month' as const,
    start: 'Jun',
    end: 'Aug',
    dates: ['2026-06-01', '2026-08-01'],
  },
  {
    picker: 'year' as const,
    start: '2026',
    end: '2028',
    dates: ['2026-01-01', '2028-01-01'],
  },
])(
  '$picker selects a range at the documented granularity',
  ({ picker, start, end, dates }) => {
    const onChange = rstest.fn();
    render(
      <RangePicker
        mobile={false}
        open
        picker={picker}
        defaultValue={[dayjs('2026-06-10'), null]}
        onChange={onChange}
      />,
    );
    fireEvent.click(
      screen.getAllByRole('button', { name: start, exact: true })[0],
    );
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getAllByRole('button', { name: end, exact: true })[0],
    );
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(
      onChange.mock.calls[0][0]?.map((date) => date?.format('YYYY-MM-DD')),
    ).toEqual(dates);
    expect(
      screen.getAllByRole('button', { name: start, exact: true })[0],
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getAllByRole('button', { name: end, exact: true })[0],
    ).toHaveAttribute('aria-pressed', 'true');
  },
);

test.each([
  { picker: 'month' as const, text: '2026-06' },
  { picker: 'year' as const, text: '2026' },
])('$picker accepts the period containing minDate', ({ picker, text }) => {
  const onChange = rstest.fn();
  render(
    <RangePicker
      mobile={false}
      picker={picker}
      minDate={dayjs('2026-06-15')}
      onChange={onChange}
    />,
  );
  const input = screen.getAllByRole('combobox')[0];
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][1]).toEqual([text, '']);
});

test.each([
  { picker: 'month', start: '2026-01-01', end: '2026-12-01', label: 'Dec' },
  { picker: 'year', start: '2005-01-01', end: '2026-01-01', label: '2026' },
] as const)(
  'keyboard entry starts on the selected end $picker',
  ({ picker, start, end, label }) => {
    render(
      <RangePicker
        mobile={false}
        picker={picker}
        defaultValue={[dayjs(start), dayjs(end)]}
      />,
    );
    const endInput = screen.getAllByRole('combobox')[1];
    act(() => endInput.focus());
    fireEvent.keyDown(endInput, { key: 'ArrowDown' });
    expect(document.activeElement).toHaveTextContent(label);
  },
);
