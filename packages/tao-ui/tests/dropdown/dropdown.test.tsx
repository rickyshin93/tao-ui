import { beforeAll, expect, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Fragment } from 'react';
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

test('a Fragment trigger opens the menu on click', async () => {
  render(
    <Dropdown menu={{ items: basicItems }}>
      <Fragment key="trigger">
        <span aria-hidden="true">+</span>
        <button type="button">Fragment trigger</button>
      </Fragment>
    </Dropdown>,
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Fragment trigger' }),
  );
  expect(screen.getByRole('menu')).toBeTruthy();
});

test('a single Fragment trigger regains focus after keyboard dismissal', async () => {
  render(
    <Dropdown menu={{ items: basicItems }}>
      <Fragment key="trigger">
        <button type="button">Keyboard trigger</button>
      </Fragment>
    </Dropdown>,
  );
  const trigger = screen.getByRole('button', { name: 'Keyboard trigger' });
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(trigger).toHaveFocus());
});

test('menu is not in the document when closed', () => {
  render(
    <Dropdown menu={{ items: basicItems }}>
      <button type="button">Trigger</button>
    </Dropdown>,
  );
  expect(screen.queryByText('Edit')).toBeNull();
});

for (const config of [
  { name: 'local disabled', providerDisabled: false, disabled: true },
  { name: 'provider disabled', providerDisabled: true, disabled: undefined },
]) {
  test(`hover does not open a menu with ${config.name}`, () => {
    const changes: boolean[] = [];
    render(
      <TaoProvider disabled={config.providerDisabled}>
        <Dropdown
          disabled={config.disabled}
          trigger={['hover']}
          menu={{ items: basicItems }}
          onOpenChange={(open) => changes.push(open)}
        >
          <span>Hover trigger</span>
        </Dropdown>
      </TaoProvider>,
    );
    fireEvent.pointerEnter(screen.getByText('Hover trigger'));
    expect(screen.queryByRole('menu')).toBeNull();
    expect(changes).toEqual([]);
  });
}

test('local disabled=false allows hover under a disabled provider', () => {
  render(
    <TaoProvider disabled>
      <Dropdown
        disabled={false}
        trigger={['hover']}
        menu={{ items: basicItems }}
      >
        <span>Hover trigger</span>
      </Dropdown>
    </TaoProvider>,
  );
  fireEvent.pointerEnter(screen.getByText('Hover trigger'));
  expect(screen.getByRole('menu')).toBeTruthy();
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

test('disabling a split Dropdown disables both actions', async () => {
  const calls: string[] = [];
  render(
    <Dropdown.Button
      disabled
      menu={{ items: basicItems }}
      onClick={() => calls.push('main')}
    >
      Save
    </Dropdown.Button>,
  );
  const main = screen.getByRole('button', { name: 'Save' });
  const more = screen.getByRole('button', { name: 'More' });
  expect(main).toBeDisabled();
  expect(more).toBeDisabled();
  await userEvent.click(main);
  expect(calls).toEqual([]);
});

test('an uncontrolled menu selection survives switching Dropdown trigger modes', () => {
  const dropdown = (context: boolean) => (
    <Dropdown
      open
      trigger={context ? ['contextMenu'] : ['click']}
      menu={{ selectable: true, multiple: true, items: basicItems }}
    >
      <button type="button">Menu</button>
    </Dropdown>
  );
  const view = render(dropdown(false));
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Edit' }));
  view.rerender(dropdown(true));
  expect(
    screen.getByRole('menuitemcheckbox', { name: 'Edit' }),
  ).toHaveAttribute('aria-checked', 'true');

  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Copy' }));
  view.rerender(dropdown(false));

  expect(
    screen.getByRole('menuitemcheckbox', { name: 'Edit' }),
  ).toHaveAttribute('aria-checked', 'true');
  expect(
    screen.getByRole('menuitemcheckbox', { name: 'Copy' }),
  ).toHaveAttribute('aria-checked', 'true');
});

test('a context-triggered Dropdown applies defaultOpen and closes after an action', async () => {
  const changes: boolean[] = [];
  render(
    <Dropdown
      trigger={['contextMenu']}
      defaultOpen
      menu={{ items: basicItems }}
      onOpenChange={(open) => changes.push(open)}
    >
      <span>Right-click area</span>
    </Dropdown>,
  );
  await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
  expect(changes).toEqual([false]);
  expect(screen.queryByRole('menu')).toBeNull();
});

test('disabling an uncontrolled Dropdown discards its open menu', () => {
  const renderMenu = (disabled: boolean) => (
    <Dropdown defaultOpen disabled={disabled} menu={{ items: basicItems }}>
      <button type="button">Actions</button>
    </Dropdown>
  );
  const view = render(renderMenu(false));
  expect(screen.getByRole('menu')).toBeInTheDocument();
  view.rerender(renderMenu(true));
  expect(screen.queryByRole('menu')).toBeNull();
  view.rerender(renderMenu(false));
  expect(screen.queryByRole('menu')).toBeNull();
});
