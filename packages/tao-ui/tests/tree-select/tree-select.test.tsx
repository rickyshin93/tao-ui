import { expect, rstest, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createRef, useState } from 'react';
import {
  TreeSelect,
  type TreeSelectRef,
} from '../../src/components/tree-select/tree-select';
import { TaoProvider, zhCN } from '../../src/provider/tao-provider';

const treeData = [
  {
    value: 'team',
    title: 'Team',
    children: [
      { value: 'alice', title: 'Alice' },
      { value: 'bob', title: 'Bob' },
      { value: 'disabled', title: 'Disabled', disabled: true },
    ],
  },
];

test('selects a value, forwards node events and closes the single dropdown', async () => {
  const onChange = rstest.fn();
  const onSelect = rstest.fn();
  const onOpenChange = rstest.fn();
  render(
    <TreeSelect
      aria-label="Team member"
      treeData={treeData}
      defaultOpen
      treeDefaultExpandAll
      onChange={onChange}
      onSelect={onSelect}
      onOpenChange={onOpenChange}
    />,
  );
  fireEvent.click(await screen.findByText('Alice'));
  expect(onChange.mock.calls[0][0]).toBe('alice');
  expect(onSelect.mock.calls[0]).toEqual([
    'alice',
    expect.objectContaining({ title: 'Alice' }),
  ]);
  await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  await waitFor(() =>
    expect(
      screen.getByRole('combobox', { name: 'Team member' }),
    ).toHaveAttribute('aria-expanded', 'false'),
  );
});

