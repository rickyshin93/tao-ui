import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Splitter } from '../../src/components/splitter/splitter';

const Panel = Splitter.Panel;

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
  }
  observe(_element: Element) {
    // Simulate container size
    this.callback(
      [{ contentRect: { width: 600, height: 400 } } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    );
  }
  disconnect() {}
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

  const separator = screen.getByRole('separator', { name: 'Resize panels 1 and 2' });
  const before = Number(separator.getAttribute('aria-valuenow'));
  expect(separator.getAttribute('aria-orientation')).toBe('vertical');

  fireEvent.keyDown(separator, { key: 'ArrowRight' });
  expect(resized[0]).toBeGreaterThan(before);
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
