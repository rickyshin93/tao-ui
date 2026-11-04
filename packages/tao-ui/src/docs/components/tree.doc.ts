import type { ComponentDoc } from '../component-doc';

export const treeDoc = {
  name: 'tree',
  displayName: 'Tree',
  category: 'Data Display',
  description:
    'Navigate, select and check hierarchical data with keyboard navigation, lazy loading and virtual scrolling.',
  exports: ['Tree', 'DirectoryTree'],
  source: 'src/components/tree/tree.tsx',
  story: 'stories/tree.stories.tsx',
  tests: ['tests/tree/tree.test.tsx'],
  semanticParts: ['root', 'item', 'itemIcon', 'itemTitle', 'itemSwitcher'],
  keywords: ['tree', 'hierarchy', 'directory', 'files', 'selection'],
  related: ['TreeSelect', 'Cascader'],
  usage: {
    description:
      'Use Tree for hierarchical information. DirectoryTree adds file-explorer selection with Ctrl/Command and Shift modifiers.',
    bestPractices: [
      'Give every node a unique stable key.',
      'Use controlled expandedKeys when asynchronously supplied data needs expansion.',
      'Supply an accessible name and use height for large virtual trees.',
    ],
    avoid: [
      'Do not use defaultExpandAll to control data that arrives after mount.',
      'Do not assume parent and child checks are independent unless checkStrictly is enabled.',
    ],
  },
} satisfies ComponentDoc;
