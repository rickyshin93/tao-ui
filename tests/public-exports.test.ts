import { expect, test } from '@rstest/core';
import * as metadataExports from '../src/docs';
import * as publicExports from '../src/index';
import * as tokenExports from '../src/theme/tokens';

test('package root excludes internal and metadata seams', () => {
  expect('TaoPortalScope' in publicExports).toBe(false);
  expect('ChevronsUpDownIcon' in publicExports).toBe(false);
  expect('componentDocs' in publicExports).toBe(false);
  expect('tokenVar' in publicExports).toBe(false);
});

test('metadata and token helpers remain available through dedicated subpaths', () => {
  expect(metadataExports.componentDocs.length).toBeGreaterThan(0);
  expect(tokenExports.tokenVar('--tao-color-primary')).toBe(
    'var(--tao-color-primary)',
  );
});
