import type { ComponentDoc } from '../component-doc';
export const listDoc = {
  name: 'list',
  displayName: 'List',
  category: 'Data Display',
  description:
    'Displays records with metadata, actions, loading, pagination and responsive columns.',
  exports: ['List'],
  source: 'src/components/list/list.tsx',
  story: 'stories/list.stories.tsx',
  tests: ['tests/list/list.test.tsx'],
  semanticParts: ['root', 'header', 'items', 'footer', 'pagination', 'empty'],
  keywords: ['list', 'records', 'pagination'],
  related: ['Card', 'Listy', 'Empty'],
  usage: {
    description: 'Compose repeated content with List.Item and List.Item.Meta.',
    bestPractices: [
      'Supply stable row keys for changing records.',
      'Use a responsive grid for cards and pagination for bounded pages.',
    ],
    avoid: ['Use Listy with virtualization for very large scrollable lists.'],
  },
} satisfies ComponentDoc;
