import type { ComponentDoc } from '../component-doc';
export const cascaderDoc = {
  name: 'cascader',
  displayName: 'Cascader',
  category: 'Data Entry',
  description:
    'Choose paths through hierarchical options with search, lazy loading, multiple selection and an inline panel.',
  exports: ['Cascader', 'CascaderPanel'],
  source: 'src/components/cascader/cascader.tsx',
  story: 'stories/cascader.stories.tsx',
  tests: ['tests/cascader/cascader.test.tsx'],
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
    'popup.list',
    'popup.listItem',
  ],
  keywords: ['cascade', 'select', 'path', 'hierarchy', 'location'],
  related: ['TreeSelect', 'Select'],
  usage: {
    description:
      'Use Cascader when users select a complete path such as region, department or category.',
    bestPractices: [
      'Use stable values at each level.',
      'Enable changeOnSelect when parent paths are valid choices.',
      'Use Cascader.Panel when the hierarchy should stay visible.',
    ],
    avoid: [
      'Do not combine lazy loadData with search over unloaded options.',
      'Do not flatten paths before handling onChange.',
    ],
  },
} satisfies ComponentDoc;
