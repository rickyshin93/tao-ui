import { afterEach, expect, test } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import {
  resolveResponsiveValue,
  useBreakpoint,
  useIsMobile,
} from '../../src/utils/breakpoint';
import { restoreViewport, setViewportWidth } from './mock-viewport';

afterEach(() => {
  restoreViewport();
});

function BreakpointProbe() {
  const screens = useBreakpoint();
  const active = Object.entries(screens)
    .filter(([, matched]) => matched)
    .map(([bp]) => bp)
    .join(',');
  return <span>{active || 'none'}</span>;
}

function MobileProbe() {
  return <span>{useIsMobile() ? 'mobile' : 'desktop'}</span>;
}

// ---- useBreakpoint ----

test('keeps SSR / first render empty (desktop-first hydration)', () => {
  setViewportWidth(400);
  expect(renderToString(<BreakpointProbe />)).toContain('none');
});

test('matches only xs on phone widths', async () => {
  setViewportWidth(400);
  render(<BreakpointProbe />);
  await waitFor(() => expect(screen.getByText('xs')).toBeTruthy());
});

test('matches sm/md/lg at 1024px', async () => {
  setViewportWidth(1024);
  render(<BreakpointProbe />);
  await waitFor(() => expect(screen.getByText('lg,md,sm')).toBeTruthy());
});

test('matches everything at wide widths', async () => {
  setViewportWidth(1920);
  render(<BreakpointProbe />);
  await waitFor(() =>
    expect(screen.getByText('xxxl,xxl,xl,lg,md,sm')).toBeTruthy(),
  );
});

test('xxxl starts at 1920px and takes precedence over xxl', async () => {
  setViewportWidth(1919);
  const { unmount } = render(<BreakpointProbe />);
  expect(screen.getByText('xxl,xl,lg,md,sm')).toBeTruthy();
  unmount();
  setViewportWidth(1920);
  render(<BreakpointProbe />);
  await waitFor(() =>
    expect(screen.getByText('xxxl,xxl,xl,lg,md,sm')).toBeTruthy(),
  );
  expect(
    resolveResponsiveValue({ xxl: 3, xxxl: 4 }, { xxl: true, xxxl: true }),
  ).toBe(4);
});

// ---- useIsMobile ----

test('useIsMobile is true below the sm breakpoint', async () => {
  setViewportWidth(575);
  render(<MobileProbe />);
  await waitFor(() => expect(screen.getByText('mobile')).toBeTruthy());
});

test('useIsMobile is false at the sm breakpoint and above', async () => {
  setViewportWidth(576);
  render(<MobileProbe />);
  await waitFor(() => expect(screen.getByText('desktop')).toBeTruthy());
});

// ---- resolveResponsiveValue ----

test('passes plain values through untouched', () => {
  expect(resolveResponsiveValue('horizontal', {})).toBe('horizontal');
  expect(resolveResponsiveValue(520, { xs: true })).toBe(520);
});

test('picks the largest matching breakpoint with a value', () => {
  const value = { xs: 'vertical', md: 'horizontal' } as const;
  expect(resolveResponsiveValue(value, { xs: true })).toBe('vertical');
  expect(resolveResponsiveValue(value, { sm: true, md: true })).toBe(
    'horizontal',
  );
  // screens are cumulative: a value set at md still applies at xl when
  // larger breakpoints define no entry of their own
  expect(
    resolveResponsiveValue(value, { sm: true, md: true, lg: true, xl: true }),
  ).toBe('horizontal');
});

test('returns undefined when no entry matches', () => {
  // xs does not match at md+ widths (xs is the max-width query)
  expect(resolveResponsiveValue({ xs: 'vertical' }, { md: true })).toBe(
    undefined,
  );
  expect(resolveResponsiveValue({ md: 640 }, { xs: true })).toBeUndefined();
});
