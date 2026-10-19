import type { ComponentDoc } from '../component-doc';

export const tableDoc = {
  name: 'table',
  displayName: 'Table',
  category: 'Data Display',
  description:
    'Displays structured row and column data with selection, sorting, filtering, expandable rows, summary rows, a pinned header, and pagination hooks.',
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
    'expandedRow',
    'summary',
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
      'Gate secondary columns with column.responsive (e.g. [\'lg\']) instead of hand-rolled media queries.',
    ],
    avoid: [
      'Do not use Table for card-like content where comparison is not important.',
    ],
  },
} satisfies ComponentDoc;
