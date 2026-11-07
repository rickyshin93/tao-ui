import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen, within } from '@testing-library/react';
import dayjs from 'dayjs';
import { RangePicker } from '../../src/components/date-picker/range-picker';

const original: [dayjs.Dayjs, dayjs.Dayjs] = [
  dayjs('2026-06-10T09:15:00'),
  dayjs('2026-06-20T17:30:00'),
];

test.each([false, true])(
  'time range keeps endpoint times and commits only on OK (mobile=%s)',
  (mobile) => {
    const onChange = rstest.fn();
    render(
      <RangePicker
        mobile={mobile}
        open
        showTime
        defaultValue={original}
        onChange={onChange}
      />,
    );
    fireEvent.click(
      screen.getAllByRole('button', { name: '2026-06-11', exact: true })[0],
    );
    fireEvent.click(
      screen.getAllByRole('button', { name: '2026-06-18', exact: true })[0],
    );
    expect(onChange).not.toHaveBeenCalled();
    const hours = screen.getAllByRole('group', { name: 'Hour' });
    expect(hours).toHaveLength(2);
    fireEvent.click(within(hours[0]).getByRole('button', { name: '10' }));
    fireEvent.click(within(hours[1]).getByRole('button', { name: '18' }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'OK', exact: true }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][1]).toEqual([
      '2026-06-11 10:15:00',
      '2026-06-18 18:30:00',
    ]);
  },
);

test('closing the popup discards an unconfirmed time edit', () => {
  const onChange = rstest.fn();
  const props = {
    mobile: false,
    showTime: true,
    defaultValue: original,
    onChange,
  };
  const view = render(<RangePicker {...props} open />);
  fireEvent.click(
    within(screen.getAllByRole('group', { name: 'Hour' })[0]).getByRole(
      'button',
      { name: '10' },
    ),
  );
  view.rerender(<RangePicker {...props} open={false} />);
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getAllByRole('combobox')[0]).toHaveValue('2026-06-10 09:15:00');
  view.rerender(<RangePicker {...props} open />);
  expect(
    within(screen.getAllByRole('group', { name: 'Hour' })[0]).getByRole(
      'button',
      { name: '09' },
    ),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('disabled endpoint and chronological validation apply to time edits', () => {
  const onChange = rstest.fn();
  render(
    <RangePicker
      mobile={false}
      open
      showTime
      disabled={[true, false]}
      defaultValue={[original[0], original[0].hour(17)]}
      onChange={onChange}
    />,
  );
  const hours = screen.getAllByRole('group', { name: 'Hour' });
  expect(within(hours[0]).getByRole('button', { name: '10' })).toBeDisabled();
  fireEvent.click(within(hours[1]).getByRole('button', { name: '08' }));
  expect(
    screen.getByRole('button', { name: 'OK', exact: true }),
  ).toBeDisabled();
  fireEvent.click(within(hours[1]).getByRole('button', { name: '18' }));
  fireEvent.click(screen.getByRole('button', { name: 'OK', exact: true }));
  expect(onChange.mock.calls[0][1]).toEqual([
    '2026-06-10 09:15:00',
    '2026-06-10 18:15:00',
  ]);
});

test('typed time ranges and presets wait for confirmation', () => {
  const onChange = rstest.fn();
  render(
    <RangePicker
      mobile={false}
      open
      showTime
      defaultValue={original}
      presets={[{ label: 'Preset', value: original }]}
      onChange={onChange}
    />,
  );
  const input = screen.getAllByRole('combobox')[0];
  fireEvent.change(input, { target: { value: '2026-06-10 11:00:00' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'OK', exact: true }));
  expect(onChange.mock.calls[0][1][0]).toBe('2026-06-10 11:00:00');
  onChange.mockClear();
  fireEvent.click(screen.getByRole('button', { name: 'Preset', exact: true }));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'OK', exact: true }));
  expect(onChange.mock.calls[0][1][0]).toBe('2026-06-10 09:15:00');
});

const lockedStart = dayjs('2026-06-15T09:00:00');
const typedEnd = '2026-06-18 12:34:56';

test('RangePicker allows confirming an edited end with an empty disabled start', () => {
  const changed = rstest.fn();
  render(
    <RangePicker
      mobile={false}
      open
      showTime
      disabled={[true, false]}
      defaultValue={[null, lockedStart]}
      onChange={changed}
    />,
  );
  const end = screen.getAllByRole('combobox')[1];
  fireEvent.change(end, { target: { value: typedEnd } });
  fireEvent.keyDown(end, { key: 'Enter' });
  const ok = screen.getByRole('button', { name: 'OK' });
  expect(ok).toBeEnabled();
  fireEvent.click(ok);
  expect(changed.mock.calls.map(([, text]) => text)).toEqual([['', typedEnd]]);
});

test('RangePicker allows choosing a later time on the same day as a locked start', () => {
  const changed = rstest.fn();
  render(
    <RangePicker
      mobile={false}
      open
      showTime
      disabled={[true, false]}
      defaultValue={[lockedStart, null]}
      onChange={changed}
    />,
  );
  const sameDay = screen.getAllByRole('button', {
    name: '2026-06-15',
    exact: true,
  })[0];
  expect(sameDay).toBeEnabled();
  fireEvent.click(sameDay);
  const endHours = within(screen.getAllByRole('group', { name: 'Hour' })[1]);
  const noon = endHours.getByRole('button', { name: '12' });
  const ok = screen.getByRole('button', { name: 'OK' });
  expect(noon).toBeEnabled();
  expect(ok).toBeDisabled();
  fireEvent.click(noon);
  expect(ok).toBeEnabled();
  fireEvent.click(ok);
  expect(changed.mock.calls.map(([, text]) => text)).toEqual([
    ['2026-06-15 09:00:00', '2026-06-15 12:00:00'],
  ]);
});
