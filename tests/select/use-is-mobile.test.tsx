import { afterEach, expect, test } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { useIsMobile } from '../../src/components/select/use-is-mobile';

const originalMatchMedia = window.matchMedia;

function setViewportMatch(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => true,
      }) as MediaQueryList,
  });
}

function Probe() {
  return <span>{useIsMobile() ? 'mobile' : 'desktop'}</span>;
}

afterEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: originalMatchMedia,
  });
});

test('keeps the server and first client render on the desktop branch', () => {
  setViewportMatch(true);
  expect(renderToString(<Probe />)).toContain('desktop');
});

test('applies the media query after hydration', async () => {
  setViewportMatch(true);
  render(<Probe />);
  await waitFor(() => expect(screen.getByText('mobile')).toBeTruthy());
});
