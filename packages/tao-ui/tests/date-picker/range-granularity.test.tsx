import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { RangePicker } from '../../src/components/date-picker/range-picker';

const cases = [
  { picker: 'date' as const, label: '2026-06-15', text: '2026-06-15' },
  { picker: 'month' as const, label: 'Jun', text: '2026-06' },
  { picker: 'year' as const, label: '2026', text: '2026' },
];

for (const input of ['calendar', 'keyboard', 'preset'] as const) {
  test.each(cases)(
    `$picker accepts the locked start's period via ${input}`,
    ({ picker, label, text }) => {
      const onChange = rs.fn();
      const start = dayjs('2026-06-15T12:30:00');
      const end = start.startOf(picker === 'date' ? 'day' : picker);
      render(
        <RangePicker
          mobile={false}
          open
          picker={picker}
          disabled={[true, false]}
          defaultValue={[start, null]}
          onChange={onChange}
          presets={[{ label: 'Same period', value: [start, end] }]}
        />,
      );
      if (input === 'calendar') {
        const button = screen.getAllByRole('button', {
          name: label,
          exact: true,
        })[0];
        expect(button).not.toBeDisabled();
        fireEvent.click(button);
      } else if (input === 'keyboard') {
        const field = screen.getAllByRole('combobox')[1];
        fireEvent.change(field, { target: { value: text } });
        fireEvent.keyDown(field, { key: 'Enter' });
      } else {
        fireEvent.click(screen.getByRole('button', { name: 'Same period' }));
      }
      expect(onChange).toHaveBeenCalledTimes(1);
      const [dates, strings] = onChange.mock.calls[0];
      expect(dates[0].valueOf()).toBe(start.valueOf());
      expect(dates[1].valueOf()).toBe(end.valueOf());
      expect(strings).toEqual([text, text]);
    },
  );
}

test.each(cases)(
  '$picker rejects a period before the locked start',
  ({ picker }) => {
    const onChange = rs.fn();
    const start = dayjs('2026-06-15T12:30:00');
    const end = start.subtract(1, picker === 'date' ? 'day' : picker);
    render(
      <RangePicker
        mobile={false}
        open
        picker={picker}
        disabled={[true, false]}
        defaultValue={[start, null]}
        onChange={onChange}
        presets={[{ label: 'Earlier period', value: [start, end] }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Earlier period' }));
    expect(onChange).not.toHaveBeenCalled();
  },
);
