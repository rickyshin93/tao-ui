import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Tabs } from '../../src/components/tabs/tabs';
import { TaoProvider } from '../../src/provider/tao-provider';

const items = [
  { key: 'a', label: 'Tab A', children: 'Content A' },
  { key: 'b', label: 'Tab B', children: 'Content B' },
  { key: 'c', label: 'Tab C', children: 'Content C', disabled: true },
];

test('renders all tabs', () => {
  render(<Tabs items={items} />);
  expect(screen.getAllByRole('tab')).toHaveLength(3);
  expect(screen.getByText('Tab A')).toBeTruthy();
  expect(screen.getByText('Tab B')).toBeTruthy();
});

test('first enabled tab active by default', () => {
  render(<Tabs items={items} />);
  const tabA = screen.getByRole('tab', { name: 'Tab A' });
  expect(tabA.getAttribute('aria-selected')).toBe('true');
  expect(screen.getByText('Content A')).toBeVisible();
});

test('defaultActiveKey sets initial tab', () => {
  render(<Tabs items={items} defaultActiveKey="b" />);
  const tabB = screen.getByRole('tab', { name: 'Tab B' });
  expect(tabB.getAttribute('aria-selected')).toBe('true');
  expect(screen.getByText('Content B')).toBeVisible();
});

test('controlled activeKey', () => {
  const { rerender } = render(<Tabs items={items} activeKey="a" />);
  expect(screen.getByText('Content A')).toBeVisible();

  rerender(<Tabs items={items} activeKey="b" />);
  expect(screen.getByText('Content B')).toBeVisible();
});

test('onChange fires on tab click', () => {
  let selected = '';
  render(
    <Tabs
      items={items}
      onChange={(k) => {
        selected = k;
      }}
    />,
  );
  fireEvent.click(screen.getByRole('tab', { name: 'Tab B' }));
  expect(selected).toBe('b');
});

test('disabled tab not clickable', () => {
  let selected = '';
  render(
    <Tabs
      items={items}
      onChange={(k) => {
        selected = k;
      }}
    />,
  );
  fireEvent.click(screen.getByRole('tab', { name: 'Tab C' }));
  expect(selected).toBe('');
});

test('keyboard nav: ArrowRight cycles', () => {
  render(<Tabs items={items} />);
  const tabA = screen.getByRole('tab', { name: 'Tab A' });
  tabA.focus();
  fireEvent.keyDown(tabA, { key: 'ArrowRight' });
  // Tab B should be active (Tab C disabled -> skips to B)
  expect(screen.getByText('Content B')).toBeVisible();
});

test('keyboard nav: ArrowLeft wraps', () => {
  render(<Tabs items={items} />);
  const tabA = screen.getByRole('tab', { name: 'Tab A' });
  tabA.focus();
  fireEvent.keyDown(tabA, { key: 'ArrowLeft' });
  // Wrap to last enabled -> Tab B (C disabled)
  expect(screen.getByText('Content B')).toBeVisible();
});

test('tabs and panels have scoped, reciprocal ARIA ids', () => {
  const { container } = render(
    <>
      <Tabs items={items} />
      <Tabs items={items} />
    </>,
  );

  const tabs = container.querySelectorAll('[role="tab"]');
  const panels = container.querySelectorAll('[role="tabpanel"]');
  const firstTab = tabs[0];
  const firstPanel = panels[0];

  expect(firstTab.id).not.toBe('');
  expect(firstTab.getAttribute('aria-controls')).toBe(firstPanel.id);
  expect(firstPanel.getAttribute('aria-labelledby')).toBe(firstTab.id);
  expect(tabs[0].id).not.toBe(tabs[3].id);
});

test('destroyInactiveTabPane removes hidden panels', () => {
  render(<Tabs items={items} destroyInactiveTabPane />);
  expect(screen.getByText('Content A')).toBeVisible();
  expect(screen.queryByText('Content B')).toBeNull();
});

test('inherits size from TaoProvider', () => {
  render(
    <TaoProvider size="large">
      <Tabs items={items} />
    </TaoProvider>,
  );
  const tabsEl = screen
    .getAllByRole('tab')[0]
    .closest('[data-tao-tabs]') as HTMLElement;
  expect(tabsEl.dataset.taoSize).toBe('large');
});

test('variant card renders without ink bar', () => {
  const { container } = render(<Tabs items={items} variant="card" />);
  expect(container.querySelector('[data-tao-tabs-ink]')).toBeNull();
});

test('variant line renders ink bar', () => {
  const { container } = render(<Tabs items={items} variant="line" />);
  expect(container.querySelector('[data-tao-tabs-ink]')).toBeTruthy();
});

