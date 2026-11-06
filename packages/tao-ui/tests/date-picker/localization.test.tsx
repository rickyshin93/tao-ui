import frPickerLocale from '@rc-component/picker/locale/fr_FR';
import enPickerLocale from '@rc-component/picker/locale/en_US';
import arPickerLocale from '@rc-component/picker/locale/ar_EG';
import { expect, rstest, test } from '@rstest/core';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import 'dayjs/locale/ar';
import { Calendar } from '../../src/components/calendar/calendar';
import { CalendarGrid } from '../../src/components/date-picker/calendar/calendar-grid';
import { DatePicker } from '../../src/components/date-picker/date-picker';
import { RangePicker } from '../../src/components/date-picker/range-picker';
import { TimePicker } from '../../src/components/time-picker/time-picker';
import { enUS, TaoProvider } from '../../src/provider/tao-provider';
import { koKR } from '../../src/locales/ko-KR';
import {
  formatPickerDate,
  parsePickerDate,
} from '../../src/components/date-picker/date-localization';

const french = {
  ...enUS,
  locale: 'fr_FR',
  dayjsLocale: 'fr',
  weekStartsOn: 1 as const,
  pickerLocale: frPickerLocale,
  weekdays: ['lu', 'ma', 'me', 'je', 've', 'sa', 'di'] as const,
  messages: {
    calendarYear: 'Année',
    calendarMonth: 'Mois',
    calendarView: 'Vue du calendrier',
  },
};

const arabic = {
  ...enUS,
  locale: 'ar_EG',
  dayjsLocale: 'ar',
  numberLocale: 'ar-EG',
  weekStartsOn: 6 as const,
  pickerLocale: arPickerLocale,
};

test('date display follows provider language without mutating values or the global locale', () => {
  const value = dayjs('2026-11-11').locale('zh-cn');
  const globalLocale = dayjs.locale();
  const { rerender } = render(
    <TaoProvider locale={french}>
      <DatePicker value={value} format="DD MMMM YYYY" />
    </TaoProvider>,
  );
  expect(screen.getByRole('combobox')).toHaveValue('11 novembre 2026');
  expect(value.locale()).toBe('zh-cn');
  expect(dayjs.locale()).toBe(globalLocale);
  rerender(
    <TaoProvider locale={enUS}>
      <DatePicker value={value} format="DD MMMM YYYY" />
    </TaoProvider>,
  );
  expect(screen.getByRole('combobox')).toHaveValue('11 November 2026');
});

test('localized date formats parse and emit the selected format while ISO remains the default', () => {
  const change = rstest.fn();
  const { rerender } = render(
    <TaoProvider locale={french}>
      <DatePicker format="L" onChange={change} />
    </TaoProvider>,
  );
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: '12/11/2026' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(change).toHaveBeenCalledTimes(1);
  const [date, text] = change.mock.calls[0];
  expect(date.format('YYYY-MM-DD')).toBe('2026-11-12');
  expect(text).toBe('12/11/2026');
  rerender(
    <TaoProvider locale={french}>
      <DatePicker value={dayjs('2026-11-12')} />
    </TaoProvider>,
  );
  expect(screen.getByRole('combobox')).toHaveValue('2026-11-12');
});

test('named month input and both range values use the active locale', () => {
  const change = rstest.fn();
  render(
    <TaoProvider locale={french}>
      <RangePicker
        defaultValue={[dayjs('2026-11-11'), dayjs('2026-11-20')]}
        format="DD MMMM YYYY"
        onChange={change}
      />
    </TaoProvider>,
  );
  const inputs = screen.getAllByRole('combobox');
  expect(inputs[0]).toHaveValue('11 novembre 2026');
  expect(inputs[1]).toHaveValue('20 novembre 2026');
  fireEvent.change(inputs[1], { target: { value: '22 novembre 2026' } });
  fireEvent.keyDown(inputs[1], { key: 'Enter' });
  expect(change).toHaveBeenCalledTimes(1);
  expect(change.mock.calls[0][0][1].format('YYYY-MM-DD')).toBe('2026-11-22');
  expect(change.mock.calls[0][1]).toEqual([
    '11 novembre 2026',
    '22 novembre 2026',
  ]);
});

test.each([0, 1, 6] as const)(
  'calendar columns and Home/End follow week start %s',
  (weekStartsOn) => {
    render(
      <TaoProvider locale={{ ...enUS, weekStartsOn }}>
        <CalendarGrid
          viewDate={dayjs('2026-11-11')}
          value={dayjs('2026-11-11')}
          onSelect={() => {}}
        />
      </TaoProvider>,
    );
    const names = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent(
      names[weekStartsOn],
    );
    const day = screen.getByRole('button', { name: '2026-11-11' });
    day.focus();
    fireEvent.keyDown(day, { key: 'Home' });
    const first = dayjs('2026-11-11').subtract(
      (3 - weekStartsOn + 7) % 7,
      'day',
    );
    expect(document.activeElement).toHaveAttribute(
      'aria-label',
      first.format('YYYY-MM-DD'),
    );
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(document.activeElement).toHaveAttribute(
      'aria-label',
      first.add(6, 'day').format('YYYY-MM-DD'),
    );
  },
);

