import { expect, test } from '@rstest/core';
import dayjs from 'dayjs';
import {
  formatPickerDate,
  parsePickerDate,
} from '../../src/components/date-picker/date-localization';
import { arEG } from '../../src/locales/ar-EG';
import { deDE } from '../../src/locales/de-DE';
import { enUS } from '../../src/locales/en-US';
import { esES } from '../../src/locales/es-ES';
import { frFR } from '../../src/locales/fr-FR';
import { hiIN } from '../../src/locales/hi-IN';
import { idID } from '../../src/locales/id-ID';
import { itIT } from '../../src/locales/it-IT';
import { jaJP } from '../../src/locales/ja-JP';
import { koKR } from '../../src/locales/ko-KR';
import { ptBR } from '../../src/locales/pt-BR';
import { ruRU } from '../../src/locales/ru-RU';
import { thTH } from '../../src/locales/th-TH';
import { trTR } from '../../src/locales/tr-TR';
import { viVN } from '../../src/locales/vi-VN';
import { zhCN } from '../../src/locales/zh-CN';
import { zhTW } from '../../src/locales/zh-TW';

const locales = [
  enUS,
  zhCN,
  zhTW,
  jaJP,
  koKR,
  frFR,
  deDE,
  esES,
  itIT,
  ptBR,
  ruRU,
  arEG,
  hiIN,
  trTR,
  idID,
  thTH,
  viVN,
];

test.each(locales)(
  'localized dates strictly round trip in $locale',
  (locale) => {
    const globalLocale = dayjs.locale();
    const date = dayjs('2026-11-12T13:30:00');
    for (let month = 0; month < 12; month++) {
      const value = date.month(month);
      for (const format of [
        'L',
        'LL',
        'LLL',
        'LLLL',
        'DD MMM YYYY',
        'DD MMMM YYYY',
        'YYYY-MM-DD',
      ]) {
        const display = formatPickerDate(value, format, locale.dayjsLocale);
        const parsed = parsePickerDate(
          display,
          format,
          locale.dayjsLocale,
          locale.numberLocale,
        );
        expect(parsed.isValid()).toBe(true);
        expect(parsed.format('YYYY-MM-DD')).toBe(value.format('YYYY-MM-DD'));
        if (format === 'LLL' || format === 'LLLL')
          expect(parsed.format('HH:mm')).toBe('13:30');
        expect(
          parsePickerDate(
            `invalid ${display}`,
            format,
            locale.dayjsLocale,
            locale.numberLocale,
          ).isValid(),
        ).toBe(false);
      }
    }
    expect(dayjs.locale()).toBe(globalLocale);
    expect(date.locale()).toBe(globalLocale);
  },
);

test('a localized weekday must agree with the parsed date', () => {
  expect(
    parsePickerDate(
      'Friday, November 12, 2026 1:30 PM',
      'LLLL',
      'en',
      'en-US',
    ).isValid(),
  ).toBe(false);
});
