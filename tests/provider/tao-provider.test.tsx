import { readFileSync } from 'node:fs';
import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { type CSSProperties, useEffect, useRef } from 'react';
import {
  TaoPortalScope,
  TaoProvider,
  useTaoConfig,
} from '../../src/provider/tao-provider';

test('renders children', () => {
  render(<TaoProvider>hello</TaoProvider>);
  expect(screen.getByText('hello')).toBeTruthy();
});

test('theme.token.colorPrimary sets --tao-color-primary CSS variable', () => {
  render(
    <TaoProvider theme={{ token: { colorPrimary: 'oklch(0.5 0.2 260)' } }}>
      <span data-testid="child">x</span>
    </TaoProvider>,
  );
  const provider = screen.getByTestId('child').parentElement!;
  expect(provider.style.getPropertyValue('--tao-color-primary')).toBe(
    'oklch(0.5 0.2 260)',
  );
});

/**
 * Extract the SET of custom-property names DECLARED (not merely referenced)
 * inside a given CSS rule body. A declaration is a line whose first non-
 * whitespace token matches `--name:`; a `var(--name)` reference doesn't
 * count.
 */
function declaredCustomProps(cssBody: string): Set<string> {
  const out = new Set<string>();
  for (const rawLine of cssBody.split('\n')) {
    const m = rawLine.match(/^\s*(--[\w-]+)\s*:/);
    if (m) out.add(m[1]);
  }
  return out;
}

// Seeds must live at :root ONLY — re-declaring a seed at [data-tao-provider]
// would reset every un-overridden provider back to defaults, silently killing
// the nested "child inherits parent's overrides" contract.
test('seed tokens are declared at :root only, not at [data-tao-provider]', () => {
  const css = readFileSync('src/theme/theme.css', 'utf8');
  const SEEDS = [
    '--tao-color-primary',
    '--tao-color-success',
    '--tao-color-warning',
    '--tao-color-error',
    '--tao-color-bg-base',
    '--tao-color-text-base',
    '--tao-radius',
    '--tao-font-size',
    '--tao-control-height',
    '--tao-size-unit',
    '--tao-line-width',
    '--tao-ring-width',
    '--tao-font-family',
    '--tao-motion-unit',
  ];
  const providerBlockMatch = css.match(
    /:root,\s*\n\s*\[data-tao-provider\]\s*\{([\s\S]*?)^\s*\}/m,
  );
  expect(providerBlockMatch).toBeTruthy();
  const declared = declaredCustomProps(providerBlockMatch![1]);
  for (const seed of SEEDS) {
    expect(declared.has(seed)).toBe(false);
  }
});

// Regression for the "derived tokens frozen at :root" bug: overriding
// --tao-color-primary on a middle provider must re-derive --tao-primary at
// that scope, otherwise Button/Tag/Input never respond to theme.token.
// happy-dom doesn't compute var()/color-mix() — the actual cascade is
// verified end-to-end in a headless-Chrome smoke below.  Here we assert
// the CSS shape that MAKES the cascade possible.
test('derived tokens are declared under [data-tao-provider] (cascade shape)', () => {
  const css = readFileSync('src/theme/theme.css', 'utf8');
  const providerBlockMatch = css.match(
    /:root,\s*\n\s*\[data-tao-provider\]\s*\{([\s\S]*?)^\s*\}/m,
  );
  expect(providerBlockMatch).toBeTruthy();
  const declared = declaredCustomProps(providerBlockMatch![1]);
  const DERIVED_MUST_INCLUDE = [
    '--tao-primary',
    '--tao-primary-hover',
    '--tao-primary-bg',
    '--tao-primary-fg',
    '--tao-error',
    '--tao-success',
    '--tao-warning',
    '--tao-color-text',
    '--tao-color-fill',
    '--tao-color-border',
    '--tao-radius-md',
    '--tao-control-outline',
  ];
  for (const key of DERIVED_MUST_INCLUDE) {
    expect(declared.has(key)).toBe(true);
  }
});

test('theme.token.borderRadius sets --tao-radius CSS variable', () => {
  render(
    <TaoProvider theme={{ token: { borderRadius: 8 } }}>
      <span data-testid="child">x</span>
    </TaoProvider>,
  );
  const provider = screen.getByTestId('child').parentElement!;
  expect(provider.style.getPropertyValue('--tao-radius')).toBe('8px');
});

test('size prop is accessible via useTaoConfig', () => {
  function ShowSize() {
    const { size } = useTaoConfig();
    return <span data-testid="size">{size}</span>;
  }
  render(
    <TaoProvider size="small">
      <ShowSize />
    </TaoProvider>,
  );
  expect(screen.getByTestId('size').textContent).toBe('small');
});

test('disabled prop is accessible via useTaoConfig', () => {
  function ShowDisabled() {
    const { disabled } = useTaoConfig();
    return <span data-testid="d">{String(disabled)}</span>;
  }
  render(
    <TaoProvider disabled>
      <ShowDisabled />
    </TaoProvider>,
  );
  expect(screen.getByTestId('d').textContent).toBe('true');
});

