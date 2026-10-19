/**
 * Shared viewport mock for responsive tests: replaces window.matchMedia with
 * a width-driven implementation that understands the `(min|max)-width: Npx`
 * queries used by src/utils/breakpoint.ts.
 *
 * The breakpoint observer is a singleton that tears down when the last
 * subscriber unmounts, so after testing-library's per-test cleanup each test
 * re-registers against the freshly mocked matchMedia.
 */

const originalMatchMedia = window.matchMedia;

export function setViewportWidth(width: number) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string): MediaQueryList => {
      const min = /\(min-width:\s*(\d+)px\)/.exec(query);
      const max = /\(max-width:\s*(\d+)px\)/.exec(query);
      const matches =
        (min ? width >= Number(min[1]) : true) &&
        (max ? width <= Number(max[1]) : true);
      return {
        matches,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => true,
      } as MediaQueryList;
    },
  });
}

export function restoreViewport() {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: originalMatchMedia,
  });
}
