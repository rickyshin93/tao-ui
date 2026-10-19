import { expect, test } from '@rstest/core';
import {
  buildSelectIndex,
  countLeafOptions,
  flattenLeafOptions,
} from '../../src/components/select/select-model';

test('select model helpers build only the requested representation', () => {
  const alpha = { label: 'Alpha', value: 'a' };
  const beta = { label: 'Beta', value: 'b' };
  const options = [{ label: 'Group', value: 'group', options: [alpha, beta] }];
  const index = buildSelectIndex(options);

  expect(flattenLeafOptions(options)).toEqual([alpha, beta]);
  expect(countLeafOptions(options)).toBe(2);
  expect(index.optionByValue.get('b')).toBe(beta);
  expect(index.optionByToken.get('Alpha')).toBe(alpha);
});

test('buildSelectIndex preserves first-match lookup semantics', () => {
  const first = { label: 'shared', value: 'first' };
  const duplicateValue = { label: 'Duplicate', value: 'first' };
  const matchingValue = { label: 'Last', value: 'shared' };
  const index = buildSelectIndex([first, duplicateValue, matchingValue]);

  expect(index.optionByValue.get('first')).toBe(first);
  expect(index.optionByToken.get('shared')).toBe(first);
});