test('controlled values stay unchanged until accepted and clear uses the public callback', async () => {
  const onChange = rstest.fn();
  const onClear = rstest.fn();
  const { rerender } = render(
    <TreeSelect
      value="alice"
      treeData={treeData}
      allowClear
      onChange={onChange}
      onClear={onClear}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(onChange.mock.calls[0][0]).toBeUndefined();
  expect(onClear).toHaveBeenCalledOnce();
  expect(screen.getByTitle('Alice')).toBeInTheDocument();
  rerender(<TreeSelect value="bob" treeData={treeData} />);
  expect(screen.getByTitle('Bob')).toBeInTheDocument();
});

test('cascades checked parents and follows SHOW_PARENT while ignoring disabled children', async () => {
  const onChange = rstest.fn();
  render(
    <TreeSelect
      treeData={treeData}
      defaultOpen
      treeDefaultExpandAll
      treeCheckable
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      onChange={onChange}
    />,
  );
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Team' }));
  expect(onChange.mock.calls[0][0]).toEqual(['team']);
  expect(screen.getByRole('checkbox', { name: 'Alice' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  expect(screen.getByRole('checkbox', { name: 'Disabled' })).toHaveAttribute(
    'aria-checked',
    'false',
  );
  expect(screen.getByRole('checkbox', { name: 'Disabled' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
});

test('strict checks return labeled values without checking descendants', async () => {
  const onChange = rstest.fn();
  render(
    <TreeSelect
      treeData={treeData}
      defaultOpen
      treeDefaultExpandAll
      treeCheckable
      treeCheckStrictly
      onChange={onChange}
    />,
  );
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Team' }));
  expect(onChange.mock.calls[0][0]).toEqual([
    expect.objectContaining({ value: 'team', label: 'Team' }),
  ]);
  expect(screen.getByRole('checkbox', { name: 'Alice' })).toHaveAttribute(
    'aria-checked',
    'false',
  );
});

test('filters using showSearch object and selects with the keyboard', async () => {
  const onChange = rstest.fn();
  const onSearch = rstest.fn();
  render(
    <TreeSelect
      treeData={treeData}
      defaultOpen
      treeDefaultExpandAll
      showSearch={{ treeNodeFilterProp: 'title', onSearch }}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: 'Bob' } });
  expect(onSearch).toHaveBeenCalledWith('Bob');
  await waitFor(() => expect(screen.queryByText('Alice')).toBeNull());
  fireEvent.keyDown(input, { key: 'ArrowDown', keyCode: 40, which: 40 });
  fireEvent.keyDown(input, { key: 'ArrowDown', keyCode: 40, which: 40 });
  fireEvent.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
  expect(onChange.mock.calls[0][0]).toBe('bob');
});

test('supports simple tree data, field names and labeled selection', async () => {
  const onChange = rstest.fn();
  render(
    <TreeSelect
      defaultOpen
      treeDefaultExpandAll
      labelInValue
      treeDataSimpleMode
      fieldNames={{ value: 'id', label: 'name' }}
      treeData={[
        { id: 'root', pId: 0, name: 'Root' },
        { id: 'child', pId: 'root', name: 'Child' },
      ]}
      onChange={onChange}
    />,
  );
  fireEvent.click(await screen.findByText('Child'));
  expect(onChange.mock.calls[0][0]).toMatchObject({
    value: 'child',
    label: 'Child',
  });
});

test('loads children asynchronously and reports expanded keys', async () => {
  const onTreeExpand = rstest.fn();
  const load = rstest.fn();
  function AsyncTree() {
    const [data, setData] = useState([
      {
        value: 'lazy',
        title: 'Lazy',
        isLeaf: false,
        children: [] as { value: string; title: string }[],
      },
    ]);
    return (
      <TreeSelect
        treeData={data}
        defaultOpen
        onTreeExpand={onTreeExpand}
        loadData={async () => {
          load();
          setData([
            {
              value: 'lazy',
              title: 'Lazy',
              isLeaf: false,
              children: [{ value: 'loaded', title: 'Loaded' }],
            },
          ]);
        }}
      />
    );
  }
  render(<AsyncTree />, { reactStrictMode: true });
  const title = await screen.findByText('Lazy');
  fireEvent.click(
    title
      .closest('[role="treeitem"]')!
      .querySelector('[data-tao-tree-select-switcher]')!,
  );
  expect(await screen.findByText('Loaded')).toBeInTheDocument();
  expect(load).toHaveBeenCalledOnce();
  expect(onTreeExpand).toHaveBeenCalledWith(['lazy']);
});

test('maxCount limits child selection and SHOW_PARENT retains upstream exception', async () => {
  const onChange = rstest.fn();
  const { rerender } = render(
    <TreeSelect
      treeData={treeData}
      defaultOpen
      treeDefaultExpandAll
      treeCheckable
      maxCount={1}
      onChange={onChange}
    />,
  );
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Alice' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Bob' }));
  expect(onChange).toHaveBeenCalledOnce();
  rerender(
    <TreeSelect
      treeData={treeData}
      defaultOpen
      treeDefaultExpandAll
      treeCheckable
      maxCount={1}
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      onChange={onChange}
    />,
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Bob' }));
  expect(onChange.mock.calls[1][0]).toEqual(['team']);
});

test('inherits provider defaults, localized clear and portal tokens with semantic callbacks', async () => {
  const { container } = render(
    <TaoProvider
      size="large"
      locale={zhCN}
      theme={{ mode: 'dark', token: { colorPrimary: '#845ef7' } }}
    >
      <TreeSelect
        treeData={treeData}
        defaultValue="alice"
        defaultOpen
        treeDefaultExpandAll
        allowClear
        variant="underlined"
        classNames={({ props }) => ({
          root: props.size === 'large' ? 'large-root' : '',
          popup: { root: 'tree-popup', itemTitle: 'tree-title' },
        })}
        styles={{ popup: { itemTitle: { fontWeight: 700 } } }}
        popupRender={(menu) => (
          <>
            {menu}
            <span>Footer</span>
          </>
        )}
      />
    </TaoProvider>,
  );
  expect(container.querySelector('[data-tao-tree-select]')).toHaveAttribute(
    'data-tao-size',
    'large',
  );
  expect(container.querySelector('[data-tao-tree-select]')).toHaveClass(
    'large-root',
  );
  expect(screen.getByRole('button', { name: '清除' })).toBeInTheDocument();
  const footer = await screen.findByText('Footer');
  expect(footer.closest('[data-tao-theme]')).toHaveAttribute(
    'data-tao-theme',
    'dark',
  );
  expect(
    footer.closest('[data-tao-provider]')?.getAttribute('style'),
  ).toContain('#845ef7');
  expect(document.querySelector('.tree-title')).toHaveStyle({
    fontWeight: '700',
  });
});

test('forwards focus and blur refs and provider disabled state', () => {
  const ref = createRef<TreeSelectRef>();
  const { rerender } = render(<TreeSelect ref={ref} treeData={treeData} />);
  act(() => ref.current?.focus());
  expect(screen.getByRole('combobox')).toHaveFocus();
  act(() => ref.current?.blur());
  expect(screen.getByRole('combobox')).not.toHaveFocus();
  rerender(
    <TaoProvider disabled>
      <TreeSelect treeData={treeData} />
    </TaoProvider>,
  );
  expect(screen.getByRole('combobox')).toBeDisabled();
});

test('maps the public middle size alias to the shared medium control', () => {
  const { container } = render(<TreeSelect size="middle" />);
  expect(container.querySelector('[data-tao-tree-select]')).toHaveAttribute(
    'data-tao-size',
    'medium',
  );
});
