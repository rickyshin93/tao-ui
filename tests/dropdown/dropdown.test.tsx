import { beforeAll, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import {
  Dropdown,
  type MenuItem,
} from '../../src/components/dropdown/dropdown';
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

const basicItems: MenuItem[] = [
  { key: 'edit', label: 'Edit' },
  { key: 'copy', label: 'Copy' },
  { key: 'delete', label: 'Delete', danger: true },
];

test('renders trigger; menu mounts when open', () => {
  render(
    <Dropdown open menu={{ items: basicItems }}>
      <button type="button">Open</button>
    </Dropdown>,
  );
  expect(screen.getByText('Open')).toBeTruthy();
  expect(screen.getByText('Edit')).toBeTruthy();
  expect(screen.getByText('Copy')).toBeTruthy();
});

test('menu is not in the document when closed', () => {
  render(
    <Dropdown menu={{ items: basicItems }}>
      <button type="button">Trigger</button>
    </Dropdown>,
  );
  expect(screen.queryByText('Edit')).toBeNull();
});

test('item.onClick and menu.onClick both fire with the key', async () => {
  const calls: string[] = [];
  let menuKey = '';
  render(
    <Dropdown
      open
      menu={{
        items: [
          { key: 'edit', label: 'Edit', onClick: ({ key }) => calls.push(key) },
        ],
        onClick: ({ key }) => {
          menuKey = key;
        },
      }}
    >
      <button type="button">Open</button>
    </Dropdown>,
  );
  await userEvent.click(screen.getByText('Edit'));
  expect(calls).toEqual(['edit']);
  expect(menuKey).toBe('edit');
});

test('divider and group label render', () => {
  const items: MenuItem[] = [
    { type: 'group', label: 'Actions', children: [{ key: 'a', label: 'A' }] },
    { type: 'divider' },
    { key: 'b', label: 'B' },
  ];
  render(
    <Dropdown open menu={{ items }}>
      <button type="button">Open</button>
    </Dropdown>,
  );
  expect(screen.getByText('Actions')).toBeTruthy();
  expect(document.querySelector('[data-tao-menu-divider]')).toBeTruthy();
});

test('disabled item gets data-disabled and does not fire onClick', async () => {
  let fired = false;
  render(
    <Dropdown
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
      <button type="button">Open</button>
    </Dropdown>,
  );
  const item = document.querySelector('[data-tao-menu-item]') as HTMLElement;
  expect(item.getAttribute('data-disabled')).not.toBeNull();
  await userEvent.click(item);
  expect(fired).toBe(false);
});

test('danger item gets data-tao-danger', () => {
  render(
    <Dropdown open menu={{ items: basicItems }}>
      <button type="button">Open</button>
    </Dropdown>,
  );
  const danger = document.querySelector('[data-tao-danger]') as HTMLElement;
  expect(danger.textContent).toContain('Delete');
});

test('submenu renders a sub-trigger', () => {
  const items: MenuItem[] = [
    {
      key: 'more',
      label: 'More',
      children: [
        { key: 's1', label: 'Sub 1' },
        { key: 's2', label: 'Sub 2' },
      ],
    },
  ];
  render(
    <Dropdown open menu={{ items }}>
      <button type="button">Open</button>
    </Dropdown>,
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
    <Dropdown
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
      <button type="button">Open</button>
    </Dropdown>,
  );
  await userEvent.click(screen.getByText('B'));
  expect(events.at(-1)).toEqual({ key: 'b', selectedKeys: ['a', 'b'] });
  await userEvent.click(screen.getByText('A'));
  expect(events.at(-1)).toEqual({ key: 'a', selectedKeys: ['b'] });
});

test('selectable single selects a single key via onSelect', async () => {
  const events: { key: string; selectedKeys: string[] }[] = [];
  render(
    <Dropdown
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
      <button type="button">Open</button>
    </Dropdown>,
  );
  await userEvent.click(screen.getByText('B'));
  expect(events.at(-1)).toEqual({ key: 'b', selectedKeys: ['b'] });
});

test('content carries size from TaoProvider', () => {
  render(
    <TaoProvider size="large">
      <Dropdown open menu={{ items: basicItems }}>
        <button type="button">Open</button>
      </Dropdown>
    </TaoProvider>,
  );
  const content = document.querySelector(
    '[data-tao-menu-content]',
  ) as HTMLElement;
  expect(content.dataset.taoSize).toBe('large');
});

test('Dropdown.Button renders main + trigger buttons; main onClick fires', async () => {
  let mainClicked = false;
  render(
    <Dropdown.Button
      menu={{ items: basicItems }}
      onClick={() => {
        mainClicked = true;
      }}
    >
      Save
    </Dropdown.Button>,
  );
  await userEvent.click(screen.getByText('Save'));
  expect(mainClicked).toBe(true);
  expect(screen.getByLabelText('More')).toBeTruthy();
});
