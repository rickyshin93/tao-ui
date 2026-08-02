import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@rstest/core';

function componentCssFiles(): string[] {
  return readdirSync('src/components', { withFileTypes: true }).flatMap(
    (entry) => {
      if (!entry.isDirectory()) return [];
      const directory = join('src/components', entry.name);
      return readdirSync(directory)
        .filter((file) => file.endsWith('.css'))
        .map((file) => join(directory, file));
    },
  );
}

test('theme respects reduced-motion preference through the motion seed', () => {
  const css = readFileSync('src/theme/theme.css', 'utf8');
  expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  expect(css).toContain('--tao-motion-unit: 0s !important;');
});

test('readable tertiary text and spinners derive from motion tokens', () => {
  const theme = readFileSync('src/theme/theme.css', 'utf8');
  expect(theme).toContain('var(--tao-color-text-base) 55%');

  const fixedSpinnerAnimations = componentCssFiles().filter((file) =>
    /animation:[^;]+0\.8s/.test(readFileSync(file, 'utf8')),
  );
  expect(fixedSpinnerAnimations).toEqual([]);
});

test('component transitions enumerate properties instead of using all', () => {
  const offenders = componentCssFiles().filter((file) =>
    readFileSync(file, 'utf8').includes('transition: all'),
  );
  expect(offenders).toEqual([]);
});

test('side drawers cannot exceed the viewport width', () => {
  const css = readFileSync('src/components/drawer/drawer.css', 'utf8');
  expect(css).toContain('max-width: 100vw;');
});

test('tabs animate the indicator with compositor transforms', () => {
  const css = readFileSync('src/components/tabs/tabs.css', 'utf8');
  const source = readFileSync('src/components/tabs/tabs.tsx', 'utf8');
  expect(css).not.toContain('left var(--tao-motion-duration-mid)');
  expect(css).not.toContain('width var(--tao-motion-duration-mid)');
  expect(css).toContain('transition: transform');
  const transformExpression =
    'translateX($' + '{inkStyle.left}px) scaleX($' + '{inkStyle.width})';
  expect(source).toContain(transformExpression);
});
