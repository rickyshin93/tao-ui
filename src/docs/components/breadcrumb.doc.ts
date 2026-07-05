import type { ComponentDoc } from '../component-doc';

export const breadcrumbDoc = {
  name: 'breadcrumb',
  displayName: 'Breadcrumb',
  category: 'Navigation',
  description: 'Renders the user location in a hierarchy of pages or views.',
  exports: ['Breadcrumb'],
  source: 'src/components/breadcrumb/breadcrumb.tsx',
  story: 'stories/breadcrumb.stories.tsx',
  tests: ['tests/breadcrumb/breadcrumb.test.tsx'],
  semanticParts: ['root', 'list', 'item', 'link', 'separator'],
  keywords: ['navigation', 'path', 'hierarchy'],
  related: ['Tabs', 'Dropdown'],
  usage: {
    description:
      'Use Breadcrumb near the top of a page when users need to understand or move through nested context.',
    bestPractices: [
      'Keep labels short and recognizable.',
      'Use links for ancestors and plain text for the current item.',
    ],
    avoid: ['Do not use Breadcrumb as primary navigation.'],
  },
  props: [
    {
      name: 'items',
      type: 'BreadcrumbItemType[]',
      description: 'Ordered breadcrumb items.',
    },
    {
      name: 'separator',
      type: 'ReactNode',
      description: 'Custom separator between items.',
    },
  ],
} satisfies ComponentDoc;