test('Calendar uses provider picker resources and retains component locale overrides', () => {
  const { container, rerender } = render(
    <TaoProvider locale={french}>
      <Calendar value={dayjs('2026-11-11')} fullscreen={false} />
    </TaoProvider>,
  );
  expect(screen.getByRole('combobox', { name: 'Mois' })).toHaveTextContent(
    'nov.',
  );
  expect(
    screen.getByRole('radiogroup', { name: 'Vue du calendrier' }),
  ).toBeTruthy();
  expect(container.querySelector('th')).toHaveTextContent('lu');
  rerender(
    <TaoProvider locale={french}>
      <Calendar
        value={dayjs('2026-11-11')}
        locale={{ lang: { shortMonths: Array(12).fill('Custom') } }}
      />
    </TaoProvider>,
  );
  expect(screen.getByRole('combobox', { name: 'Mois' })).toHaveTextContent(
    'Custom',
  );
});

test('TimePicker localized time format follows the provider', () => {
  const { container, rerender } = render(
    <TaoProvider locale={french}>
      <TimePicker value={dayjs('2026-11-11T13:30:00')} format="LT" />
    </TaoProvider>,
  );
  expect(within(container).getByRole('textbox')).toHaveValue('13:30');
  rerender(
    <TaoProvider locale={french}>
      <TimePicker
        value={dayjs('2026-11-11T13:30:00')}
        format="LT"
        locale={{ lang: enPickerLocale }}
      />
    </TaoProvider>,
  );
  expect(within(container).getByRole('textbox')).toHaveValue('1:30 PM');
});

test('Calendar component locale overrides provider labels and week conventions', () => {
  const { container } = render(
    <TaoProvider locale={french}>
      <Calendar value={dayjs('2026-11-11')} locale={{ lang: enPickerLocale }} />
    </TaoProvider>,
  );
  expect(screen.getByRole('combobox', { name: 'Month' })).toHaveTextContent(
    'Nov',
  );
  expect(container.querySelector('th')).toHaveTextContent('Su');
});

test('Arabic date formats round trip strictly without changing global locale or ISO output', () => {
  const globalLocale = dayjs.locale();
  const date = dayjs('2026-11-11');
  for (const format of ['L', 'LL', 'DD MMMM YYYY']) {
    const text = formatPickerDate(date, format, arabic.dayjsLocale);
    expect(
      parsePickerDate(text, format, arabic.dayjsLocale).format('YYYY-MM-DD'),
    ).toBe('2026-11-11');
    expect(
      parsePickerDate(`invalid ${text}`, format, arabic.dayjsLocale).isValid(),
    ).toBe(false);
  }
  expect(formatPickerDate(date, 'YYYY-MM-DD', arabic.dayjsLocale)).toBe(
    '2026-11-11',
  );
  expect(dayjs.locale()).toBe(globalLocale);
});

test('Arabic date digits normalize at the boundary and invalid dates are rejected', () => {
  const change = rstest.fn();
  render(
    <TaoProvider locale={arabic}>
      <DatePicker onChange={change} />
    </TaoProvider>,
  );
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: '٢٠٢٦-١١-١٢' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(change).toHaveBeenCalledTimes(1);
  expect(change.mock.calls[0][1]).toBe('2026-11-12');
  expect(input).toHaveValue('2026-11-12');
  fireEvent.change(input, { target: { value: '٢٠٢٦-١١-٣١' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(change).toHaveBeenCalledTimes(1);
  expect(input).toHaveValue('2026-11-12');
  const localized = formatPickerDate(dayjs('2026-11-12'), 'L', 'ar');
  const digits = localized.replace(
    /\d/g,
    (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)],
  );
  expect(parsePickerDate(digits, 'L', 'ar', 'ar-EG').format('YYYY-MM-DD')).toBe(
    '2026-11-12',
  );
  expect(
    parsePickerDate('١٢/١١/٢٠٢٦', 'L', 'ar', 'ar-EG').format('YYYY-MM-DD'),
  ).toBe('2026-11-12');
  expect(
    parsePickerDate('12/11/2026', 'L', 'ar', 'ar-EG').format('YYYY-MM-DD'),
  ).toBe('2026-11-12');
});

test('Arabic time digits normalize without changing the callback format', async () => {
  const change = rstest.fn();
  render(
    <TaoProvider locale={arabic}>
      <TimePicker format="HH:mm" needConfirm={false} onChange={change} />
    </TaoProvider>,
  );
  const input = screen.getByRole('textbox');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: '١٤:٣٥' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  await waitFor(() => expect(change).toHaveBeenCalledTimes(1));
  expect(change.mock.calls[0][1]).toBe('14:35');
});

test('localized Korean time periods preserve the selected hour', async () => {
  const change = rstest.fn();
  render(
    <TaoProvider locale={koKR}>
      <TimePicker format="LT" needConfirm={false} onChange={change} />
    </TaoProvider>,
  );
  const input = screen.getByRole('textbox');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: '오후 1:30' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  await waitFor(() => expect(change).toHaveBeenCalledTimes(1));
  expect(change.mock.calls[0][0].format('HH:mm')).toBe('13:30');
  expect(change.mock.calls[0][1]).toBe('오후 1:30');
});
