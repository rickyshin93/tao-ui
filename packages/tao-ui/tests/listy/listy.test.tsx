import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Listy, type ListyRef } from '../../src/components/listy/listy';
import { TaoProvider } from '../../src/provider/tao-provider';

const items = [
  { id: 'a', name: 'Ada', group: 'A' },
  { id: 'b', name: 'Ben', group: 'B' },
  { id: 'c', name: 'Amy', group: 'A' },
];
test('renders records and maintains original indexes when grouping', () => {
  render(
    <Listy
      items={items}
      rowKey="id"
      group={{
        key: (item) => item.group,
        title: (key, group) => `${key}: ${group.length}`,
      }}
      itemRender={(item, index) => `${index} ${item.name}`}
    />,
  );
  for (const text of ['A: 2', 'B: 1', '0 Ada', '1 Ben', '2 Amy'])
    expect(screen.getByText(text)).toBeTruthy();
});
test('imperative scroll supports numeric and coordinate positions', () => {
  const ref = createRef<ListyRef>();
  const { container } = render(
    <Listy
      ref={ref}
      items={items}
      rowKey="id"
      height={200}
      itemRender={(item) => item.name}
    />,
  );
  const holder = container.querySelector(
    '[data-tao-listy] > div',
  ) as HTMLElement;
  ref.current?.scrollTo(60);
  expect(holder.scrollTop).toBe(60);
  ref.current?.scrollTo({ top: 25, left: 12 });
  expect(holder.scrollTop).toBe(25);
  expect(holder.scrollLeft).toBe(12);
});
test('a positive horizontal scroll offset works in nonvirtual RTL lists', () => {
  const ref = createRef<ListyRef>();
  const { container } = render(
    <Listy
      ref={ref}
      items={items}
      rowKey="id"
      height={100}
      scrollWidth={700}
      direction="rtl"
      itemRender={(item) => item.name}
    />,
  );
  const holder = container.querySelector<HTMLElement>('[data-tao-listy] > div')!;
  ref.current?.scrollTo({ left: 35, top: 20 });
  expect(holder.scrollLeft).toBe(-35);
  expect(holder.scrollTop).toBe(20);
});

test('item and group scroll resolve stable keys and alignment', () => {
  const ref = createRef<ListyRef>();
  const scrollIntoView = rs
    .spyOn(HTMLElement.prototype, 'scrollIntoView')
    .mockImplementation(() => {});
  render(
    <Listy
      ref={ref}
      items={items}
      rowKey="id"
      group={{ key: (item) => item.group, title: (key) => key }}
      itemRender={(item) => item.name}
    />,
  );
  ref.current?.scrollTo({ key: 'c', align: 'bottom' });
  expect(scrollIntoView).toHaveBeenLastCalledWith({
    block: 'end',
    inline: 'nearest',
  });
  ref.current?.scrollTo({ groupKey: 'A', align: 'top' });
  expect(scrollIntoView).toHaveBeenLastCalledWith({
    block: 'start',
    inline: 'nearest',
  });
  scrollIntoView.mockRestore();
});
test('virtual rendering limits mounted items and preserves horizontal width', () => {
  const { container } = render(
    <Listy
      virtual
      height={120}
      scrollWidth={700}
      items={Array.from({ length: 200 }, (_, i) => ({ id: i }))}
      rowKey="id"
      itemRender={(item) => `Item ${item.id}`}
    />,
  );
  expect(container.querySelectorAll('[class*="-item"]').length).toBeLessThan(
    30,
  );
  expect(
    container.querySelector('[class*="-item"]')?.getAttribute('style'),
  ).toContain('700px');
});

test('a nonvirtual list reserves the requested horizontal scroll width', () => {
  const { container } = render(
    <Listy
      items={items}
      rowKey="id"
      height={100}
      scrollWidth={700}
      itemRender={(item) => item.name}
    />,
  );
  const holder = container.querySelector('[data-tao-listy] > div');
  expect(holder).toHaveStyle({ overflowX: 'auto' });
  expect(screen.getByText('Ada')).toHaveStyle({ minWidth: '700px' });
});

test('a nonvirtual Listy heading spans the same horizontal width as its rows', () => {
  render(
    <Listy
      items={items}
      rowKey="id"
      height={100}
      scrollWidth={700}
      sticky
      group={{ key: (item) => item.group, title: (key) => `Group ${key}` }}
      itemRender={(item) => item.name}
    />,
  );
  expect(screen.getByText('Group A')).toHaveStyle({ minWidth: '700px' });
  expect(screen.getByText('Ada')).toHaveStyle({ minWidth: '700px' });
});

test.each([false, true])(
  'Listy resolves inherited RTL into its engine (virtual=%s)',
  (virtual) => {
    const list = (direction?: 'ltr' | 'rtl') => (
      <TaoProvider direction="rtl">
        <div style={{ direction: 'rtl' }}>
          <Listy
            virtual={virtual}
            items={items}
            rowKey="id"
            height={100}
            itemRender={(item) => item.name}
            direction={direction}
          />
        </div>
      </TaoProvider>
    );
    const view = render(list());
    const holder = view.container.querySelector('[data-tao-listy] > div');
    expect(holder).toHaveAttribute('dir', 'rtl');
    view.rerender(list('ltr'));
    expect(holder).not.toHaveAttribute('dir', 'rtl');
  },
);
test('semantic callbacks, root overrides, rowHoverable and scrolling callbacks work', () => {
  const onScroll = rs.fn();
  const { container } = render(
    <Listy
      items={items}
      rowKey="id"
      itemRender={(item) => item.name}
      rowHoverable={false}
      height={100}
      onScroll={onScroll}
      classNames={({ props }) => ({
        root: props.rowHoverable ? 'hover' : 'fixed',
        item: 'row',
      })}
      styles={{ root: { marginTop: 4 }, item: { padding: 20 } }}
      style={{ marginTop: 8 }}
    />,
  );
  const holder = container.querySelector('.fixed') as HTMLElement;
  expect(holder.style.marginTop).toBe('8px');
  expect(container.querySelector('.row')?.getAttribute('style')).toContain(
    '20px',
  );
  fireEvent.scroll(holder);
  expect(onScroll).toHaveBeenCalledTimes(1);
});
