import { expect, rstest, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { createRef, useState } from 'react';
import {
  type DataNode,
  Tree,
  type TreeProps,
  type TreeRef,
} from '../../src/components/tree/tree';
import { TaoProvider } from '../../src/provider/tao-provider';

const nodes: DataNode[] = [
  {
    key: 'project',
    title: 'Project',
    children: [
      { key: 'draft', title: 'Draft', isLeaf: true },
      { key: 'published', title: 'Published', isLeaf: true },
    ],
  },
];

test('expands parents for default descendant keys and forwards expand events', () => {
  const onExpand = rstest.fn();
  render(
    <Tree
      treeData={nodes}
      defaultExpandedKeys={['draft']}
      onExpand={onExpand}
    />,
  );
  expect(screen.getByText('Draft')).toBeVisible();
  fireEvent.click(
    screen
      .getByText('Project')
      .closest('[role="treeitem"]')!
      .querySelector('[data-tao-tree-switcher]')!,
  );
  expect(screen.queryByText('Draft')).toBeNull();
  expect(onExpand.mock.calls[0][0]).not.toContain('project');
  expect(onExpand.mock.calls[0][1]).toMatchObject({
    expanded: false,
    node: { key: 'project' },
  });
});

test('controlled selection only changes when its owner accepts the callback', () => {
  const onSelect = rstest.fn();
  const { rerender } = render(
    <Tree
      treeData={nodes}
      defaultExpandAll
      selectedKeys={['draft']}
      onSelect={onSelect}
    />,
  );
  fireEvent.click(screen.getByText('Published'));
  expect(onSelect.mock.calls[0][0]).toEqual(['published']);
  expect(
    screen.getByText('Draft').closest('[role="treeitem"]'),
  ).toHaveAttribute('aria-selected', 'true');
  rerender(
    <Tree
      treeData={nodes}
      defaultExpandAll
      selectedKeys={['published']}
      onSelect={onSelect}
    />,
  );
  expect(
    screen.getByText('Published').closest('[role="treeitem"]'),
  ).toHaveAttribute('aria-selected', 'true');
});

test('cascades checks through enabled descendants and reports half checks', () => {
  const onCheck = rstest.fn();
  render(
    <Tree treeData={nodes} defaultExpandAll checkable onCheck={onCheck} />,
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Draft' }));
  expect(onCheck.mock.calls[0][0]).toEqual(['draft']);
  expect(onCheck.mock.calls[0][1]).toMatchObject({
    checked: true,
    halfCheckedKeys: ['project'],
  });
  expect(screen.getByRole('checkbox', { name: 'Project' })).toHaveAttribute(
    'aria-checked',
    'mixed',
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Project' }));
  expect(onCheck.mock.calls[1][0]).toEqual(
    expect.arrayContaining(['project', 'draft', 'published']),
  );
  expect(screen.getByRole('checkbox', { name: 'Published' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
});

test('strict checking keeps parent and child independent with the object payload', () => {
  const onCheck = rstest.fn();
  render(
    <Tree
      treeData={nodes}
      defaultExpandAll
      checkable
      checkStrictly
      onCheck={onCheck}
    />,
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Project' }));
  expect(onCheck.mock.calls[0][0]).toEqual({
    checked: ['project'],
    halfChecked: [],
  });
  expect(screen.getByRole('checkbox', { name: 'Draft' })).toHaveAttribute(
    'aria-checked',
    'false',
  );
});

test('inherits provider disabled state and local disabled=false overrides it', () => {
  const onSelect = rstest.fn();
  const { rerender } = render(
    <TaoProvider disabled>
      <Tree treeData={nodes} onSelect={onSelect} />
    </TaoProvider>,
  );
  fireEvent.click(screen.getByText('Project'));
  expect(onSelect).not.toHaveBeenCalled();
  expect(screen.getByRole('treeitem')).toHaveAttribute('aria-disabled', 'true');
  rerender(
    <TaoProvider disabled>
      <Tree treeData={nodes} disabled={false} onSelect={onSelect} />
    </TaoProvider>,
  );
  fireEvent.click(screen.getByText('Project'));
  expect(onSelect).toHaveBeenCalledTimes(1);
});

test('disabled checkboxes and non-selectable nodes do not emit selection', () => {
  const onCheck = rstest.fn();
  const onSelect = rstest.fn();
  render(
    <Tree
      treeData={[
        {
          key: 'locked',
          title: 'Locked',
          disableCheckbox: true,
          selectable: false,
        },
      ]}
      checkable
      onCheck={onCheck}
      onSelect={onSelect}
    />,
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Locked' }));
  fireEvent.click(screen.getByText('Locked'));
  expect(onCheck).not.toHaveBeenCalled();
  expect(onSelect).not.toHaveBeenCalled();
});

test('supports custom data fields and preserves original node data in callbacks', () => {
  const onSelect = rstest.fn();
  const data = [
    {
      id: 'root',
      label: 'Root',
      childrenList: [
        { id: 'leaf', label: 'Leaf', isLeaf: true, detail: 'kept' },
      ],
    },
  ];
  render(
    <Tree
      treeData={data}
      fieldNames={{ key: 'id', title: 'label', children: 'childrenList' }}
      defaultExpandAll
      onSelect={onSelect}
    />,
  );
  fireEvent.click(screen.getByText('Leaf'));
  expect(onSelect.mock.calls[0][0]).toEqual(['leaf']);
  expect(onSelect.mock.calls[0][1].node).toMatchObject({
    id: 'leaf',
    detail: 'kept',
  });
});

test('loads children asynchronously and reports the loaded key', async () => {
  const onLoad = rstest.fn();
  const load = rstest.fn();
  function LazyTree() {
    const [data, setData] = useState<DataNode[]>([
      { key: 'folder', title: 'Folder' },
    ]);
    return (
      <Tree
        treeData={data}
        onLoad={onLoad}
        loadData={async (node) => {
          load(node.key);
          await Promise.resolve();
          setData([
            {
              key: 'folder',
              title: 'Folder',
              children: [{ key: 'remote', title: 'Remote file', isLeaf: true }],
            },
          ]);
        }}
      />
    );
  }
  render(<LazyTree />);
  fireEvent.click(
    screen
      .getByText('Folder')
      .closest('[role="treeitem"]')!
      .querySelector('[data-tao-tree-switcher]')!,
  );
  await waitFor(() => expect(screen.getByText('Remote file')).toBeVisible());
  expect(load).toHaveBeenCalledWith('folder');
  expect(onLoad.mock.calls[0][0]).toEqual(['folder']);
});

test('keyboard focus can expand and select a child', () => {
  const onSelect = rstest.fn();
  render(
    <Tree treeData={nodes} onSelect={onSelect} aria-label="Project files" />,
  );
  const tree = screen.getByRole('tree', { name: 'Project files' });
  fireEvent.focus(tree);
  fireEvent.keyDown(tree, { key: 'ArrowDown', keyCode: 40 });
  fireEvent.keyDown(tree, { key: 'ArrowRight', keyCode: 39 });
  expect(screen.getByText('Draft')).toBeVisible();
  fireEvent.keyDown(tree, { key: 'ArrowDown', keyCode: 40 });
  fireEvent.keyDown(tree, { key: 'Enter', keyCode: 13 });
  expect(onSelect.mock.calls[0][0]).toEqual(['draft']);
});

test('semantic functions receive resolved defaults and customize every public slot', () => {
  const classNames: TreeProps['classNames'] = ({ props }) => ({
    root: props.disabled ? 'disabled-root' : 'enabled-root',
    item: 'custom-item',
    itemIcon: 'custom-icon',
    itemTitle: 'custom-title',
    itemSwitcher: 'custom-switcher',
  });
  const { container } = render(
    <Tree
      treeData={nodes}
      showIcon
      icon={<span>file icon</span>}
      className="caller-root"
      classNames={classNames}
      styles={{ root: { maxWidth: 300 }, itemTitle: { fontWeight: 700 } }}
    />,
  );
  expect(container.querySelector('[data-tao-tree]')).toHaveClass(
    'caller-root',
    'enabled-root',
  );
  expect(container.querySelector('[data-tao-tree]')).toHaveStyle({
    maxWidth: '300px',
  });
  for (const name of [
    'custom-item',
    'custom-icon',
    'custom-title',
    'custom-switcher',
  ])
    expect(container.querySelector(`.${name}`)).not.toBeNull();
  expect(screen.getByText('Project')).toHaveStyle({ fontWeight: '700' });
});

test('supports JSX TreeNode children and custom leaf/switcher icons', () => {
  render(
    <Tree
      showLine={{ showLeafIcon: <span>Leaf glyph</span> }}
      defaultExpandAll
      switcherIcon={<span>Branch glyph</span>}
    >
      <Tree.TreeNode key="parent" title="Parent">
        <Tree.TreeNode key="child" title="Child" isLeaf />
      </Tree.TreeNode>
    </Tree>,
  );
  expect(screen.getByText('Branch glyph')).toBeVisible();
  expect(screen.getByText('Leaf glyph')).toBeVisible();
  expect(screen.getByText('Child')).toBeVisible();
});

test('draggable config respects its node predicate and optional handle', () => {
  const onDragStart = rstest.fn();
  const { container } = render(
    <Tree
      treeData={nodes}
      defaultExpandAll
      draggable={{ icon: false, nodeDraggable: (node) => node.key === 'draft' }}
      onDragStart={onDragStart}
    />,
  );
  const draft = screen.getByText('Draft').closest('[role="treeitem"]')!;
  expect(draft).toHaveAttribute('draggable', 'true');
  expect(
    screen.getByText('Published').closest('[role="treeitem"]'),
  ).toHaveAttribute('draggable', 'false');
  expect(container.querySelector('[data-tao-tree-drag-icon]')).toBeNull();
  fireEvent.dragStart(draft, {
    dataTransfer: { setData: rstest.fn(), effectAllowed: 'move' },
  });
  expect(onDragStart.mock.calls[0][0].node.key).toBe('draft');
  fireEvent.dragEnd(draft);
});

test('exposes virtual scroll ref and useTree paths that read updated data', async () => {
  const ref = createRef<TreeRef>();
  render(<Tree ref={ref} treeData={nodes} height={80} defaultExpandAll />);
  expect(typeof ref.current?.scrollTo).toBe('function');
  await act(async () => {
    ref.current?.scrollTo({ key: 'draft', align: 'top', autoExpand: true });
  });
  const { result, rerender } = renderHook(
    ({ data }) => Tree.useTree(data, {}),
    { initialProps: { data: nodes } },
  );
  const getPath = result.current.getPath;
  expect(getPath('draft').map((node) => node.key)).toEqual([
    'project',
    'draft',
  ]);
  rerender({
    data: [{ key: 'other', children: [{ key: 'draft', title: 'Moved' }] }],
  });
  expect(result.current.getPath).toBe(getPath);
  expect(getPath('draft').map((node) => node.key)).toEqual(['other', 'draft']);
});

test('DirectoryTree expands on click and selects one item without modifiers', () => {
  const onSelect = rstest.fn();
  render(<Tree.DirectoryTree treeData={nodes} multiple onSelect={onSelect} />);
  fireEvent.click(screen.getByText('Project'));
  expect(screen.getByText('Draft')).toBeVisible();
  fireEvent.click(screen.getByText('Draft'));
  expect(onSelect.mock.calls[1][0]).toEqual(['draft']);
  expect(onSelect.mock.calls[1][1].selected).toBe(true);
});

test('DirectoryTree modifier and range selection skip disabled nodes', () => {
  const onSelect = rstest.fn();
  const data = [
    { key: 'a', title: 'A', isLeaf: true },
    { key: 'b', title: 'B', disabled: true, isLeaf: true },
    { key: 'c', title: 'C', isLeaf: true },
    { key: 'd', title: 'D', isLeaf: true },
  ];
  render(<Tree.DirectoryTree treeData={data} multiple onSelect={onSelect} />);
  fireEvent.click(screen.getByText('A'));
  fireEvent.click(screen.getByText('C'), { shiftKey: true });
  expect(onSelect.mock.calls[1][0]).toEqual(['a', 'c']);
  fireEvent.click(screen.getByText('D'), { ctrlKey: true });
  expect(onSelect.mock.calls[2][0]).toEqual(['a', 'c', 'd']);
  expect(
    onSelect.mock.calls[2][1].selectedNodes.map((node: DataNode) => node.key),
  ).toEqual(['a', 'c', 'd']);
});

test('DirectoryTree expandAction=false and controlled expanded keys are respected', () => {
  const onExpand = rstest.fn();
  const { rerender } = render(
    <Tree.DirectoryTree
      treeData={nodes}
      expandAction={false}
      onExpand={onExpand}
    />,
  );
  fireEvent.click(screen.getByText('Project'));
  expect(screen.queryByText('Draft')).toBeNull();
  expect(onExpand).not.toHaveBeenCalled();
  rerender(
    <Tree.DirectoryTree
      treeData={nodes}
      expandedKeys={[]}
      onExpand={onExpand}
    />,
  );
  fireEvent.click(screen.getByText('Project'));
  expect(onExpand.mock.calls[0][0]).toEqual(['project']);
  expect(screen.queryByText('Draft')).toBeNull();
});

test('drop callbacks expose source and target data and allowDrop can veto', () => {
  const onDrop = rstest.fn();
  const data = [
    { key: 'one', title: 'One' },
    { key: 'two', title: 'Two' },
  ];
  const { rerender } = render(
    <Tree treeData={data} draggable onDrop={onDrop} />,
  );
  const source = screen.getByText('One').closest('[role="treeitem"]')!;
  const target = screen.getByText('Two').closest('[role="treeitem"]')!;
  const drag = {
    clientX: 0,
    clientY: 10,
    dataTransfer: { setData: rstest.fn() },
  };
  fireEvent.dragStart(source, drag);
  fireEvent.dragEnter(target, drag);
  fireEvent.dragOver(target, drag);
  fireEvent.drop(target, drag);
  expect(onDrop).toHaveBeenCalledTimes(1);
  expect(onDrop.mock.calls[0][0]).toMatchObject({
    node: { key: 'two' },
    dragNode: { key: 'one' },
    dragNodesKeys: ['one'],
  });
  fireEvent.dragEnd(source);
  rerender(
    <Tree treeData={data} draggable onDrop={onDrop} allowDrop={() => false} />,
  );
  fireEvent.dragStart(source, drag);
  fireEvent.dragEnter(target, drag);
  fireEvent.drop(target, drag);
  expect(onDrop).toHaveBeenCalledTimes(1);
  fireEvent.dragEnd(source);
});

test('virtual trees only mount the visible window and scrollTo reveals a distant key', async () => {
  const ref = createRef<TreeRef>();
  // happy-dom has no layout; supply the public viewport geometry for virtual scrolling.
  const clientHeight = rstest
    .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
    .mockReturnValue(100);
  const offsetHeight = rstest
    .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
    .mockReturnValue(28);
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get: () => document.body,
  });
  const { unmount } = render(
    <Tree
      ref={ref}
      height={100}
      treeData={Array.from({ length: 200 }, (_, index) => ({
        key: index,
        title: `Item ${index}`,
      }))}
    />,
  );
  try {
    expect(screen.getAllByRole('treeitem').length).toBeLessThan(200);
    expect(screen.queryByText('Item 150')).toBeNull();
    await act(async () => ref.current?.scrollTo({ key: 150, align: 'top' }));
    await waitFor(() =>
      expect(screen.getByText('Item 150')).toBeInTheDocument(),
    );
  } finally {
    unmount();
    clientHeight.mockRestore();
    offsetHeight.mockRestore();
    Reflect.deleteProperty(HTMLElement.prototype, 'offsetParent');
  }
});

test('failed asynchronous loading clears its loading state without onLoad success', async () => {
  const onLoad = rstest.fn();
  const loadData = rstest.fn(() => Promise.reject(new Error('Load failed')));
  const { container } = render(
    <Tree
      treeData={[{ key: 'remote', title: 'Remote' }]}
      loadData={loadData}
      onLoad={onLoad}
    />,
  );
  await act(async () =>
    fireEvent.click(container.querySelector('[data-tao-tree-switcher]')!),
  );
  await waitFor(() =>
    expect(container.querySelector('[data-tao-loading]')).toBeNull(),
  );
  expect(loadData).toHaveBeenCalledTimes(1);
  expect(onLoad).not.toHaveBeenCalled();
});

test.each(['ltr', 'rtl'] as const)(
  'tree horizontal keys follow %s direction without changing public events',
  (direction) => {
    const keys: string[] = [];
    const bubbled: string[] = [];
    const ref = createRef<TreeRef>();
    render(
      <fieldset onKeyDown={(event) => bubbled.push(event.key)}>
        <Tree
          ref={ref}
          direction={direction}
          treeData={nodes}
          onKeyDown={(event) => keys.push(event.key)}
        />
      </fieldset>,
    );
    const tree = screen.getByRole('tree');
    fireEvent.focus(tree);
    fireEvent.keyDown(tree, { key: 'ArrowDown', keyCode: 40 });
    const expand = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const collapse = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    fireEvent.keyDown(tree, {
      key: expand,
      keyCode: direction === 'rtl' ? 37 : 39,
    });
    expect(screen.getByText('Draft')).toBeVisible();
    fireEvent.keyDown(tree, {
      key: collapse,
      keyCode: direction === 'rtl' ? 39 : 37,
    });
    expect(screen.queryByText('Draft')).toBeNull();
    expect(keys).toEqual(['ArrowDown', expand, collapse]);
    expect(bubbled).toEqual(keys);
    expect(typeof ref.current?.scrollTo).toBe('function');
  },
);
