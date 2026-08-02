import { expect, test } from '@rstest/core';
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
