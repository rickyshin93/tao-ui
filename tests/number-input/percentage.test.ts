import { expect, test } from '@rstest/core';
import {
  fromPercent,
  shiftDecimal,
  toPercent,
} from '../../src/number-input/percentage';

test('shiftDecimal: zero shift is identity', () => {
  expect(shiftDecimal('5', 0)).toBe('5');
});

test('shiftDecimal: shift left by 2 ("50" -> "0.5")', () => {
  expect(shiftDecimal('50', -2)).toBe('0.5');
});

test('shiftDecimal: shift left by 2 ("0.5" -> "0.005")', () => {
  expect(shiftDecimal('0.5', -2)).toBe('0.005');
});

test('shiftDecimal: shift right by 2 ("5" -> "500")', () => {
  expect(shiftDecimal('5', 2)).toBe('500');
});

test('shiftDecimal: shift right by 2 ("1.234" -> "123.4")', () => {
  expect(shiftDecimal('1.234', 2)).toBe('123.4');
});

test('shiftDecimal: negative number ("-50" shift -2 -> "-0.5")', () => {
  expect(shiftDecimal('-50', -2)).toBe('-0.5');
});

test('shiftDecimal: empty string is identity', () => {
  expect(shiftDecimal('', -2)).toBe('');
  expect(shiftDecimal('', 2)).toBe('');
});

test('shiftDecimal: lone minus is identity', () => {
  expect(shiftDecimal('-', -2)).toBe('-');
  expect(shiftDecimal('-', 2)).toBe('-');
});

test('shiftDecimal: zero is identity', () => {
  expect(shiftDecimal('0', -2)).toBe('0');
  expect(shiftDecimal('0', 2)).toBe('0');
});

test('round-trip: fromPercent(toPercent(x)) === x', () => {
  for (const x of ['0', '0.5', '1', '-1.234', '0.001']) {
    expect(fromPercent(toPercent(x))).toBe(x);
  }
});
