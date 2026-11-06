import type { ValidateMessages } from '@rc-component/form/es/interface';
import dayjs from 'dayjs';
import type { BuiltinTaoLocale } from './types';

export function createItemCount(
  locale: string,
  forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string },
): (count: number) => string {
  const rules = new Intl.PluralRules(locale);
  const number = new Intl.NumberFormat(locale, { useGrouping: false });
  return (count) =>
    (forms[rules.select(count)] ?? forms.other).replace(
      '#',
      number.format(count),
    );
}

type LocaleDefinition = Omit<
  BuiltinTaoLocale,
  'weekdays' | 'months' | 'monthTitle' | 'calendarTitle'
>;

/** Each language module registers only its own Day.js resource before calling this. */
export function createLocale(definition: LocaleDefinition): BuiltinTaoLocale {
  const weekday = (index: number) =>
    dayjs('2020-01-06')
      .add(index, 'day')
      .locale(definition.dayjsLocale)
      .format('dd');
  const month = (index: number) =>
    dayjs('2020-01-01')
      .month(index)
      .locale(definition.dayjsLocale)
      .format('MMM');
  const weekdays: BuiltinTaoLocale['weekdays'] = [
    weekday(0),
    weekday(1),
    weekday(2),
    weekday(3),
    weekday(4),
    weekday(5),
    weekday(6),
  ];
  const months: BuiltinTaoLocale['months'] = [
    month(0),
    month(1),
    month(2),
    month(3),
    month(4),
    month(5),
    month(6),
    month(7),
    month(8),
    month(9),
    month(10),
    month(11),
  ];
  const title = (month: 'short' | 'long') => {
    const formatter = new Intl.DateTimeFormat(definition.numberLocale, {
      year: 'numeric',
      month,
      calendar: 'gregory',
      timeZone: 'UTC',
    });
    return (monthIndex: number, year: number) => {
      const date = new Date(0);
      date.setUTCFullYear(year, monthIndex, 1);
      return formatter.format(date);
    };
  };
  const pickerLabel = (
    current: string | undefined,
    englishDefault: string,
    translated: string,
  ) =>
    definition.locale === 'en_US' || (current && current !== englishDefault)
      ? current
      : translated;
  return {
    ...definition,
    pickerLocale: {
      ...definition.pickerLocale,
      hourSelect: pickerLabel(
        definition.pickerLocale.hourSelect,
        'Select an hour',
        definition.hour,
      ),
      minuteSelect: pickerLabel(
        definition.pickerLocale.minuteSelect,
        'Select a minute',
        definition.minute,
      ),
      secondSelect: pickerLabel(
        definition.pickerLocale.secondSelect,
        'Select a second',
        definition.second,
      ),
      millisecondSelect: pickerLabel(
        definition.pickerLocale.millisecondSelect,
        'Select a millisecond',
        definition.messages.millisecond,
      ),
      meridiemSelect: pickerLabel(
        definition.pickerLocale.meridiemSelect,
        'Select a meridiem',
        definition.messages.meridiem,
      ),
    },
    weekdays,
    months,
    monthTitle: title('short'),
    calendarTitle: title('long'),
  };
}

interface FormMessages {
  default: string;
  required: string;
  enum: string;
  whitespace: string;
  invalid: string;
  dateFormat: string;
  dateParse: string;
  dateInvalid: string;
  string: { len: string; min: string; max: string; range: string };
  number: { len: string; min: string; max: string; range: string };
  array: { len: string; min: string; max: string; range: string };
  pattern: string;
  typeNames: Record<keyof NonNullable<ValidateMessages['types']>, string>;
}

/** Expand translated type names once; rc-form substitutes field values at validation time. */
export function createFormMessages(text: FormMessages): ValidateMessages {
  return {
    default: text.default,
    required: text.required,
    enum: text.enum,
    whitespace: text.whitespace,
    date: {
      format: text.dateFormat,
      parse: text.dateParse,
      invalid: text.dateInvalid,
    },
    types: Object.fromEntries(
      Object.entries(text.typeNames).map(([type, name]) => [
        type,
        text.invalid.replace(`\${type}`, name),
      ]),
    ),
    string: text.string,
    number: text.number,
    array: text.array,
    pattern: { mismatch: text.pattern },
  };
}