test('async items initialize an available uncontrolled tab without firing onChange', () => {
  const onChange = rs.fn();
  const { rerender } = render(<Tabs items={[]} onChange={onChange} />);
  rerender(<Tabs items={items} onChange={onChange} />);
  expect(screen.getByRole('tab', { name: 'Tab A' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Content A');
  expect(onChange).not.toHaveBeenCalled();
});

test.each([
  'remove',
  'disable',
])('uncontrolled Tabs recover when the current item is %sd', (change) => {
  const onChange = rs.fn();
  const { rerender } = render(<Tabs items={items} onChange={onChange} />);
  const nextItems =
    change === 'remove'
      ? items.slice(1)
      : items.map((item) =>
          item.key === 'a' ? { ...item, disabled: true } : item,
        );
  rerender(<Tabs items={nextItems} onChange={onChange} />);
  expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute(
    'tabindex',
    '0',
  );
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Content B');
  rerender(<Tabs items={items} onChange={onChange} />);
  expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(onChange).not.toHaveBeenCalled();
});

test('uncontrolled Tabs clear selection and indicator when all items become unavailable', () => {
  const { container, rerender } = render(<Tabs items={items} />);
  rerender(<Tabs items={items.map((item) => ({ ...item, disabled: true }))} />);
  expect(screen.queryByRole('tabpanel')).toBeNull();
  expect(
    container.querySelector('[role="tab"][aria-selected="true"]'),
  ).toBeNull();
  expect(container.querySelector('[role="tab"][tabindex="0"]')).toBeNull();
  expect(container.querySelector('[data-tao-tabs-ink]')).toBeNull();
  rerender(<Tabs items={[]} />);
  rerender(<Tabs items={items.slice(1)} />);
  expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
});

test('an empty string item key remains a valid key without selecting a disabled item', () => {
  const entries = [
    { key: '', label: 'Empty key', children: 'Empty key content' },
  ];
  const { rerender } = render(<Tabs items={entries} />);
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Empty key content');
  rerender(<Tabs items={[{ ...entries[0], disabled: true }]} />);
  expect(screen.queryByRole('tabpanel')).toBeNull();
});

test.each([
  'missing',
  'a',
])('controlled invalid or disabled key %s stays parent-owned with usable keyboard navigation', (activeKey) => {
  const onChange = rs.fn();
  const entries = items.map((item) => ({
    ...item,
    disabled: item.key === 'a',
  }));
  render(<Tabs items={entries} activeKey={activeKey} onChange={onChange} />);
  expect(onChange).not.toHaveBeenCalled();
  const available = screen.getByRole('tab', { name: 'Tab B' });
  expect(available).toHaveAttribute('tabindex', '0');
  expect(available).toHaveAttribute('aria-selected', 'false');
  available.focus();
  fireEvent.keyDown(available, { key: 'ArrowRight' });
  expect(onChange).toHaveBeenCalledWith('c');
  expect(screen.getByRole('tab', { name: 'Tab C' })).toHaveFocus();
  expect(screen.getByRole('tab', { name: 'Tab A' })).toHaveAttribute(
    'aria-selected',
    String(activeKey === 'a'),
  );
});

test.each([
  false,
  true,
])('dynamic fallback preserves destroyInactiveTabPane=%s behavior', (destroyInactiveTabPane) => {
  const entries = [
    {
      key: 'a',
      label: 'Tab A',
      children: <input aria-label="Draft" defaultValue="initial" />,
    },
    { key: 'b', label: 'Tab B', children: 'Content B' },
  ];
  const { rerender } = render(
    <Tabs items={entries} destroyInactiveTabPane={destroyInactiveTabPane} />,
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft' }), {
    target: { value: 'edited' },
  });
  rerender(
    <Tabs
      items={[{ ...entries[0], disabled: true }, entries[1]]}
      destroyInactiveTabPane={destroyInactiveTabPane}
    />,
  );
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Content B');
  rerender(
    <Tabs items={entries} destroyInactiveTabPane={destroyInactiveTabPane} />,
  );
  fireEvent.click(screen.getByRole('tab', { name: 'Tab A' }));
  expect(screen.getByRole('textbox', { name: 'Draft' })).toHaveValue(
    destroyInactiveTabPane ? 'initial' : 'edited',
  );
});

test('async items still honor a requested defaultActiveKey once it becomes available', () => {
  const { rerender } = render(<Tabs items={[]} defaultActiveKey="b" />);
  rerender(<Tabs items={items} defaultActiveKey="b" />);
  expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
});
