import { expect, rstest, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Splitter } from '../../src/components/splitter/splitter';

const Panel = Splitter.Panel;

// Mock ResizeObserver
class MockResizeObserver {
  static current: MockResizeObserver;
  callback: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
  }
  observe(_element: Element) {
    MockResizeObserver.current = this;
    // Simulate container size
    this.callback(
      [{ contentRect: { width: 600, height: 400 } } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    );
  }
  disconnect() {}
  resize(width: number, height = 400) {
    this.callback(
      [{ contentRect: { width, height } } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    );
  }
  unobserve() {}
}
Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  value: MockResizeObserver,
});

test('renders panels', () => {
  render(
    <Splitter>
      <Panel>
        <div>Left</div>
      </Panel>
      <Panel>
        <div>Right</div>
      </Panel>
    </Splitter>,
  );
  expect(screen.getByText('Left')).toBeTruthy();
  expect(screen.getByText('Right')).toBeTruthy();
});

test('renders dragger between panels', () => {
  const { container } = render(
    <Splitter>
      <Panel>
        <div>A</div>
      </Panel>
      <Panel>
        <div>B</div>
      </Panel>
    </Splitter>,
  );
  const dragger = container.querySelector('[data-tao-splitter-dragger]');
  expect(dragger).toBeTruthy();
});

test('dragger exposes separator semantics and supports keyboard resize', () => {
  let resized: number[] = [];
  render(
    <Splitter
      onResize={(sizes) => {
        resized = sizes;
      }}
    >
      <Panel>Left</Panel>
      <Panel>Right</Panel>
    </Splitter>,
  );

  const separator = screen.getByRole('separator', {
    name: 'Resize panels 1 and 2',
  });
  const before = Number(separator.getAttribute('aria-valuenow'));
  expect(separator.getAttribute('aria-orientation')).toBe('vertical');

  fireEvent.keyDown(separator, { key: 'ArrowRight' });
  expect(resized[0]).toBeGreaterThan(before);
});

test.each([
  'horizontal',
  'vertical',
] as const)('pointer cancellation stops %s resizing and other pointers are ignored', (orientation) => {
  const onResize = rstest.fn();
  const onResizeEnd = rstest.fn();
  render(
    <Splitter
      orientation={orientation}
      onResize={onResize}
      onResizeEnd={onResizeEnd}
    >
      <Panel>Left</Panel>
      <Panel>Right</Panel>
    </Splitter>,
  );
  const separator = screen.getByRole('separator');
  try {
    fireEvent.pointerDown(separator, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(document, { pointerId: 2, clientX: 30, clientY: 30 });
    expect(onResize).not.toHaveBeenCalled();
    fireEvent.pointerUp(document, { pointerId: 2 });
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 30, clientY: 30 });
    expect(onResize).toHaveBeenCalledTimes(1);
    const finalSizes = onResize.mock.calls[0][0];
    fireEvent.pointerCancel(document, { pointerId: 1 });
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 60, clientY: 60 });
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResizeEnd).toHaveBeenCalledExactlyOnceWith(finalSizes);
  } finally {
    fireEvent.pointerUp(document, { pointerId: 1 });
  }
});

