import { expect, test } from '@rstest/core';
import {
  format,
  padOnBlur,
  parse,
  truncateDecimals,
} from '../../src/number-input/format';
import type { FormatOptions } from '../../src/number-input/types';

const opts: FormatOptions = { decimalSeparator: '.', thousandsSeparator: ',' };

test('format: empty string', () => {
  expect(format('', opts)).toBe('');
});

test('format: zero', () => {
  expect(format('0', opts)).toBe('0');
});

test('format: integer with thousand sep', () => {
  expect(format('1234', opts)).toBe('1,234');
});

test('format: large integer with thousand sep', () => {
  expect(format('1234567', opts)).toBe('1,234,567');
});

test('format: decimal with thousand sep', () => {
  expect(format('1234.56', opts)).toBe('1,234.56');
});

test('format: negative with thousand sep', () => {
  expect(format('-1234.5', opts)).toBe('-1,234.5');
});

test('format: preserves trailing decimal point ("5.")', () => {
  expect(format('5.', opts)).toBe('5.');
});

test('format: preserves lone minus ("-")', () => {
  expect(format('-', opts)).toBe('-');
});

test('format: european locale (decimal=",", thousands=".")', () => {
  const eu: FormatOptions = { decimalSeparator: ',', thousandsSeparator: '.' };
  expect(format('1234.5', eu)).toBe('1.234,5');
});

test('format: empty thousand sep', () => {
  const noSep: FormatOptions = {
    decimalSeparator: '.',
    thousandsSeparator: '',
  };
  expect(format('1234.5', noSep)).toBe('1234.5');
});

test('parse: strips thousand separators', () => {
  expect(parse('1,234.56', opts)).toBe('1234.56');
});

test('parse: strips invalid chars and keeps only first decimal point', () => {
  expect(parse('abc1.2.3def', opts)).toBe('1.23');
});

test('parse: keeps only first leading minus', () => {
  expect(parse('1--2', opts)).toBe('12');
});

test('parse: prepends 0 to leading decimal point', () => {
  expect(parse('.5', opts)).toBe('0.5');
});

test('reversibility: parse(format(x, opts), opts) === x', () => {
  for (const x of ['', '0', '1234', '1234.56', '-1234.5', '0.5', '1234567']) {
    expect(parse(format(x, opts), opts)).toBe(x);
  }
});

test('truncateDecimals: trims to N places', () => {
  expect(truncateDecimals('1.23456', 2)).toBe('1.23');
});

test('truncateDecimals: integer untouched (does not pad)', () => {
  expect(truncateDecimals('1', 2)).toBe('1');
});

test('padOnBlur: never mode leaves "5" alone', () => {
  expect(padOnBlur('5', 2, 'never')).toBe('5');
});

test('padOnBlur: always mode pads "5" to "5.00"', () => {
  expect(padOnBlur('5', 2, 'always')).toBe('5.00');
});

test('padOnBlur: always mode pads "5.1" to "5.10"', () => {
  expect(padOnBlur('5.1', 2, 'always')).toBe('5.10');
});

test('padOnBlur: whenHasDecimal leaves integer "5" alone', () => {
  expect(padOnBlur('5', 2, 'whenHasDecimal')).toBe('5');
});

test('padOnBlur: whenHasDecimal pads "5.1" to "5.10"', () => {
  expect(padOnBlur('5.1', 2, 'whenHasDecimal')).toBe('5.10');
});

test('padOnBlur: whenHasDecimal strips dangling dot ("5." -> "5")', () => {
  expect(padOnBlur('5.', 2, 'whenHasDecimal')).toBe('5');
});

test('padOnBlur: always pads dangling dot ("5." -> "5.00")', () => {
  expect(padOnBlur('5.', 2, 'always')).toBe('5.00');
});
