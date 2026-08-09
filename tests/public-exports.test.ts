import { expect, test } from '@rstest/core';
import * as metadataExports from '../src/docs';
import * as publicExports from '../src/index';
import * as tokenExports from '../src/theme/tokens';

test('package root excludes internal and metadata seams', () => {
  expect('TaoPortalScope' in publicExports).toBe(false);
  expect('ChevronsUpDownIcon' in publicExports).toBe(false);
  expect('componentDocs' in publicExports).toBe(false);
});

test('token helpers are available from both the root and the tokens subpath', () => {
  // Root re-exports (added with useTaoToken): same helpers, one import site.
  expect(publicExports.tokenVar('--tao-color-primary')).toBe(
    'var(--tao-color-primary)',
  );
  expect(publicExports.taoTokenNames.length).toBeGreaterThan(100);
  // Dedicated subpath remains intact.
  expect(metadataExports.componentDocs.length).toBeGreaterThan(0);
  expect(tokenExports.tokenVar('--tao-color-primary')).toBe(
    'var(--tao-color-primary)',
  );
});
