import { expect, test } from '@rstest/core';
import {
  countAnchored,
  findCursorAt,
  isThousandSepBeforeCursor,
  reposition,
} from '../../src/number-input/cursor';

test('countAnchored: at start is 0', () => {
  expect(countAnchored('1,234', 0, ',')).toBe(0);
});

test('countAnchored: after first digit', () => {
  expect(countAnchored('1,234', 1, ',')).toBe(1);
});

test('countAnchored: thousand sep does not count', () => {
  expect(countAnchored('1,234', 2, ',')).toBe(1);
});

test('countAnchored: after second digit', () => {
  expect(countAnchored('1,234', 3, ',')).toBe(2);
});

test('countAnchored: end of string', () => {
  expect(countAnchored('1,234', 5, ',')).toBe(4);
});

test('findCursorAt: 1 token in "1,234" → position 1', () => {
  expect(findCursorAt('1,234', 1, ',')).toBe(1);
});

test('findCursorAt: 2 tokens in "1,234" → position 3 (skipped sep)', () => {
  expect(findCursorAt('1,234', 2, ',')).toBe(3);
});

test('findCursorAt: 4 tokens in "1,234" → position 5', () => {
  expect(findCursorAt('1,234', 4, ',')).toBe(5);
});

test('reposition: typing 1 prepended ("234" → "1,234")', () => {
  expect(
    reposition({
      before: '234',
      beforeCursor: 1,
      after: '1,234',
      thousandsSeparator: ',',
    }),
  ).toBe(3);
});

test('reposition: typing trailing digit causes thousand sep insert ("1234" → "1,234")', () => {
  expect(
    reposition({
      before: '1234',
      beforeCursor: 4,
      after: '1,234',
      thousandsSeparator: ',',
    }),
  ).toBe(5);
});

test('reposition: deleting digit removes thousand sep ("1,234" → "234")', () => {
  expect(
    reposition({
      before: '1,234',
      beforeCursor: 5,
      after: '234',
      thousandsSeparator: ',',
    }),
  ).toBe(3);
});

test('isThousandSepBeforeCursor: yes when char before is sep', () => {
  expect(isThousandSepBeforeCursor('1,234', 2, ',')).toBe(true);
});

test('isThousandSepBeforeCursor: no when char before is digit', () => {
  expect(isThousandSepBeforeCursor('1,234', 3, ',')).toBe(false);
});

test('isThousandSepBeforeCursor: no at position 0', () => {
  expect(isThousandSepBeforeCursor('1,234', 0, ',')).toBe(false);
});
