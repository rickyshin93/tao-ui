import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Dropdown } from '../../src/components/dropdown/dropdown';

test.each([true, false])(
  'explicitly empty selectedKeys does not fall back to a menu default (multiple=%s)',
  (multiple) => {
    const onSelect = rstest.fn();
    render(
      <Dropdown
        open
        menu={{
          selectable: true,
          multiple,
          items: [{ key: 'a', label: 'Alpha' }],
          selectedKeys: undefined,
          defaultSelectedKeys: ['a'],
          onSelect,
        }}
      >
        <button type="button">Menu</button>
      </Dropdown>,
    );
    const option = screen.getByRole(
      multiple ? 'menuitemcheckbox' : 'menuitemradio',
      { name: 'Alpha' },
    );
    expect(option).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalledExactlyOnceWith({
      key: 'a',
      selectedKeys: ['a'],
    });
    expect(option).toHaveAttribute('aria-checked', 'false');
  },
);

test('a labeled menu group exposes that label as its accessible name', () => {
  render(
    <Dropdown
      open
      menu={{
        items: [
          {
            type: 'group',
            label: <strong>File actions</strong>,
            children: [{ key: 'edit', label: 'Edit' }],
          },
        ],
      }}
    >
      <button type="button">Menu</button>
    </Dropdown>,
  );
  expect(screen.getByRole('group', { name: 'File actions' })).toContainElement(
    screen.getByRole('menuitem', { name: 'Edit' }),
  );
});

test('editing a menu selection event does not change the internal selection', () => {
  render(
    <Dropdown
      open
      menu={{
        selectable: true,
        multiple: true,
        items: [{ key: 'a', label: 'Alpha' }],
        onSelect: ({ selectedKeys }) => {
          selectedKeys.length = 0;
        },
      }}
    >
      <button type="button">Menu</button>
    </Dropdown>,
  );
  const option = screen.getByRole('menuitemcheckbox', { name: 'Alpha' });
  fireEvent.click(option);

  expect(option).toHaveAttribute('aria-checked', 'true');
});

test('menu items omit empty optional slots and keep zero content', () => {
  render(
    <Dropdown
      open
      menu={{
        items: [
          { key: 'plain', label: 'Plain', icon: false, extra: '' },
          { key: 'zero', label: 'Zero', icon: 0, extra: 0 },
        ],
      }}
    >
      <button type="button">Menu</button>
    </Dropdown>,
  );
  const plain = screen.getByRole('menuitem', { name: 'Plain' });
  expect(plain.querySelector('[data-tao-menu-item-icon]')).toBeNull();
  expect(plain.querySelector('[data-tao-menu-item-extra]')).toBeNull();
  const zero = screen.getByRole('menuitem', { name: /Zero/ });
  expect(zero.querySelector('[data-tao-menu-item-icon]')).toHaveTextContent(
    '0',
  );
  expect(zero.querySelector('[data-tao-menu-item-extra]')).toHaveTextContent(
    '0',
  );
});

test('menu typeahead uses a numeric label before optional icon content', async () => {
  render(
    <Dropdown
      open
      menu={{
        items: [
          { key: 'save', label: 'Save' },
          {
            key: 'zero',
            label: 0,
            icon: <span aria-hidden="true">Count</span>,
          },
        ],
      }}
    >
      <button type="button">Menu</button>
    </Dropdown>,
  );
  const save = screen.getByRole('menuitem', { name: 'Save' });
  save.focus();
  fireEvent.keyDown(save, { key: '0' });
  await waitFor(() =>
    expect(screen.getByRole('menuitem', { name: '0' })).toHaveFocus(),
  );
});

test('menu typeahead searches the item label before its icon text', async () => {
  render(
    <Dropdown
      open
      menu={{
        items: [
          { key: 'save', label: 'Save' },
          {
            key: 'rename',
            label: 'Rename',
            icon: <span aria-hidden="true">Document</span>,
          },
        ],
      }}
    >
      <button type="button">Menu</button>
    </Dropdown>,
  );
  const save = screen.getByRole('menuitem', { name: 'Save' });
  save.focus();
  fireEvent.keyDown(save, { key: 'r' });
  await waitFor(() =>
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus(),
  );
});

test('a multiple-selection menu stays open while the user checks several items', async () => {
  const onOpenChange = rstest.fn();
  render(
    <Dropdown
      onOpenChange={onOpenChange}
      menu={{
        selectable: true,
        multiple: true,
        items: [
          { key: 'a', label: 'Alpha' },
          { key: 'b', label: 'Beta' },
        ],
      }}
    >
      <button type="button">Menu</button>
    </Dropdown>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
  await userEvent.click(
    screen.getByRole('menuitemcheckbox', { name: 'Alpha' }),
  );
  await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Beta' }));
  expect(onOpenChange).not.toHaveBeenCalledWith(false);
  expect(
    screen.getByRole('menuitemcheckbox', { name: 'Alpha' }),
  ).toHaveAttribute('aria-checked', 'true');
  expect(
    screen.getByRole('menuitemcheckbox', { name: 'Beta' }),
  ).toHaveAttribute('aria-checked', 'true');
});

test('portaled submenus inherit size, RTL direction and single-select RadioGroup scope, and Dropdown.Button forwards size', async () => {
  const onSelect = rstest.fn();
  render(
    <div dir="rtl">
      <Dropdown.Button
        open
        size="small"
        menu={{
          selectable: true,
          selectedKeys: ['light'],
          onSelect,
          items: [
            {
              key: 'theme',
              label: 'Theme',
              children: [
                { key: 'light', label: 'Light' },
                { key: 'dark', label: 'Dark' },
              ],
            },
          ],
        }}
      >
        Appearance
      </Dropdown.Button>
    </div>,
  );
  const rootMenu = document.querySelector('[data-tao-dropdown]');
  expect(rootMenu).toHaveAttribute('data-tao-size', 'small');

  const subTrigger = screen.getByRole('menuitem', { name: 'Theme' });
  subTrigger.focus();
  await userEvent.keyboard('{ArrowLeft}');
  const dark = await screen.findByRole('menuitemradio', { name: 'Dark' });
  const subMenu = dark.closest('[data-tao-menu-sub-content]');
  expect(subMenu).toHaveAttribute('data-tao-size', 'small');
  expect(subMenu).toHaveAttribute('dir', 'rtl');
  await userEvent.click(dark);
  expect(onSelect).toHaveBeenCalledWith({
    key: 'dark',
    selectedKeys: ['dark'],
  });
});
