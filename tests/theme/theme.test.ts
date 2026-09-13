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

// ---- Token contracts ----

/** First capture group of every match. */
function matches(source: string, pattern: RegExp): string[] {
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

/** Names declared as `--tao-*` custom properties. */
function declaredTokens(css: string): Set<string> {
  return new Set(matches(css, /(--tao-[a-z0-9-]+)\s*:/g));
}

/**
 * Drop `selector { ... }` rules from a stylesheet, brace-matched. A selector
 * that only appears inside a comment is not a rule and is skipped.
 */
function stripRule(css: string, selector: string): string {
  let result = css;
  let index = result.indexOf(selector);

  while (index !== -1) {
    if (!/^\s*\{/.test(result.slice(index + selector.length))) {
      index = result.indexOf(selector, index + selector.length);
      continue;
    }

    let depth = 0;
    let end = result.indexOf('{', index);
    for (; end < result.length; end += 1) {
      if (result[end] === '{') depth += 1;
      else if (result[end] === '}') {
        depth -= 1;
        if (depth === 0) break;
      }
    }

    result = result.slice(0, index) + result.slice(end + 1);
    index = result.indexOf(selector);
  }

  return result;
}

/** Concatenate every file with the given extension under `directory`. */
function readByExtension(directory: string, extension: string): string {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return readByExtension(path, extension);
      return entry.name.endsWith(extension) ? [readFileSync(path, 'utf8')] : [];
    })
    .join('\n');
}

function styleDirectories(): string[] {
  return ['src/components', 'src/layouts'].flatMap((root) =>
    readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(root, entry.name)),
  );
}

/**
 * A custom property declared only inside a scoped override (compact density,
 * dark mode) is undefined in the default theme. Any `calc()` referencing it
 * becomes invalid at computed-value time and the whole declaration is dropped,
 * which is silent and layout-only — it cannot be caught by a unit test that
 * renders the component. `--tao-margin-*` shipped in exactly that state.
 */
test('scoped token blocks only override, never introduce, tokens', () => {
  const theme = readFileSync('src/theme/theme.css', 'utf8');
  const baseScope = stripRule(
    stripRule(theme, '[data-tao-density="compact"]'),
    '[data-tao-theme="dark"]',
  );
  const all = declaredTokens(theme);
  const base = declaredTokens(baseScope);

  expect([...all].filter((name) => !base.has(name))).toEqual([]);
});

test('component CSS only references tokens that resolve in the default theme', () => {
  const theme = readFileSync('src/theme/theme.css', 'utf8');
  const baseScope = stripRule(
    stripRule(theme, '[data-tao-density="compact"]'),
    '[data-tao-theme="dark"]',
  );
  const available = new Set([
    ...declaredTokens(baseScope),
    ...declaredTokens(readFileSync('src/theme/control.css', 'utf8')),
  ]);

  const offenders: string[] = [];

  for (const directory of styleDirectories()) {
    const css = readByExtension(directory, '.css');
    const tsx = readByExtension(directory, '.tsx');
    // A component may set its own custom properties at runtime through an
    // inline style, which no stylesheet can reveal.
    const resolvable = new Set([
      ...available,
      ...declaredTokens(css),
      ...matches(tsx, /['"](--tao-[a-z0-9-]+)['"]/g),
    ]);

    // Only references WITHOUT a fallback are fatal — `var(--x, 1px)` still
    // resolves when --x is missing.
    for (const reference of matches(css, /var\(\s*(--tao-[a-z0-9-]+)\s*\)/g)) {
      if (!resolvable.has(reference)) {
        offenders.push(`${directory}: ${reference}`);
      }
    }
  }

  expect(offenders).toEqual([]);
});

test('taoTokenNames mirrors the tokens declared in theme.css', () => {
  const fromCss = [
    ...declaredTokens(readFileSync('src/theme/theme.css', 'utf8')),
  ].sort();
  const fromTs = [
    ...new Set(
      matches(readFileSync('src/theme/tokens.ts', 'utf8'), /'(--tao-[a-z0-9-]+)'/g),
    ),
  ].sort();

  expect(fromTs).toEqual(fromCss);
});
