import type { ComponentDoc } from '../component-doc';
export const treeSelectDoc = {
  name: 'tree-select',
  displayName: 'TreeSelect',
  category: 'Data Entry',
  description:
    'Select hierarchical values with search, checkable trees, lazy loading and virtual scrolling.',
  exports: ['TreeSelect'],
  source: 'src/components/tree-select/tree-select.tsx',
  story: 'stories/tree-select.stories.tsx',
  tests: ['tests/tree-select/tree-select.test.tsx'],
  semanticParts: [
    'root',
    'prefix',
    'suffix',
    'input',
    'clear',
    'placeholder',
    'content',
    'item',
    'itemContent',
    'itemRemove',
    'popup.root',
    'popup.item',
    'popup.itemTitle',
    'popup.itemSwitcher',
  ],
  keywords: ['tree', 'select', 'hierarchy', 'search', 'checkbox'],
  related: ['Tree', 'Cascader', 'Select'],
  usage: {
    description:
      'Use TreeSelect when a form value comes from a hierarchy and users need to search or check multiple nodes.',
    bestPractices: [
      'Give every node a unique value.',
      'Use showSearch.treeNodeFilterProp to search meaningful labels.',
      'Use treeCheckStrictly for independent parent and child values.',
    ],
    avoid: [
      'Do not use default expansion props to control asynchronously arriving data.',
      'Do not expect loadData to run while filtering.',
    ],
  },
} satisfies ComponentDoc;
