import type { Meta, StoryObj } from '@storybook/react';
import { TreeSelect } from '../src/components/tree-select/tree-select';

const treeData = [
  {
    value: 'engineering',
    title: 'Engineering',
    children: [
      { value: 'platform', title: 'Platform' },
      { value: 'product', title: 'Product' },
    ],
  },
  { value: 'design', title: 'Design' },
];
const meta = {
  title: '数据录入 Data Entry/TreeSelect',
  component: TreeSelect,
  args: {
    treeData,
    placeholder: 'Choose a team',
    style: { width: 320 },
    treeDefaultExpandAll,
  },
} satisfies Meta<typeof TreeSelect>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {};
export const Checkable: Story = {
  args: {
    treeCheckable: true,
    showCheckedStrategy: TreeSelect.SHOW_PARENT,
    allowClear: true,
  },
};
export const Search: Story = {
  args: { showSearch: { treeNodeFilterProp: 'title' }, allowClear: true },
};
export const Strict: Story = {
  args: { treeCheckable: true, treeCheckStrictly: true },
};
export const Lines: Story = { args: { treeLine: true } };
