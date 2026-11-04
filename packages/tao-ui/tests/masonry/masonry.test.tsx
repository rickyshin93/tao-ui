import { afterEach, beforeEach, expect, rstest, test } from '@rstest/core';
import { act, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Masonry, type MasonryRef } from '../../src/components/masonry/masonry';

let resize: () => void;
let watched: Element[];
let disconnected: boolean;
const OriginalObserver = globalThis.ResizeObserver;
beforeEach(() => {
  watched = [];
  disconnected = false;
  globalThis.ResizeObserver = class {
    constructor(callback: () => void) {
      resize = callback;
    }
    observe(node: Element) {
      watched.push(node);
    }
    unobserve() {}
    disconnect() {
      disconnected = true;
    }
  } as unknown as typeof ResizeObserver;
  rstest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function () {
      const height = Number.parseFloat(
        this.style.height ||
          this.firstElementChild?.getAttribute('data-height') ||
          '0',
      );
      return {
        height,
        width: 100,
        top: 0,
        bottom: height,
        left: 0,
        right: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      };
    });
});
afterEach(() => {
  globalThis.ResizeObserver = OriginalObserver;
  rstest.restoreAllMocks();
});
const items = [100, 40, 60, 20].map((height, key) => ({
  key,
  height,
  data: `Item ${key}`,
}));

test('places items in the shortest column and reports stable mappings only once', () => {
  const change = rstest.fn();
  const ref = createRef<MasonryRef>();
  const { rerender } = render(
    <Masonry
      ref={ref}
      columns={2}
      gutter={[10, 8]}
      items={items}
      itemRender={({ data }) => data}
      onLayoutChange={change}
    />,
  );
  expect(
    items.map((item) =>
      screen.getByText(item.data).getAttribute('data-tao-column'),
    ),
  ).toEqual(['0', '1', '1', '0']);
  expect(screen.getByText('Item 2')).toHaveStyle({ top: '48px' });
  expect(screen.getByText('Item 3')).toHaveStyle({ top: '108px' });
  expect(ref.current?.nativeElement.style.height).toBe('128px');
  rerender(
    <Masonry
      ref={ref}
      columns={2}
      gutter={[10, 8]}
      items={items}
      itemRender={({ data }) => data}
      onLayoutChange={change}
    />,
  );
  expect(change).toHaveBeenCalledTimes(1);
});
test('honors assigned columns, children precedence and key reordering', () => {
  const fixed = items.map((item, index) => ({
    ...item,
    column: index === 0 ? 1 : undefined,
  }));
  const { rerender } = render(
    <Masonry columns={2} items={fixed} itemRender={({ data }) => data} />,
  );
  expect(screen.getByText('Item 0')).toHaveAttribute('data-tao-column', '1');
  rerender(
    <Masonry
      columns={1}
      items={[{ ...items[3], children: 'Override' }, items[0]]}
      itemRender={({ data }) => data}
    />,
  );
  expect(screen.queryByText('Item 3')).toBeNull();
  expect(screen.getByText('Item 0')).toHaveStyle({ top: '20px' });
});
test('fresh observes item content resizing and disconnects on unmount', () => {
  const { unmount } = render(
    <Masonry
      columns={1}
      gutter={4}
      fresh
      items={[
        { key: 'a', data: '', children: <div data-height="30">A</div> },
        { key: 'b', data: '', children: <div data-height="20">B</div> },
      ]}
    />,
  );
  expect(watched).toHaveLength(3);
  expect(screen.getByText('B').parentElement).toHaveStyle({ top: '34px' });
  screen.getByText('A').setAttribute('data-height', '80');
  act(() => resize());
  expect(screen.getByText('B').parentElement).toHaveStyle({ top: '84px' });
  unmount();
  expect(disconnected).toBe(true);
});
test('resolves responsive columns and semantic callbacks against merged props', () => {
  const ref = createRef<MasonryRef>();
  render(
    <Masonry
      ref={ref}
      columns={{ xs: 1, md: 2 }}
      items={items}
      className="custom"
      classNames={({ props }) => ({
        root: `columns-${props.columns}`,
        item: 'tile',
      })}
      styles={{ item: { color: 'red' } }}
      itemRender={({ data, index, column }) => `${data}:${index}:${column}`}
    />,
  );
  expect(ref.current?.nativeElement).toHaveClass('custom', 'columns-2');
  expect(screen.getByText('Item 0:0:0')).toHaveClass('tile');
  expect(screen.getByText('Item 0:0:0')).toHaveStyle({ color: 'red' });
});
