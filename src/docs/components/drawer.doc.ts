import type { ComponentDoc } from '../component-doc';

export const drawerDoc = {
  name: 'drawer',
  displayName: 'Drawer',
  category: 'Feedback',
  description:
    'Opens a side panel for related tasks without leaving the current page.',
  exports: ['Drawer'],
  source: 'src/components/drawer/drawer.tsx',
  story: 'stories/drawer.stories.tsx',
  tests: ['tests/drawer/drawer.test.tsx'],
  semanticParts: [
    'root',
    'overlay',
    'header',
    'title',
    'extra',
    'body',
    'footer',
    'close',
    'dragger',
  ],
  keywords: ['panel', 'overlay', 'side sheet'],
  related: ['Modal'],
  usage: {
    description:
      'Use Drawer for inspection, editing, or supporting workflows that should stay connected to the current page.',
    bestPractices: [
      'Use a clear title and predictable close affordance.',
      'Keep destructive confirmations in a dedicated confirmation step.',
    ],
    avoid: ['Do not stack multiple drawers for a single workflow.'],
  },
} satisfies ComponentDoc;
