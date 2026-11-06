import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import localeData from 'dayjs/plugin/localeData';
import {
  normalizeDigits,
  resolveNumberFormat,
} from '../../number-input/locale';

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(localeData);

const withoutDirectionMarks = (text: string) =>
  text.replace(/[\u061c\u200e\u200f]/g, '');

export function formatPickerDate(
  value: Dayjs | null | undefined,
  format: string,
  locale: string | undefined,
): string {
  if (!value) return '';
  return (locale ? value.locale(locale) : value).format(format);
}

export function parsePickerDate(
  text: string,
  format: string,
  locale: string | undefined,
  numberLocale?: string,
): Dayjs {
  const normalized = withoutDirectionMarks(
    normalizeDigits(text, resolveNumberFormat(numberLocale)),
  );
  const parsed = dayjs(normalized, format, locale, true);
  if (parsed.isValid()) return parsed;
  const reference = locale
    ? dayjs('2000-01-01').locale(locale)
    : dayjs('2000-01-01');
  const expanded = withoutDirectionMarks(
    format.replace(
      /(\[[^\]]*])|(LTS?|l{1,4}|L{1,4})/g,
      (token, literal: string | undefined) =>
        literal ?? reference.localeData().longDateFormat(token),
    ),
  );
  const literalFormat = expanded.replace(
    /(\[[^\]]*\])|(\P{ASCII}+)/gu,
    (token, literal: string | undefined) => literal ?? `[${token}]`,
  );
  const weekdayFormat = literalFormat.replace(
    /(\[[^\]]*])|(dddd|ddd|dd)/g,
    (token, literal: string | undefined) => {
      if (literal) return literal;
      const name = Array.from({ length: 7 }, (_, day) =>
        reference.day(day).format(token),
      )
        .sort((left, right) => right.length - left.length)
        .find((candidate) => normalized.includes(candidate));
      return `[${name}]`;
    },
  );
  let hasMeridiem = false;
  const namedFormat = weekdayFormat.replace(
    /(\[[^\]]*])|(A|a)/g,
    (token, literal: string | undefined) => {
      if (literal) return literal;
      hasMeridiem = true;
      const name = Array.from({ length: 24 }, (_, hour) =>
        reference.hour(hour).format(token),
      )
        .sort((left, right) => right.length - left.length)
        .find((candidate) => normalized.includes(candidate));
      return `[${name}]`;
    },
  );
  const exactResult = (value: Dayjs) => {
    if (!value.isValid()) return value;
    const candidates = hasMeridiem
      ? [value.hour(value.hour() % 12), value.hour((value.hour() % 12) + 12)]
      : [value];
    return (
      candidates.find(
        (candidate) =>
          withoutDirectionMarks(candidate.format(format)) === normalized,
      ) ?? dayjs(NaN)
    );
  };
  const monthTokens = [...namedFormat.matchAll(/(\[[^\]]*])|(MMMM|MMM)/g)]
    .map((match) => match[2])
    .filter((token): token is string => token !== undefined);
  if (monthTokens.length === 0) {
    const parsedWeekday = dayjs(normalized, namedFormat, locale, true);
    return exactResult(parsedWeekday);
  }

  // Day.js cannot parse month names containing digits, such as Vietnamese
  // "tháng 11" or Chinese "11月". Parse the recognized name as a literal and
  // supply its month number separately; the original format remains strict.
  const monthNames = (month: number, token: string) => {
    const date = reference.month(month);
    return [date.format(token), date.format(`D ${token}`).slice(2)];
  };
  const selected = Array.from({ length: 12 }, (_, month) =>
    monthNames(month, monthTokens[0]).map((name) => ({ month, name })),
  )
    .flat()
    .sort((left, right) => right.name.length - left.name.length)
    .find(({ name }) => normalized.includes(name));
  if (!selected) return dayjs(NaN);
  const numericFormat = namedFormat.replace(
    /(\[[^\]]*])|(MMMM|MMM)/g,
    (token, literal: string | undefined) => {
      if (literal) return literal;
      const name = monthNames(selected.month, token)
        .sort((left, right) => right.length - left.length)
        .find((candidate) => normalized.includes(candidate));
      return `[${name}]`;
    },
  );
  const parsedMonth = dayjs(
    `${normalized} ${String(selected.month + 1).padStart(2, '0')}`,
    `${numericFormat} MM`,
    locale,
    true,
  );
  return exactResult(parsedMonth);
}