test('variant prop is accessible via useTaoConfig', () => {
  function ShowVariant() {
    const { variant } = useTaoConfig();
    return <span data-testid="v">{variant}</span>;
  }
  render(
    <TaoProvider variant="filled">
      <ShowVariant />
    </TaoProvider>,
  );
  expect(screen.getByTestId('v').textContent).toBe('filled');
});

test('nested provider: child overrides parent size', () => {
  function ShowSize() {
    const { size } = useTaoConfig();
    return <span data-testid="size">{size}</span>;
  }
  render(
    <TaoProvider size="large">
      <TaoProvider size="small">
        <ShowSize />
      </TaoProvider>
    </TaoProvider>,
  );
  expect(screen.getByTestId('size').textContent).toBe('small');
});

test('nested provider: child inherits parent when not specified', () => {
  function ShowSize() {
    const { size } = useTaoConfig();
    return <span data-testid="size">{size}</span>;
  }
  render(
    <TaoProvider size="large">
      <TaoProvider disabled>
        <ShowSize />
      </TaoProvider>
    </TaoProvider>,
  );
  expect(screen.getByTestId('size').textContent).toBe('large');
});

// Bug A regression: Provider must not collapse children into one grid/flex item.
// Without display:contents, both spans would land in the same grid cell.
test('provider wrapper is layout-transparent (display: contents)', () => {
  render(
    <TaoProvider theme={{ token: { colorPrimary: 'red' } }}>
      <span data-testid="a">A</span>
    </TaoProvider>,
  );
  const provider = screen.getByTestId('a').parentElement!;
  expect(provider.getAttribute('data-tao-provider')).toBe('');
  expect(provider.style.display).toBe('contents');
});

test('portal scope wrapper is layout-transparent (display: contents)', () => {
  render(
    <TaoProvider theme={{ token: { colorPrimary: 'red' } }}>
      <TaoPortalScope>
        <span data-testid="portal-child">A</span>
      </TaoPortalScope>
    </TaoProvider>,
  );
  const portalScope = screen.getByTestId('portal-child').parentElement!;
  expect(portalScope.getAttribute('data-tao-provider')).toBe('');
  expect(portalScope.style.display).toBe('contents');
  expect(portalScope.style.getPropertyValue('--tao-color-primary')).toBe('red');
});

// asChild: merge tokens onto the immediate child (no wrapper div). Used inside
// non-Presence-gated portals (Select) to avoid ghost <div data-tao-provider>
// in the body for every mounted-but-closed instance.
test('portal scope asChild merges tokens onto child (no wrapper)', () => {
  render(
    <TaoProvider theme={{ token: { colorPrimary: 'red' } }}>
      <TaoPortalScope asChild>
        <span data-testid="portal-child">A</span>
      </TaoPortalScope>
    </TaoProvider>,
  );
  const child = screen.getByTestId('portal-child');
  expect(child.tagName).toBe('SPAN');
  expect(child.getAttribute('data-tao-provider')).toBe('');
  expect(child.style.getPropertyValue('--tao-color-primary')).toBe('red');
  // no extra wrapper: parent is the TaoProvider div, not another portal scope
  expect(child.parentElement!.getAttribute('data-tao-provider')).toBe('');
  expect(child.parentElement!.style.display).toBe('contents');
});

test('portal scope asChild preserves child style (child wins on conflict)', () => {
  render(
    <TaoProvider theme={{ token: { colorPrimary: 'red' } }}>
      <TaoPortalScope asChild>
        <span
          data-testid="portal-child"
          style={
            { color: 'blue', '--tao-color-primary': 'green' } as CSSProperties
          }
        >
          A
        </span>
      </TaoPortalScope>
    </TaoProvider>,
  );
  const child = screen.getByTestId('portal-child');
  // child's own style wins; slot's token vars still flow through for unset keys
  expect(child.style.color).toBe('blue');
  expect(child.style.getPropertyValue('--tao-color-primary')).toBe('green');
});

// Bug C regression: inline `theme={{token:{...}}}` is a fresh object each
// render — the provider must debounce by value so `useTaoConfig()` consumers
// don't rerender on every parent render.
test('theme.token value-equality: same values → stable context value', () => {
  const renderLog: object[] = [];
  function Probe() {
    const cfg = useTaoConfig();
    const seenRef = useRef<object | null>(null);
    useEffect(() => {
      if (seenRef.current !== cfg) {
        seenRef.current = cfg;
        renderLog.push(cfg);
      }
    });
    return null;
  }

  function App({ tick }: { tick: number }) {
    // Fresh object literal every render — the memo must collapse it by value.
    return (
      <TaoProvider theme={{ token: { colorPrimary: 'oklch(0.5 0.2 260)' } }}>
        <Probe />
        <span data-testid="tick">{tick}</span>
      </TaoProvider>
    );
  }

  const { rerender } = render(<App tick={0} />);
  rerender(<App tick={1} />);
  rerender(<App tick={2} />);

  // Only the initial context should be recorded; later renders keep the same reference.
  expect(renderLog.length).toBe(1);
});
