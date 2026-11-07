import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Tree } from '../../src/components/tree/tree';

const data = [
  { key: 'a', title: 'Alpha', isLeaf: true },
  { key: 'b', title: 'Beta', isLeaf: true },
  { key: 'c', title: 'Gamma', isLeaf: true },
];

test.each(['ctrlKey', 'metaKey'] as const)(
  'DirectoryTree reports deselection with %s',
  (modifier) => {
    const onSelect = rs.fn();
    render(<Tree.DirectoryTree treeData={data} multiple onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Alpha'));
    fireEvent.click(screen.getByText('Alpha'), { [modifier]: true });
    expect(onSelect).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({ selected: false, selectedNodes: [] }),
    );
  },
);

test('DirectoryTree first Shift click selects a node and establishes a range anchor', () => {
  const onSelect = rs.fn();
  render(<Tree.DirectoryTree treeData={data} multiple onSelect={onSelect} />);
  fireEvent.click(screen.getByText('Beta'), { shiftKey: true });
  expect(onSelect).toHaveBeenLastCalledWith(
    ['b'],
    expect.objectContaining({ selected: true, selectedNodes: [data[1]] }),
  );
  fireEvent.click(screen.getByText('Gamma'), { shiftKey: true });
  expect(onSelect).toHaveBeenLastCalledWith(
    ['b', 'c'],
    expect.objectContaining({
      selected: true,
      selectedNodes: [data[1], data[2]],
    }),
  );
});

test('DirectoryTree modifier selection does not report a deleted node', () => {
  const onSelect = rs.fn();
  const view = render(
    <Tree.DirectoryTree treeData={data} multiple onSelect={onSelect} />,
  );
  fireEvent.click(screen.getByText('Alpha'));
  view.rerender(
    <Tree.DirectoryTree treeData={data.slice(1)} multiple onSelect={onSelect} />,
  );
  fireEvent.click(screen.getByText('Beta'), { ctrlKey: true });
  expect(onSelect).toHaveBeenLastCalledWith(
    ['b'],
    expect.objectContaining({ selectedNodes: [data[1]] }),
  );
});

test('DirectoryTree Shift click recovers after its anchor is removed', () => {
  const onSelect = rs.fn();
  const view = render(
    <Tree.DirectoryTree treeData={data} multiple onSelect={onSelect} />,
  );
  fireEvent.click(screen.getByText('Alpha'));
  view.rerender(
    <Tree.DirectoryTree
      treeData={data.slice(1)}
      multiple
      onSelect={onSelect}
    />,
  );
  fireEvent.click(screen.getByText('Beta'), { shiftKey: true });
  expect(onSelect).toHaveBeenLastCalledWith(
    ['b'],
    expect.objectContaining({ selected: true, selectedNodes: [data[1]] }),
  );
});

test.each(['Enter', ' '])(
  'DirectoryTree multiple selection supports the %j key',
  (key) => {
    const onSelect = rs.fn();
    render(<Tree.DirectoryTree treeData={data} multiple onSelect={onSelect} />);
    const tree = screen.getByRole('tree');
    fireEvent.focus(tree);
    fireEvent.keyDown(tree, { key });
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(
      ['a'],
      expect.objectContaining({ selected: true }),
    );
  },
);

test('DirectoryTree Shift selection cannot reintroduce a removed node', () => {
  const removed = { key: 'removed', title: 'Removed', isLeaf: true };
  const onSelect = rs.fn();
  const view = render(
    <Tree.DirectoryTree
      treeData={[removed, ...data]}
      multiple
      onSelect={onSelect}
    />,
  );
  fireEvent.click(screen.getByText('Removed'));
  fireEvent.click(screen.getByText('Alpha'), { metaKey: true });
  view.rerender(<Tree.DirectoryTree treeData={data} multiple onSelect={onSelect} />);
  fireEvent.click(screen.getByText('Gamma'), { shiftKey: true });
  expect(onSelect).toHaveBeenLastCalledWith(
    ['a', 'b', 'c'],
    expect.objectContaining({ selectedNodes: data }),
  );
});

test('DirectoryTree Shift selection respects replacement controlled keys', () => {
  const extra = [
    { key: 'd', title: 'Delta', isLeaf: true },
    { key: 'e', title: 'Echo', isLeaf: true },
  ];
  const onSelect = rs.fn();
  const renderTree = (selectedKeys: string[]) => (
    <Tree.DirectoryTree
      treeData={[...data, ...extra]}
      selectedKeys={selectedKeys}
      multiple
      onSelect={onSelect}
    />
  );
  const view = render(renderTree(['d']));
  fireEvent.click(screen.getByText('Alpha'), { metaKey: true });
  view.rerender(renderTree(['a', 'e']));
  fireEvent.click(screen.getByText('Gamma'), { shiftKey: true });
  expect(onSelect.mock.calls.at(-1)?.[0]).toEqual(['a', 'e', 'b', 'c']);
});

test.each([undefined, true])(
  'DirectoryTree Shift ranges include visible descendants (autoExpandParent=%s)',
  (autoExpandParent) => {
    const onSelect = rs.fn();
    render(
      <Tree.DirectoryTree
        multiple
        treeData={[
          data[0],
          { key: 'folder', title: 'Folder', children: [data[1]] },
          data[2],
        ]}
        expandedKeys={['b']}
        autoExpandParent={autoExpandParent}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText('Alpha'));
    fireEvent.click(screen.getByText('Beta'), { shiftKey: true });
    expect(onSelect).toHaveBeenLastCalledWith(
      ['a', 'folder', 'b'],
      expect.objectContaining({ selected: true }),
    );
  },
);
