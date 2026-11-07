import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
