import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { ScrollArea } from '../../src/components/scroll-area/scroll-area';

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
  }
  observe() {}
  disconnect() {}
  unobserve() {}
}
(globalThis as any).ResizeObserver = MockResizeObserver;

test('renders children', () => {
  render(
    <ScrollArea maxHeight={100}>
      <p>Hello scroll</p>
    </ScrollArea>,
  );
  expect(screen.getByText('Hello scroll')).toBeTruthy();
});

test('applies maxHeight to root', () => {
  const { container } = render(
    <ScrollArea maxHeight={200}>
      <p>Content</p>
    </ScrollArea>,
  );
  const root = container.querySelector('[data-tao-scroll-area]') as HTMLElement;
  expect(root.style.maxHeight).toBe('200px');
});

test('applies maxWidth to root', () => {
  const { container } = render(
    <ScrollArea maxWidth={300} direction="horizontal">
      <p>Content</p>
    </ScrollArea>,
  );
  const root = container.querySelector('[data-tao-scroll-area]') as HTMLElement;
  expect(root.style.maxWidth).toBe('300px');
});

test('type sets data attribute', () => {
  const { container } = render(
    <ScrollArea type="always">
      <p>Content</p>
    </ScrollArea>,
  );
  const area = container.querySelector('[data-tao-scroll-area]') as HTMLElement;
  expect(area.dataset.taoScrollType).toBe('always');
});

test('default type is hover', () => {
  const { container } = render(
    <ScrollArea>
      <p>Content</p>
    </ScrollArea>,
  );
  const area = container.querySelector('[data-tao-scroll-area]') as HTMLElement;
  expect(area.dataset.taoScrollType).toBe('hover');
});

test('scrollShadow renders shadow elements', () => {
  const { container } = render(
    <ScrollArea scrollShadow maxHeight={100}>
      <p>Content</p>
    </ScrollArea>,
  );
  expect(
    container.querySelector('[data-tao-scroll-shadow="top"]'),
  ).toBeTruthy();
  expect(
    container.querySelector('[data-tao-scroll-shadow="bottom"]'),
  ).toBeTruthy();
});

test('horizontal direction sets overflowX', () => {
  const { container } = render(
    <ScrollArea direction="horizontal">
      <p>Content</p>
    </ScrollArea>,
  );
  const viewport = container.querySelector(
    '[data-tao-scroll-viewport]',
  ) as HTMLElement;
  expect(viewport.style.overflowX).toBe('scroll');
  expect(viewport.style.overflowY).toBe('hidden');
});

test('both direction sets both overflows', () => {
  const { container } = render(
    <ScrollArea direction="both">
      <p>Content</p>
    </ScrollArea>,
  );
  const viewport = container.querySelector(
    '[data-tao-scroll-viewport]',
  ) as HTMLElement;
  expect(viewport.style.overflowX).toBe('scroll');
  expect(viewport.style.overflowY).toBe('scroll');
});

test('classNames applied to root', () => {
  const { container } = render(
    <ScrollArea classNames={{ root: 'my-scroll' }}>
      <p>Content</p>
    </ScrollArea>,
  );
  const area = container.querySelector('[data-tao-scroll-area]') as HTMLElement;
  expect(area.className).toContain('my-scroll');
});

test('classNames applied to viewport', () => {
  const { container } = render(
    <ScrollArea classNames={{ viewport: 'my-vp' }}>
      <p>Content</p>
    </ScrollArea>,
  );
  const vp = container.querySelector(
    '[data-tao-scroll-viewport]',
  ) as HTMLElement;
  expect(vp.className).toContain('my-vp');
});

test('custom scrollbarSize via CSS variable', () => {
  const { container } = render(
    <ScrollArea scrollbarSize={10}>
      <p>Content</p>
    </ScrollArea>,
  );
  const area = container.querySelector('[data-tao-scroll-area]') as HTMLElement;
  expect(area.style.getPropertyValue('--tao-scrollbar-size')).toBe('10px');
});
