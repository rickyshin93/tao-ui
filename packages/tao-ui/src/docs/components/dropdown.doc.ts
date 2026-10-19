import type { ComponentDoc } from '../component-doc';

export const dropdownDoc = {
  name: 'dropdown',
  displayName: 'Dropdown',
  category: 'Navigation',
  description: 'Opens a menu of actions or navigation choices from a trigger.',
  exports: ['Dropdown'],
  source: 'src/components/dropdown/dropdown.tsx',
  story: 'stories/dropdown.stories.tsx',
  tests: ['tests/dropdown/dropdown.test.tsx'],
  semanticParts: [
    'root',
    'content',
    'item',
    'itemIcon',
    'itemLabel',
    'itemExtra',
    'divider',
    'groupLabel',
    'subTrigger',
    'subContent',
  ],
  keywords: ['menu', 'actions', 'more'],
  related: ['ContextMenu', 'Select'],
  usage: {
    description:
      'Use Dropdown for compact action sets that do not need to stay visible.',
    bestPractices: [
      'Order frequent actions first.',
      'Use destructive styling only for destructive items.',
    ],
    avoid: [
      'Do not use Dropdown as a replacement for visible primary navigation.',
    ],
  },
} satisfies ComponentDoc;