test('starting another drag replaces listeners and unmount removes the active drag', () => {
  const onResize = rstest.fn();
  const add = rstest.spyOn(document, 'addEventListener');
  const remove = rstest.spyOn(document, 'removeEventListener');
  const { unmount } = render(
    <Splitter onResize={onResize}>
      <Panel>Left</Panel>
      <Panel>Right</Panel>
    </Splitter>,
  );
  try {
    const separator = screen.getByRole('separator');
    fireEvent.pointerDown(separator, { pointerId: 1, clientX: 0 });
    fireEvent.pointerDown(separator, { pointerId: 2, clientX: 0 });
    fireEvent.pointerMove(document, { pointerId: 2, clientX: 20 });
    expect(onResize).toHaveBeenCalledTimes(1);
    unmount();
    fireEvent.pointerMove(document, { pointerId: 2, clientX: 40 });
    expect(onResize).toHaveBeenCalledTimes(1);
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

test('renders multiple panels with multiple draggers', () => {
  const { container } = render(
    <Splitter>
      <Panel>
        <div>A</div>
      </Panel>
      <Panel>
        <div>B</div>
      </Panel>
      <Panel>
        <div>C</div>
      </Panel>
    </Splitter>,
  );
  const draggers = container.querySelectorAll('[data-tao-splitter-dragger]');
  expect(draggers.length).toBe(2);
});

test('vertical orientation', () => {
  const { container } = render(
    <Splitter orientation="vertical">
      <Panel>
        <div>Top</div>
      </Panel>
      <Panel>
        <div>Bottom</div>
      </Panel>
    </Splitter>,
  );
  const splitter = container.querySelector(
    '[data-tao-splitter]',
  ) as HTMLElement;
  expect(splitter.dataset.taoOrientation).toBe('vertical');
});

test('collapsible shows collapse button on dragger', () => {
  const { container } = render(
    <Splitter>
      <Panel collapsible>
        <div>Left</div>
      </Panel>
      <Panel>
        <div>Right</div>
      </Panel>
    </Splitter>,
  );
  const collapseBtn = container.querySelector('[data-tao-splitter-collapse]');
  expect(collapseBtn).toBeTruthy();
});

test('classNames applied to root', () => {
  const { container } = render(
    <Splitter classNames={{ root: 'my-splitter' }}>
      <Panel>
        <div>A</div>
      </Panel>
      <Panel>
        <div>B</div>
      </Panel>
    </Splitter>,
  );
  const root = container.querySelector('[data-tao-splitter]') as HTMLElement;
  expect(root.className).toContain('my-splitter');
});

test('classNames applied to panel', () => {
  const { container } = render(
    <Splitter classNames={{ panel: 'my-panel' }}>
      <Panel>
        <div>A</div>
      </Panel>
      <Panel>
        <div>B</div>
      </Panel>
    </Splitter>,
  );
  const panels = container.querySelectorAll('[data-tao-splitter-panel]');
  expect(panels[0].className).toContain('my-panel');
  expect(panels[1].className).toContain('my-panel');
});

test('classNames applied to dragger', () => {
  const { container } = render(
    <Splitter classNames={{ dragger: 'my-dragger' }}>
      <Panel>
        <div>A</div>
      </Panel>
      <Panel>
        <div>B</div>
      </Panel>
    </Splitter>,
  );
  const dragger = container.querySelector(
    '[data-tao-splitter-dragger]',
  ) as HTMLElement;
  expect(dragger.className).toContain('my-dragger');
});

test('defaultSize distributes space', () => {
  const { container } = render(
    <Splitter>
      <Panel defaultSize="30%">
        <div>A</div>
      </Panel>
      <Panel>
        <div>B</div>
      </Panel>
    </Splitter>,
  );
  const panels = container.querySelectorAll('[data-tao-splitter-panel]');
  // 600px container - 1px dragger = 599px available
  // 30% of 599 ≈ 179.7
  const leftWidth = parseFloat((panels[0] as HTMLElement).style.width);
  expect(leftWidth).toBeCloseTo(179.7, 0);
});

function panelSizes(orientation: 'horizontal' | 'vertical' = 'horizontal') {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[data-tao-splitter-panel]'),
    (panel) =>
      parseFloat(
        orientation === 'horizontal' ? panel.style.width : panel.style.height,
      ),
  );
}

function resizeContainer(width: number, height = 400) {
  act(() => MockResizeObserver.current.resize(width, height));
}

test.each([
  'horizontal',
  'vertical',
] as const)('redistributes %s panels when the container shrinks and grows', (orientation) => {
  render(
    <Splitter orientation={orientation}>
      <Panel defaultSize="30%">First</Panel>
      <Panel>Second</Panel>
    </Splitter>,
  );
  resizeContainer(300, 300);
  expect(panelSizes(orientation)[0]).toBeCloseTo(299 * 0.3);
  expect(panelSizes(orientation)[1]).toBeCloseTo(299 * 0.7);
  resizeContainer(600, 600);
  expect(panelSizes(orientation)[0]).toBeCloseTo(599 * 0.3);
  expect(panelSizes(orientation)[1]).toBeCloseTo(599 * 0.7);
});

test('preserves the dragged proportion across hidden and resized containers', () => {
  render(
    <Splitter>
      <Panel>First</Panel>
      <Panel>Second</Panel>
    </Splitter>,
  );
  const separator = screen.getByRole('separator');
  fireEvent.pointerDown(separator, { pointerId: 1, clientX: 0 });
  fireEvent.pointerMove(document, { pointerId: 1, clientX: 100 });
  fireEvent.pointerUp(document, { pointerId: 1 });
  const dragged = panelSizes();
  expect(dragged[0]).toBeCloseTo(399.5);
  resizeContainer(0);
  expect(panelSizes()).toEqual(dragged);
  resizeContainer(300);
  expect(panelSizes()[0]).toBeCloseTo((dragged[0] / 599) * 299);
  expect(panelSizes()[1]).toBeCloseTo((dragged[1] / 599) * 299);
  resizeContainer(600);
  expect(panelSizes()[0]).toBeCloseTo(dragged[0]);
});

test('a controlled pixel panel leaves exactly the remainder for its flexible sibling', () => {
  const view = (size: number) => (
    <Splitter>
      <Panel size={size}>Fixed</Panel>
      <Panel>Flexible</Panel>
    </Splitter>
  );
  const { rerender } = render(view(100));
  expect(panelSizes()).toEqual([100, 499]);
  rerender(view(200));
  expect(panelSizes()).toEqual([200, 399]);
  resizeContainer(300);
  expect(panelSizes()).toEqual([200, 99]);
});

test('controlled percentages resize while flexible siblings retain their relative shares', () => {
  const view = (size: string) => (
    <Splitter>
      <Panel size={size}>Fixed</Panel>
      <Panel defaultSize={100}>First</Panel>
      <Panel>Second</Panel>
    </Splitter>
  );
  const { rerender } = render(view('25%'));
  const initial = panelSizes();
  rerender(view('50%'));
  expect(panelSizes()[0]).toBeCloseTo(598 * 0.5);
  expect(panelSizes()[1]).toBeCloseTo(
    (299 * initial[1]) / (initial[1] + initial[2]),
  );
  expect(panelSizes().reduce((sum, size) => sum + size, 0)).toBeCloseTo(598);
  resizeContainer(300);
  expect(panelSizes()[0]).toBeCloseTo(298 * 0.5);
  expect(panelSizes().reduce((sum, size) => sum + size, 0)).toBeCloseTo(298);
});

test('flexible reallocation respects min and max bounds', () => {
  render(
    <Splitter>
      <Panel max={100}>First</Panel>
      <Panel min={120}>Second</Panel>
    </Splitter>,
  );
  expect(panelSizes()).toEqual([100, 499]);
  resizeContainer(130);
  expect(panelSizes()[0]).toBeCloseTo(9);
  expect(panelSizes()[1]).toBeCloseTo(120);
  resizeContainer(1000);
  expect(panelSizes()[0]).toBeLessThanOrEqual(100);
  expect(panelSizes()[1]).toBeGreaterThanOrEqual(120);
  expect(panelSizes().reduce((sum, size) => sum + size, 0)).toBeCloseTo(999);
});

test('percentage constraints track the current available space', () => {
  render(
    <Splitter>
      <Panel defaultSize="80%" max="25%">
        First
      </Panel>
      <Panel>Second</Panel>
    </Splitter>,
  );
  expect(panelSizes()[0]).toBeCloseTo(599 * 0.25);
  resizeContainer(300);
  expect(panelSizes()[0]).toBeCloseTo(299 * 0.25);
  expect(panelSizes()[1]).toBeCloseTo(299 * 0.75);
});

test('collapsed panels stay at zero through resize despite their minimum', () => {
  render(
    <Splitter>
      <Panel defaultSize={200} min={100} collapsible>
        First
      </Panel>
      <Panel>Second</Panel>
    </Splitter>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Collapse panel' }));
  expect(panelSizes()).toEqual([0, 599]);
  resizeContainer(300);
  expect(panelSizes()).toEqual([0, 299]);
  resizeContainer(600);
  expect(panelSizes()).toEqual([0, 599]);
  fireEvent.click(screen.getByRole('button', { name: 'Collapse panel' }));
  expect(panelSizes()).toEqual([200, 399]);
});

test.each([
  { min: 200, max: undefined, width: 300, expected: [200, 200] },
  { min: undefined, max: 100, width: 600, expected: [100, 100] },
])('keeps unsatisfiable bounds without repeatedly updating state: $expected', ({
  min,
  max,
  width,
  expected,
}) => {
  render(
    <Splitter>
      <Panel min={min} max={max}>
        First
      </Panel>
      <Panel min={min} max={max}>
        Second
      </Panel>
    </Splitter>,
  );
  resizeContainer(width);
  expect(panelSizes()).toEqual(expected);
  resizeContainer(width);
  expect(panelSizes()).toEqual(expected);
});

test('fully controlled sizes remain parent-owned even when they cannot fill or fit', () => {
  const view = (left: number, right: number) => (
    <Splitter>
      <Panel size={left}>First</Panel>
      <Panel size={right}>Second</Panel>
    </Splitter>
  );
  const { rerender } = render(view(100, 150));
  expect(panelSizes()).toEqual([100, 150]);
  resizeContainer(200);
  expect(panelSizes()).toEqual([100, 150]);
  fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowRight' });
  expect(panelSizes()).toEqual([100, 150]);
  rerender(view(50, 80));
  expect(panelSizes()).toEqual([50, 80]);
});

test('RTL horizontal drag and arrow keys move the separator in the requested direction', () => {
  const onResize = rstest.fn();
  render(
    <Splitter
      onResize={onResize}
      styles={{ root: { direction: 'rtl' }, dragger: { direction: 'rtl' } }}
    >
      <Panel>A</Panel>
      <Panel>B</Panel>
    </Splitter>,
  );
  const separator = screen.getByRole('separator');
  fireEvent.pointerDown(separator, { pointerId: 1, clientX: 100 });
  fireEvent.pointerMove(document, { pointerId: 1, clientX: 130 });
  fireEvent.pointerUp(document, { pointerId: 1 });
  expect(onResize).toHaveBeenLastCalledWith([269.5, 329.5]);
  fireEvent.keyDown(separator, { key: 'ArrowRight' });
  expect(onResize).toHaveBeenLastCalledWith([259.5, 339.5]);
});
