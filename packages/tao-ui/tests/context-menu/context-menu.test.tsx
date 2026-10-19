import { beforeAll, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ContextMenu } from '../../src/components/context-menu/context-menu';
import type { MenuItem } from '../../src/components/menu/menu-render';
import { TaoProvider } from '../../src/provider/tao-provider';

// Radix menus rely on a few DOM APIs jsdom doesn't implement.
beforeAll(() => {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
});

const items: MenuItem[] = [
  { key: 'cut', label: 'Cut' },
  { key: 'copy', label: 'Copy' },
  { key: 'delete', label: 'Delete', danger: true },
];

test('renders trigger; menu mounts when open', () => {
  render(
    <ContextMenu open menu={{ items }}>
      <div>Right-click area</div>
    </ContextMenu>,
  );
  expect(screen.getByText('Right-click area')).toBeTruthy();
  expect(screen.getByText('Cut')).toBeTruthy();
  expect(screen.getByText('Copy')).toBeTruthy();
});

test('menu is not in the document when closed', () => {
  render(
    <ContextMenu menu={{ items }}>
      <div>Area</div>
    </ContextMenu>,
  );
  expect(screen.queryByText('Cut')).toBeNull();
});

test('item.onClick and menu.onClick both fire with the key', async () => {
  const calls: string[] = [];
  let menuKey = '';
  render(
    <ContextMenu
      open
      menu={{
        items: [
          { key: 'cut', label: 'Cut', onClick: ({ key }) => calls.push(key) },
        ],
        onClick: ({ key }) => {
          menuKey = key;
        },
      }}
    >
      <div>Area</div>
    </ContextMenu>,
  );
  await userEvent.click(screen.getByText('Cut'));
  expect(calls).toEqual(['cut']);
  expect(menuKey).toBe('cut');
});

test('divider and group label render', () => {
  const withGroup: MenuItem[] = [
    { type: 'group', label: 'Edit', children: [{ key: 'a', label: 'A' }] },
    { type: 'divider' },
    { key: 'b', label: 'B' },
  ];
  render(
    <ContextMenu open menu={{ items: withGroup }}>
      <div>Area</div>
    </ContextMenu>,
  );
  expect(screen.getByText('Edit')).toBeTruthy();
  expect(document.querySelector('[data-tao-menu-divider]')).toBeTruthy();
});

test('disabled item does not fire onClick', async () => {
  let fired = false;
  render(
    <ContextMenu
      open
      menu={{
        items: [
          {
            key: 'x',
            label: 'Nope',
            disabled: true,
            onClick: () => {
              fired = true;
            },
          },
        ],
      }}
    >
      <div>Area</div>
    </ContextMenu>,
  );
  const item = document.querySelector('[data-tao-menu-item]') as HTMLElement;
  expect(item.getAttribute('data-disabled')).not.toBeNull();
  await userEvent.click(item);
  expect(fired).toBe(false);
});

test('danger item gets data-tao-danger', () => {
  render(
    <ContextMenu open menu={{ items }}>
      <div>Area</div>
    </ContextMenu>,
  );
  const danger = document.querySelector('[data-tao-danger]') as HTMLElement;
  expect(danger.textContent).toContain('Delete');
});

test('submenu renders a sub-trigger', () => {
  const withSub: MenuItem[] = [
    {
      key: 'more',
      label: 'More',
      children: [{ key: 's1', label: 'Sub 1' }],
    },
  ];
  render(
    <ContextMenu open menu={{ items: withSub }}>
      <div>Area</div>
    </ContextMenu>,
  );
  const sub = document.querySelector(
    '[data-tao-menu-sub-trigger]',
  ) as HTMLElement;
  expect(sub).toBeTruthy();
  expect(sub.textContent).toContain('More');
});

test('selectable multiple toggles keys via onSelect', async () => {
  const events: { key: string; selectedKeys: string[] }[] = [];
  render(
    <ContextMenu
      open
      menu={{
        selectable: true,
        multiple: true,
        defaultSelectedKeys: ['a'],
        items: [
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B' },
        ],
        onSelect: (info) => events.push(info),
      }}
    >
      <div>Area</div>
    </ContextMenu>,
  );
  await userEvent.click(screen.getByText('B'));
  expect(events.at(-1)).toEqual({ key: 'b', selectedKeys: ['a', 'b'] });
});

test('selectable single selects a single key via onSelect', async () => {
  const events: { key: string; selectedKeys: string[] }[] = [];
  render(
    <ContextMenu
      open
      menu={{
        selectable: true,
        items: [
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B' },
        ],
        onSelect: (info) => events.push(info),
      }}
    >
      <div>Area</div>
    </ContextMenu>,
  );
  await userEvent.click(screen.getByText('B'));
  expect(events.at(-1)).toEqual({ key: 'b', selectedKeys: ['b'] });
});

test('content carries size from TaoProvider', () => {
  render(
    <TaoProvider size="large">
      <ContextMenu open menu={{ items }}>
        <div>Area</div>
      </ContextMenu>
    </TaoProvider>,
  );
  const content = document.querySelector(
    '[data-tao-menu-content]',
  ) as HTMLElement;
  expect(content.dataset.taoSize).toBe('large');
});
