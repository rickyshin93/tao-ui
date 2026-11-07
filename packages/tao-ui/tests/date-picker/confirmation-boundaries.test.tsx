import { expect, rs, test } from '@rstest/core';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import dayjs from 'dayjs';
import { DatePicker } from '../../src/components/date-picker/date-picker';
import { RangePicker } from '../../src/components/date-picker/range-picker';

test.each([
  ['DatePicker', DatePicker],
  ['RangePicker', RangePicker],
] as const)(
  '%s does not steal focus on a later controlled open after a rejected keyboard request',
  async (_, Picker) => {
    const onOpenChange = rs.fn();
    const example = (open: boolean) => (
      <>
        <Picker mobile={false} open={open} onOpenChange={onOpenChange} />
        <button type="button">Other action</button>
      </>
    );
    const view = render(example(false));
    const input = screen.getAllByRole('combobox')[0];
    act(() => input.focus());
    await userEvent.keyboard('{ArrowDown}');
    expect(onOpenChange).toHaveBeenCalledWith(true);
    const action = screen.getByRole('button', { name: 'Other action' });
    await userEvent.click(action);
    view.rerender(example(true));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(action).toHaveFocus();
  },
);

test('leaving an unchanged closed RangePicker does not emit a close event', () => {
  const onOpenChange = rs.fn();
  render(
    <RangePicker
      mobile={false}
      defaultValue={[dayjs('2026-11-07'), dayjs('2026-11-09')]}
      onOpenChange={onOpenChange}
    />,
  );
  const input = screen.getAllByRole('combobox')[0];
  act(() => input.focus());
  act(() => input.blur());
  expect(onOpenChange).not.toHaveBeenCalled();
});

test('leaving an unchanged closed DatePicker does not emit a close event', () => {
  const onOpenChange = rs.fn();
  render(
    <DatePicker
      mobile={false}
      defaultValue={dayjs('2026-11-07')}
      onOpenChange={onOpenChange}
    />,
  );
  const input = screen.getByRole('combobox');
  act(() => input.focus());
  act(() => input.blur());
  expect(onOpenChange).not.toHaveBeenCalled();
});

test.each([false, true])(
  'Now cannot select a blocked date (mobile=%s)',
  (mobile) => {
    const changed = rs.fn();
    render(
      <DatePicker
        mobile={mobile}
        open
        showTime
        minDate={dayjs().add(2, 'day')}
        onChange={changed}
      />,
    );
    const now = screen.getByRole('button', { name: 'Now' });
    expect(now).toBeDisabled();
    fireEvent.click(now);
    expect(changed).not.toHaveBeenCalled();
  },
);

test('time controls cannot create a date on an unavailable day', () => {
  const changed = rs.fn();
  render(
    <DatePicker
      mobile={false}
      open
      showTime
      disabledDate={() => true}
      onChange={changed}
    />,
  );
  const noon = within(screen.getByRole('group', { name: 'Hour' })).getByRole(
    'button',
    { name: '12' },
  );
  expect(noon).toBeDisabled();
  fireEvent.click(noon);
  expect(changed).not.toHaveBeenCalled();
});

test.each([DatePicker, RangePicker])(
  'IME Enter keeps date input pending',
  (Picker) => {
    const changed = rs.fn();
    render(<Picker mobile={false} onChange={changed} />);
    const input = screen.getAllByRole('combobox')[0];
    act(() => input.focus());
    fireEvent.change(input, { target: { value: '2026-06-15' } });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true, keyCode: 229 });
    expect(changed).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(changed).toHaveBeenCalledTimes(1);
  },
);

const start = dayjs('2026-06-10 09:15:00');
const end = dayjs('2026-06-20 17:30:00');

