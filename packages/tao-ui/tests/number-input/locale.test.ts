import { expect, test } from '@rstest/core';
import { format, parse } from '../../src/number-input/format';
import {
  normalizeDigits,
  resolveNumberFormat,
} from '../../src/number-input/locale';

test.each([
  'en-US',
  'zh-CN',
  'zh-TW',
  'ja-JP',
  'ko-KR',
  'fr-FR',
  'de-DE',
  'es-ES',
  'it-IT',
  'pt-BR',
  'ru-RU',
  'ar-EG',
  'hi-IN',
  'tr-TR',
  'id-ID',
  'th-TH',
  'vi-VN',
])(
  '%s matches native grouping and digits without rounding canonical values',
  (locale) => {
    const options = resolveNumberFormat(locale);
    const native = new Intl.NumberFormat(locale);
    for (const value of ['0', '1234', '1234567.89']) {
      expect(format(value, options)).toBe(native.format(Number(value)));
    }
    const exact = '-9007199254740993123456789.000123456789';
    expect(parse(format(exact, options), options)).toBe(exact);
  },
);

test('localized input preserves trailing decimal and normalizes native bidi prefixes', () => {
  const options = resolveNumberFormat('ar-EG');
  expect(format('-', options)).toBe('-');
  expect(format('123.', options)).toBe('١٢٣٫');
  expect(parse('؜-١٢٣٫', options)).toBe('-123.');
  expect(normalizeDigits('؜٢٠٢٦/١١/٠٦ ١٢:٣٠', options)).toBe('؜2026/11/06 12:30');
});

test('localized group punctuation stays unambiguous and explicit decimal wins', () => {
  expect(parse('1.234,56', resolveNumberFormat('de-DE'))).toBe('1234.56');
  expect(parse('123.45', resolveNumberFormat('fr-FR'))).toBe('123.45');
  const options = resolveNumberFormat('ar-EG', {
    decimalSeparator: ',',
    thousandsSeparator: '',
  });
  expect(format('1234.56', options)).toBe('١٢٣٤,٥٦');
  expect(parse('١٢٣٤,٥٦', options)).toBe('1234.56');
});
