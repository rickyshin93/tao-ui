import { createRef } from 'react';
import {
  type BasicDataNode,
  type DirectoryTreeProps,
  Tree,
  type TreeProps,
  type TreeRef,
} from '../../src/components/tree/tree';

interface FileNode extends BasicDataNode {
  id: string;
  label: string;
  bytes: number;
  files?: FileNode[];
}

const files: FileNode[] = [{ id: 'readme', label: 'README.md', bytes: 120 }];
const props: TreeProps<FileNode> = {
  treeData: files,
  fieldNames: { key: 'id', title: 'label', children: 'files' },
  titleRender: (node) => `${node.label} (${node.bytes})`,
  onSelect: (_keys, info) => {
    const bytes: number = info.node.bytes;
    return bytes;
  },
  onCheck: (_keys, info) => {
    const first: FileNode | undefined = info.checkedNodes[0];
    return first;
  },
  classNames: ({ props: resolved }) => ({
    root: resolved.disabled ? 'disabled' : 'enabled',
  }),
  styles: { itemTitle: { fontWeight: 600 } },
};
const ref = createRef<TreeRef>();
<Tree<FileNode> {...props} ref={ref} />;
ref.current?.scrollTo({ key: 'readme', align: 'top', autoExpand: true });
const directory: DirectoryTreeProps<FileNode> = {
  ...props,
  expandAction: 'doubleClick',
};
<Tree.DirectoryTree {...directory} />;
<Tree>
  <Tree.TreeNode key="leaf" title="Leaf" isLeaf />
</Tree>;

function HookContract() {
  const tree = Tree.useTree(files, { fieldNames: props.fieldNames });
  const path = tree.getPath('readme');
  const bytes: number | undefined = path[0]?.node.bytes;
  return <span>{bytes}</span>;
}
void HookContract;

// @ts-expect-error Keys do not accept arbitrary data objects.
<Tree checkedKeys={[{ key: 'readme' }]} />;
// @ts-expect-error Directory expansion actions are explicit string literals.
<Tree.DirectoryTree expandAction="hover" />;
// @ts-expect-error Semantic keys must name actual Tree slots.
<Tree styles={{ unknown: { color: 'red' } }} />;