test('DatePicker validates the preserved time when selecting a different date', () => {
  const onChange = rs.fn();
  render(
    <DatePicker
      mobile={false}
      open
      showTime
      defaultValue={start.hour(13)}
      disabledDate={(date) => date.date() === 20 && date.hour() >= 12}
      onChange={onChange}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: '2026-06-20' }));
  expect(onChange).not.toHaveBeenCalled();
});

test('DatePicker drops pending typed text when the user selects the original day', () => {
  render(<DatePicker mobile={false} open defaultValue={start} />);
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: '2026-06-18' } });
  fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }));
  expect(input).toHaveValue('2026-06-10');
});

test.each(['date', 'month', 'year'] as const)(
  'an open disabled DatePicker prevents %s cell and preset selection',
  (picker) => {
    const changed = rs.fn();
    const cell = { date: '2026-06-10', month: 'Jun', year: '2026' }[picker];
    render(
      <DatePicker
        mobile={false}
        open
        disabled
        picker={picker}
        value={start}
        presets={[{ label: 'Preset', value: end }]}
        onChange={changed}
      />,
    );
    const date = screen.getByRole('button', { name: cell, exact: true });
    const preset = screen.getByRole('button', { name: 'Preset' });
    fireEvent.click(date);
    fireEvent.click(preset);
    expect(changed).not.toHaveBeenCalled();
    expect(date).toBeDisabled();
    expect(preset).toBeDisabled();
  },
);

test('the time column can edit a typed RangePicker endpoint with no previous value', () => {
  const changed = rs.fn();
  render(
    <RangePicker
      mobile={false}
      open
      showTime
      defaultValue={[start, null]}
      onChange={changed}
    />,
  );
  const endInput = screen.getAllByRole('combobox')[1];
  act(() => endInput.focus());
  fireEvent.change(endInput, { target: { value: '2026-06-15 12:30:00' } });
  const endHours = within(screen.getAllByRole('group', { name: 'Hour' })[1]);
  const hour = endHours.getByRole('button', { name: '14' });
  expect(hour.closest('fieldset')).toBeEnabled();
  fireEvent.click(hour);
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(changed.mock.calls.map(([, text]) => text)).toEqual([
    ['2026-06-10 09:15:00', '2026-06-15 14:30:00'],
  ]);
});

test('a valid typed endpoint enables and confirms a time range before blur', () => {
  const changed = rs.fn();
  render(
    <RangePicker
      mobile={false}
      open
      showTime
      defaultValue={[start, null]}
      onChange={changed}
    />,
  );
  const endInput = screen.getAllByRole('combobox')[1];
  act(() => endInput.focus());
  fireEvent.change(endInput, { target: { value: '2026-06-15 12:00:00' } });

  const ok = screen.getByRole('button', { name: 'OK' });
  expect(ok).toBeEnabled();
  fireEvent.click(ok);
  expect(changed.mock.calls.map(([, text]) => text)).toEqual([
    ['2026-06-10 09:15:00', '2026-06-15 12:00:00'],
  ]);
});

test('time-range confirmation blocks invalid text and restores rejected controlled edits', () => {
  const changed = rs.fn();
  render(
    <RangePicker
      mobile={false}
      open
      showTime
      value={[start, end]}
      onChange={changed}
    />,
  );
  const startInput = screen.getAllByRole('combobox')[0];
  act(() => startInput.focus());
  fireEvent.change(startInput, { target: { value: 'invalid' } });
  const ok = screen.getByRole('button', { name: 'OK' });
  expect(ok).toBeDisabled();
  fireEvent.click(ok);
  expect(changed).not.toHaveBeenCalled();

  fireEvent.change(startInput, { target: { value: '2026-06-11 13:00:00' } });
  expect(ok).toBeEnabled();
  fireEvent.click(ok);
  expect(changed.mock.calls.map(([, text]) => text)).toEqual([
    ['2026-06-11 13:00:00', '2026-06-20 17:30:00'],
  ]);
  expect(startInput).toHaveValue('2026-06-10 09:15:00');
});
