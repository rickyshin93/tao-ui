import { expect, test } from '@rstest/core';
import {
  clampToRange,
  isValidCanonical,
  stripDisallowedSign,
} from '../../src/number-input/validate';

test('isValidCanonical: empty is valid', () => {
  expect(isValidCanonical('')).toBe(true);
});

test('isValidCanonical: zero is valid', () => {
  expect(isValidCanonical('0')).toBe(true);
});

test('isValidCanonical: negative decimal is valid', () => {
  expect(isValidCanonical('-1.5')).toBe(true);
});

test('isValidCanonical: dangling decimal is valid (typing intermediate)', () => {
  expect(isValidCanonical('5.')).toBe(true);
});

test('isValidCanonical: multiple dots invalid', () => {
  expect(isValidCanonical('1.2.3')).toBe(false);
});

test('isValidCanonical: letter invalid', () => {
  expect(isValidCanonical('a')).toBe(false);
});

test('stripDisallowedSign: drops minus when allowNegative=false', () => {
  expect(stripDisallowedSign('-5', false)).toBe('5');
});

test('stripDisallowedSign: keeps minus when allowNegative=true', () => {
  expect(stripDisallowedSign('-5', true)).toBe('-5');
});

test('clampToRange: in range no-op', () => {
  expect(clampToRange('5', 0, 10)).toBe('5');
});

test('clampToRange: above max', () => {
  expect(clampToRange('20', 0, 10)).toBe('10');
});

test('clampToRange: below min', () => {
  expect(clampToRange('-5', 0, 10)).toBe('0');
});

test('clampToRange: empty is empty (no clamp)', () => {
  expect(clampToRange('', 0, 10)).toBe('');
});

test('clampToRange: undefined bounds is no-op', () => {
  expect(clampToRange('5', undefined, undefined)).toBe('5');
});
