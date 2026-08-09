import { useSyncExternalStore } from 'react';

/**
 * Responsive breakpoints — values aligned with antd v6
 * (`xs <576 / sm ≥576 / md ≥768 / lg ≥992 / xl ≥1200 / xxl ≥1600`).
 *
 * CSS custom properties cannot be referenced from @media queries, so
 * breakpoints live as JS constants only; component CSS keeps its own
 * hardcoded media queries where needed.
 */
export type TaoBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type TaoBreakpointMap<T = boolean> = Partial<Record<TaoBreakpoint, T>>;

/**
 * A prop value that can vary per breakpoint: either a plain `T` or a
 * breakpoint map like `{ xs: 'vertical', md: 'horizontal' }`.
 */
export type TaoResponsiveValue<T> = T | TaoBreakpointMap<T>;

/** Largest-first order used when resolving responsive values. */
const BREAKPOINTS_DESC: TaoBreakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];

/** `xs` is the only max-width query (phones); all others are min-width. */
const BREAKPOINT_QUERIES: Record<TaoBreakpoint, string> = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)',
};

const EMPTY_SCREENS: TaoBreakpointMap = {};

// ---- Shared matchMedia observer ----
// Singleton so N `useBreakpoint()` consumers share one set of MediaQueryList
// listeners (same pattern as antd's responsiveObserver). Torn down when the
// last subscriber unmounts, which also keeps tests free of cross-file state.

let mqls: Record<TaoBreakpoint, MediaQueryList> | null = null;
let cachedScreens: TaoBreakpointMap = EMPTY_SCREENS;
const listeners = new Set<() => void>();

function readScreens(
  current: Record<TaoBreakpoint, MediaQueryList>,
): TaoBreakpointMap {
  const next: TaoBreakpointMap = {};
  for (const bp of BREAKPOINTS_DESC) {
    next[bp] = current[bp].matches;
  }
  return next;
}

function sameScreens(a: TaoBreakpointMap, b: TaoBreakpointMap): boolean {
  return BREAKPOINTS_DESC.every((bp) => a[bp] === b[bp]);
}

function handleChange() {
  if (!mqls) return;
  const next = readScreens(mqls);
  if (!sameScreens(next, cachedScreens)) {
    cachedScreens = next;
    for (const listener of listeners) listener();
  }
}

function ensureObserver() {
  if (mqls || typeof window === 'undefined') return;
  const registered = {} as Record<TaoBreakpoint, MediaQueryList>;
  for (const bp of BREAKPOINTS_DESC) {
    const mql = window.matchMedia(BREAKPOINT_QUERIES[bp]);
    mql.addEventListener('change', handleChange);
    registered[bp] = mql;
  }
  mqls = registered;
  cachedScreens = readScreens(registered);
}

function teardownObserver() {
  if (!mqls) return;
  for (const bp of BREAKPOINTS_DESC) {
    mqls[bp].removeEventListener('change', handleChange);
  }
  mqls = null;
  cachedScreens = EMPTY_SCREENS;
}

function subscribe(listener: () => void): () => void {
  ensureObserver();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) teardownObserver();
  };
}

function getSnapshot(): TaoBreakpointMap {
  return cachedScreens;
}

function getServerSnapshot(): TaoBreakpointMap {
  return EMPTY_SCREENS;
}

/**
 * Current breakpoint matches, e.g. `{ sm: true, md: true }` at 800px.
 *
 * SSR and the first client render return `{}` so hydration markup stays
 * desktop-first and identical to the server; real matches apply after mount.
 */
export function useBreakpoint(): TaoBreakpointMap {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** True below the `sm` breakpoint (< 576px, i.e. phones). */
export function useIsMobile(): boolean {
  return useBreakpoint().xs === true;
}

/**
 * Resolve a possibly-responsive value against current breakpoint matches:
 * the largest matching breakpoint with a defined value wins; a plain value
 * passes through untouched. Returns `undefined` when a map has no usable
 * entry — callers fall back to their own default.
 */
export function resolveResponsiveValue<T>(
  value: TaoResponsiveValue<T>,
  screens: TaoBreakpointMap,
): T | undefined {
  if (typeof value !== 'object' || value === null) return value;
  const map = value as TaoBreakpointMap<T>;
  for (const bp of BREAKPOINTS_DESC) {
    if (screens[bp] && map[bp] !== undefined) return map[bp];
  }
  return undefined;
}
