import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { type DataNode, Tree } from '../src/components/tree/tree';

const meta: Meta = { title: '数据展示 Data Display/Tree' };
export default meta;

const treeData: DataNode[] = [
  {
    key: 'workspace',
    title: 'Workspace',
    children: [
      {
        key: 'design',
        title: 'Design',
        children: [
          { key: 'tokens', title: 'tokens.css', isLeaf: true },
          { key: 'guide', title: 'design-guide.md', isLeaf: true },
        ],
      },
      {
        key: 'docs',
        title: 'Documentation',
        children: [
          { key: 'start', title: 'getting-started.mdx', isLeaf: true },
        ],
      },
    ],
  },
];

export const Basic: StoryObj = {
  render: () => (
    <Tree
      aria-label="Workspace"
      treeData={treeData}
      defaultExpandedKeys={['workspace']}
      showLine
    />
  ),
};

export const Checkable: StoryObj = {
  render: function CheckableExample() {
    const [checked, setChecked] = useState<React.Key[]>(['tokens']);
    return (
      <>
        <Tree
          aria-label="Files to include"
          treeData={treeData}
          defaultExpandAll
          checkable
          checkedKeys={checked}
          onCheck={(keys) =>
            setChecked(Array.isArray(keys) ? keys : keys.checked)
          }
        />
        <output>Selected: {checked.join(', ') || 'none'}</output>
      </>
    );
  },
};

export const Directory: StoryObj = {
  render: () => (
    <Tree.DirectoryTree
      aria-label="Project files"
      treeData={treeData}
      defaultExpandAll
      multiple
    />
  ),
};

export const Virtual: StoryObj = {
  render: () => (
    <Tree
      aria-label="Indexed records"
      height={240}
      treeData={Array.from({ length: 1000 }, (_, index) => ({
        key: index,
        title: `Record ${index + 1}`,
      }))}
    />
  ),
};

export const AsyncLoading: StoryObj = {
  render: function LazyExample() {
    const [data, setData] = useState<DataNode[]>([
      { key: 'reports', title: 'Reports' },
    ]);
    return (
      <Tree
        aria-label="Reports"
        treeData={data}
        loadData={async () => {
          await new Promise((resolve) => setTimeout(resolve, 350));
          setData([
            {
              key: 'reports',
              title: 'Reports',
              children: [
                { key: 'summary', title: 'summary.pdf', isLeaf: true },
              ],
            },
          ]);
        }}
      />
    );
  },
};
