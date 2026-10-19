import { afterEach, expect, test } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { useIsMobile } from '../../src/utils/breakpoint';
import { restoreViewport, setViewportWidth } from './mock-viewport';

afterEach(() => {
  restoreViewport();
});

function Probe() {
  return <span>{useIsMobile() ? 'mobile' : 'desktop'}</span>;
}

test('keeps the server and first client render on the desktop branch', () => {
  setViewportWidth(400);
  expect(renderToString(<Probe />)).toContain('desktop');
});

test('applies the breakpoint match after hydration', async () => {
  setViewportWidth(400);
  render(<Probe />);
  await waitFor(() => expect(screen.getByText('mobile')).toBeTruthy());
});
