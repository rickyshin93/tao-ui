import { expect, test } from '@rstest/core';
import * as metadataExports from '../src/docs';
import * as publicExports from '../src/index';
import * as tokenExports from '../src/theme/tokens';
import * as localeExports from '../src/locales';
import * as providerExports from '../src/entries/provider';

test('all built-in locale packs are available from the root and provider entries', () => {
  expect(Object.keys(localeExports)).toHaveLength(17);
  const rootPacks = new Map(Object.entries(publicExports));
  const providerPacks = new Map(Object.entries(providerExports));
  for (const [name, locale] of Object.entries(localeExports)) {
    expect(rootPacks.get(name)).toBe(locale);
    expect(providerPacks.get(name)).toBe(locale);
  }
});

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

test('metadata registry contains every documented component', () => {
  expect(metadataExports.componentDocs).toHaveLength(73);
  for (const component of metadataExports.componentDocs) {
    for (const exportedName of component.exports) {
      expect(exportedName in publicExports).toBe(true);
    }
  }
  for (const name of [
    'alert',
    'form',
    'popconfirm',
    'popover',
    'tooltip',
    'app',
    'upload',
    'tree',
    'time-picker',
    'border-beam',
  ]) {
    expect(metadataExports.getComponentDoc(name)?.name).toBe(name);
  }
});
