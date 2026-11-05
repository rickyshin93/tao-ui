import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
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
Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  value: MockResizeObserver,
});

function renderScrollableArea(axis: 'x' | 'y') {
  const view = render(
    <ScrollArea direction="both">
      <div>Content</div>
    </ScrollArea>,
  );
  const viewport = view.container.querySelector<HTMLDivElement>(
    '[data-tao-scroll-viewport]',
  )!;
  Object.defineProperties(viewport, {
    clientHeight: { configurable: true, value: 100 },
    clientWidth: { configurable: true, value: 100 },
    scrollHeight: { configurable: true, value: 1000 },
    scrollWidth: { configurable: true, value: 1000 },
  });
  const scrollKey = axis === 'y' ? 'scrollTop' : 'scrollLeft';
  let position = 0;
  const write = rstest.fn((next: number) => {
    position = next;
  });
  Object.defineProperty(viewport, scrollKey, {
    configurable: true,
    get: () => position,
    set: write,
  });
  fireEvent.scroll(viewport);
  const orientation = axis === 'y' ? 'vertical' : 'horizontal';
  const thumb = view.container.querySelector<HTMLDivElement>(
    `[data-tao-scroll-thumb][data-tao-orientation="${orientation}"]`,
  )!;
  const track = thumb.parentElement!;
  rstest
    .spyOn(track, 'getBoundingClientRect')
    .mockReturnValue(new DOMRect(0, 0, 80, 80));
  rstest
    .spyOn(thumb, 'getBoundingClientRect')
    .mockReturnValue(new DOMRect(0, 0, 20, 20));
  return { ...view, viewport, thumb, track, write, scrollKey };
}

test.each([
  'x',
  'y',
] as const)('cancelling a %s thumb drag stops scrolling and ignores other pointers', (axis) => {
  const { viewport, thumb, write, scrollKey } = renderScrollableArea(axis);
  try {
    fireEvent.pointerDown(thumb, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(document, { pointerId: 2, clientX: 10, clientY: 10 });
    expect(write).not.toHaveBeenCalled();
    fireEvent.pointerUp(document, { pointerId: 2 });
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 10, clientY: 10 });
    expect(write).toHaveBeenCalledTimes(1);
    const position = viewport[scrollKey];
    fireEvent.pointerCancel(document, { pointerId: 1 });
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 20, clientY: 20 });
    expect(viewport[scrollKey]).toBe(position);
    expect(write).toHaveBeenCalledTimes(1);
  } finally {
    fireEvent.pointerUp(document, { pointerId: 1 });
  }
});

test('repeated thumb drags replace listeners and unmount cleans up all drag listeners', () => {
  const add = rstest.spyOn(document, 'addEventListener');
  const remove = rstest.spyOn(document, 'removeEventListener');
  const { thumb, write, unmount } = renderScrollableArea('y');
  try {
    fireEvent.pointerDown(thumb, { pointerId: 1, clientY: 0 });
    fireEvent.pointerDown(thumb, { pointerId: 2, clientY: 0 });
    fireEvent.pointerMove(document, { pointerId: 2, clientY: 10 });
    expect(write).toHaveBeenCalledTimes(1);
    unmount();
    for (const [type, listener] of add.mock.calls) {
      if (
        type === 'pointermove' ||
        type === 'pointerup' ||
        type === 'pointercancel'
      ) {
        expect(remove).toHaveBeenCalledWith(type, listener);
      }
    }
  } finally {
    fireEvent.pointerUp(document, { pointerId: 1 });
    fireEvent.pointerUp(document, { pointerId: 2 });
    add.mockRestore();
    remove.mockRestore();
  }
});

test.each([
  'x',
  'y',
] as const)('%s thumb drag maps the actual track travel to the complete scroll range', (axis) => {
  const { viewport, thumb, scrollKey } = renderScrollableArea(axis);
  try {
    fireEvent.pointerDown(thumb, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 30, clientY: 30 });
    expect(viewport[scrollKey]).toBe(450);
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 60, clientY: 60 });
    expect(viewport[scrollKey]).toBe(900);
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 90, clientY: 90 });
    expect(viewport[scrollKey]).toBe(900);
    fireEvent.pointerMove(document, {
      pointerId: 1,
      clientX: -30,
      clientY: -30,
    });
    expect(viewport[scrollKey]).toBe(0);
  } finally {
    fireEvent.pointerUp(document, { pointerId: 1 });
  }
});

test.each([
  'x',
  'y',
] as const)('%s minimum-size thumb aligns its trailing edge at the scroll limit', (axis) => {
  const { viewport, thumb, scrollKey } = renderScrollableArea(axis);
  Object.defineProperty(
    viewport,
    axis === 'y' ? 'scrollHeight' : 'scrollWidth',
    { value: 10000 },
  );
  viewport[scrollKey] = 9900;
  fireEvent.scroll(viewport);
  expect(axis === 'y' ? thumb.style.height : thumb.style.width).toBe('10%');
  expect(axis === 'y' ? thumb.style.top : thumb.style.left).toBe('100%');
  expect(thumb.style.transform).toBe(
    axis === 'y' ? 'translateY(-100%)' : 'translateX(-100%)',
  );
  viewport[scrollKey] = 0;
  fireEvent.scroll(viewport);
  expect(axis === 'y' ? thumb.style.top : thumb.style.left).toBe('0%');
  expect(thumb.style.transform).toBe(
    axis === 'y' ? 'translateY(-0%)' : 'translateX(-0%)',
  );
});

test('a thumb with no available travel does not write an invalid scroll position', () => {
  const { thumb, write } = renderScrollableArea('y');
  rstest
    .mocked(thumb.getBoundingClientRect)
    .mockReturnValue(new DOMRect(0, 0, 80, 80));
  try {
    fireEvent.pointerDown(thumb, { pointerId: 1, clientY: 0 });
    fireEvent.pointerMove(document, { pointerId: 1, clientY: 10 });
    expect(write).not.toHaveBeenCalled();
  } finally {
    fireEvent.pointerUp(document, { pointerId: 1 });
  }
});

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

test('RTL horizontal offsets, track clicks and drags share physical coordinates', () => {
  const { viewport, thumb, track } = renderScrollableArea('x');
  viewport.style.direction = 'rtl';
  viewport.scrollLeft = -450;
  fireEvent.scroll(viewport);
  expect(thumb.style.left).toBe('50%');
  fireEvent.click(track, { clientX: 20 });
  expect(viewport.scrollLeft).toBe(-675);
  fireEvent.pointerDown(thumb, { pointerId: 1, clientX: 0 });
  fireEvent.pointerMove(document, { pointerId: 1, clientX: 10 });
  fireEvent.pointerUp(document, { pointerId: 1 });
  expect(viewport.scrollLeft).toBe(-525);
});
