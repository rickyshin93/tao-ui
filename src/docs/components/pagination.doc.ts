import type { ComponentDoc } from '../component-doc';

export const paginationDoc = {
  name: 'pagination',
  displayName: 'Pagination',
  category: 'Navigation',
  description:
    'Moves through paged data with current page and page-size controls.',
  exports: ['Pagination'],
  source: 'src/components/pagination/pagination.tsx',
  story: 'stories/pagination.stories.tsx',
  tests: ['tests/pagination/pagination.test.tsx'],
  semanticParts: ['root', 'item', 'prev', 'next', 'sizeChanger'],
  keywords: ['pages', 'table', 'navigation'],
  related: ['Table'],
  usage: {
    description:
      'Use Pagination when a collection is split into pages rather than infinitely loaded.',
    bestPractices: [
      'Keep the current page controlled when data is loaded remotely.',
      'Show total counts when they help users judge scope.',
    ],
  },
} satisfies ComponentDoc;
