import { createRef } from 'react';
import {
  TreeSelect,
  type TreeSelectDataNode,
  type TreeSelectProps,
  type TreeSelectRef,
} from '../../src/components/tree-select/tree-select';

interface Team extends TreeSelectDataNode {
  value: string;
  title: string;
  members: number;
}
const props: TreeSelectProps<string, Team> = {
  treeData: [{ value: 'a', title: 'A', members: 3 }],
  onChange: (value) => {
    const selected: string = value;
    void selected;
  },
  onSelect: (_value, node) => {
    const size: number = node.members;
    void size;
  },
  treeTitleRender: (node) => `${node.title} (${node.members})`,
};
const ref = createRef<TreeSelectRef>();
<TreeSelect<string, Team>
  {...props}
  ref={ref}
  classNames={({ props }) => ({
    root: props.disabled ? 'disabled' : '',
    popup: { itemSwitcher: 'switcher' },
  })}
/>;
ref.current?.focus();
<TreeSelect
  treeCheckable
  treeCheckStrictly
  treeLine={{ showLeafIcon: false }}
  showSearch={{ treeNodeFilterProp: 'title' }}
/>;
<TreeSelect>
  <TreeSelect.TreeNode value="a" title="A" />
</TreeSelect>;
// @ts-expect-error Invalid semantic slot.
<TreeSelect styles={{ nonexistent: {} }} />;
// @ts-expect-error String value contract rejects numbers.
<TreeSelect<string> value={3} />;

<TreeSelect size="middle" />;
<TreeSelect size="medium" />;
// @ts-expect-error Invalid public size.
<TreeSelect size="normal" />;
