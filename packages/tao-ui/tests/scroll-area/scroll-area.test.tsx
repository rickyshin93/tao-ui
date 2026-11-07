import { expect, rstest, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ScrollArea } from '../../src/components/scroll-area/scroll-area';

// Mock ResizeObserver
class MockResizeObserver {
  static current: MockResizeObserver;
  private targets = new Set<Element>();
  callback: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
    MockResizeObserver.current = this;
  }
  observe(element: Element) {
    this.targets.add(element);
  }
  disconnect() {
    this.targets.clear();
  }
  unobserve(element: Element) {
    this.targets.delete(element);
  }
  observes(element: Element) {
    return this.targets.has(element);
  }
  resize(element: Element) {
    if (this.targets.has(element)) this.callback([], this);
  }
}
Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  value: MockResizeObserver,
});

function renderScrollableArea(axis: 'x' | 'y', container?: HTMLElement) {
  const view = render(
    <ScrollArea direction="both">
      <div>Content</div>
    </ScrollArea>,
    { container },
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

test('removing a scrollbar interrupts its active thumb drag', () => {
  const { rerender, thumb, write } = renderScrollableArea('x');
  fireEvent.pointerDown(thumb, { pointerId: 1, clientX: 0 });
  rerender(
    <ScrollArea direction="vertical">
      <div>Content</div>
    </ScrollArea>,
  );
  fireEvent.pointerMove(document, { pointerId: 1, clientX: 30 });
  fireEvent.pointerUp(document, { pointerId: 1 });
  expect(write).not.toHaveBeenCalled();
});

test('a scroll thumb uses the document where its viewport is mounted', () => {
  const frame = render(<iframe title="Preview" />);
  const frameDocument =
    screen.getByTitle<HTMLIFrameElement>('Preview').contentDocument!;
  const container = frameDocument.createElement('div');
  frameDocument.body.append(container);
  const { thumb, write, unmount } = renderScrollableArea('y', container);
  try {
    fireEvent.pointerDown(thumb, { pointerId: 1, clientY: 0 });
    fireEvent.pointerMove(frameDocument, { pointerId: 1, clientY: 20 });
    fireEvent.pointerUp(frameDocument, { pointerId: 1 });
    expect(write).toHaveBeenCalledTimes(1);
  } finally {
    unmount();
    frame.unmount();
  }
});

test('a secondary mouse button cannot drag the scroll thumb', () => {
  const { thumb, write } = renderScrollableArea('y');
  fireEvent.pointerDown(thumb, { button: 2, pointerId: 1, clientY: 0 });
  fireEvent.pointerMove(document, { pointerId: 1, clientY: 20 });
  fireEvent.pointerUp(document, { button: 2, pointerId: 1 });
  expect(write).not.toHaveBeenCalled();
});

test.each(['x', 'y'] as const)(
  'cancelling a %s thumb drag stops scrolling and ignores other pointers',
  (axis) => {
    const { viewport, thumb, write, scrollKey } = renderScrollableArea(axis);
    try {
      fireEvent.pointerDown(thumb, { pointerId: 1, clientX: 0, clientY: 0 });
      fireEvent.pointerMove(document, {
        pointerId: 2,
        clientX: 10,
        clientY: 10,
      });
      expect(write).not.toHaveBeenCalled();
      fireEvent.pointerUp(document, { pointerId: 2 });
      fireEvent.pointerMove(document, {
        pointerId: 1,
        clientX: 10,
        clientY: 10,
      });
      expect(write).toHaveBeenCalledTimes(1);
      const position = viewport[scrollKey];
      fireEvent.pointerCancel(document, { pointerId: 1 });
      fireEvent.pointerMove(document, {
        pointerId: 1,
        clientX: 20,
        clientY: 20,
      });
      expect(viewport[scrollKey]).toBe(position);
      expect(write).toHaveBeenCalledTimes(1);
    } finally {
      fireEvent.pointerUp(document, { pointerId: 1 });
    }
  },
);

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

test.each(['x', 'y'] as const)(
  '%s thumb drag maps the actual track travel to the complete scroll range',
  (axis) => {
    const { viewport, thumb, scrollKey } = renderScrollableArea(axis);
    try {
      fireEvent.pointerDown(thumb, { pointerId: 1, clientX: 0, clientY: 0 });
      fireEvent.pointerMove(document, {
        pointerId: 1,
        clientX: 30,
        clientY: 30,
      });
      expect(viewport[scrollKey]).toBe(450);
      fireEvent.pointerMove(document, {
        pointerId: 1,
        clientX: 60,
        clientY: 60,
      });
      expect(viewport[scrollKey]).toBe(900);
      fireEvent.pointerMove(document, {
        pointerId: 1,
        clientX: 90,
        clientY: 90,
      });
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
  },
);

test.each(['x', 'y'] as const)(
  '%s minimum-size thumb aligns its trailing edge at the scroll limit',
  (axis) => {
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
  },
);

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

test('resizing a later viewport child updates scrollbar visibility', () => {
  const view = render(
    <ScrollArea maxHeight={100}>
      <div>Heading</div>
      <div>Results</div>
    </ScrollArea>,
  );
  const viewport = view.container.querySelector('[data-tao-scroll-viewport]')!;
  Object.defineProperties(viewport, {
    clientHeight: { value: 100 },
    scrollHeight: { value: 250 },
  });

  act(() => MockResizeObserver.current.resize(screen.getByText('Results')));
  expect(
    screen.getByRole('button', { name: 'Scroll vertically' }),
  ).toBeVisible();
});

test('a larger page rearms the end callback before the next jump to the bottom', async () => {
  const onScrollEnd = rstest.fn();
  const view = render(
    <ScrollArea onScrollEnd={onScrollEnd}>
      <div>First page</div>
    </ScrollArea>,
  );
  const viewport = view.container.querySelector<HTMLDivElement>(
    '[data-tao-scroll-viewport]',
  )!;
  let height = 200;
  Object.defineProperties(viewport, {
    clientHeight: { value: 100 },
    scrollHeight: { get: () => height },
  });
  viewport.scrollTop = 100;
  fireEvent.scroll(viewport);
  expect(onScrollEnd).toHaveBeenCalledTimes(1);

  view.rerender(
    <ScrollArea onScrollEnd={onScrollEnd}>
      <div>First page</div>
      <div>Next page</div>
    </ScrollArea>,
  );
  const nextPage = screen.getByText('Next page');
  await waitFor(() =>
    expect(MockResizeObserver.current.observes(nextPage)).toBe(true),
  );
  height = 350;
  act(() => MockResizeObserver.current.resize(nextPage));

  viewport.scrollTop = 250;
  fireEvent.scroll(viewport);
  fireEvent.scroll(viewport);
  expect(onScrollEnd).toHaveBeenCalledTimes(2);
});

test('a horizontal scroll alone does not fire the vertical end callback in both mode', () => {
  const onScrollEnd = rstest.fn();
  const { container } = render(
    <ScrollArea direction="both" scrollEndThreshold={20} onScrollEnd={onScrollEnd}>
      <div>Content</div>
    </ScrollArea>,
  );
  const viewport = container.querySelector<HTMLDivElement>(
    '[data-tao-scroll-viewport]',
  )!;
  Object.defineProperties(viewport, {
    clientHeight: { value: 100 },
    scrollHeight: { value: 110 },
    clientWidth: { value: 100 },
    scrollWidth: { value: 200 },
  });
  viewport.scrollLeft = 20;
  fireEvent.scroll(viewport);
  expect(onScrollEnd).not.toHaveBeenCalled();
  viewport.scrollTop = 10;
  fireEvent.scroll(viewport);
  expect(onScrollEnd).toHaveBeenCalledTimes(1);
});

test('horizontal scrolling does not report reaching the vertical end', () => {
  const onScrollEnd = rstest.fn();
  const { container } = render(
    <ScrollArea direction="horizontal" onScrollEnd={onScrollEnd}>
      <div>Content</div>
    </ScrollArea>,
  );
  const viewport = container.querySelector<HTMLDivElement>(
    '[data-tao-scroll-viewport]',
  )!;
  Object.defineProperties(viewport, {
    clientHeight: { value: 100 },
    scrollHeight: { value: 100 },
    clientWidth: { value: 100 },
    scrollWidth: { value: 200 },
  });
  viewport.scrollLeft = 100;
  fireEvent.scroll(viewport);
  expect(onScrollEnd).not.toHaveBeenCalled();
});

test('clicking a zero-length track leaves the scroll offset alone', () => {
  const { track, write } = renderScrollableArea('y');
  rstest
    .spyOn(track, 'getBoundingClientRect')
    .mockReturnValue(new DOMRect(0, 0, 80, 0));
  fireEvent.click(track, { clientY: 10 });
  expect(write).not.toHaveBeenCalled();
});
