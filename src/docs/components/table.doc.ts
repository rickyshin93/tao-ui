import type { ComponentDoc } from '../component-doc';

export const tableDoc = {
  name: 'table',
  displayName: 'Table',
  category: 'Data Display',
  description:
    'Displays structured row and column data with selection, sorting, filtering, and pagination hooks.',
  exports: ['Table'],
  source: 'src/components/table/table.tsx',
  story: 'stories/table.stories.tsx',
  tests: ['tests/table/table.test.tsx'],
  semanticParts: [
    'root',
    'scroll',
    'table',
    'header.wrapper',
    'header.row',
    'header.cell',
    'header.content',
    'header.title',
    'body.row',
    'body.cell',
    'selection.cell',
    'empty',
    'pagination',
  ],
  keywords: ['data grid', 'rows', 'columns', 'sorting'],
  related: ['Pagination', 'ScrollArea'],
  usage: {
    description:
      'Use Table for dense, comparable records that benefit from aligned columns.',
    bestPractices: [
      'Keep columns focused on the task.',
      'Use stable row keys.',
      'Control sorting and pagination when data is remote.',
    ],
    avoid: [
      'Do not use Table for card-like content where comparison is not important.',
    ],
  },
} satisfies ComponentDoc;
