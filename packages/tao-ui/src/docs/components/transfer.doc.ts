import type { ComponentDoc } from '../component-doc';
export const transferDoc = {
  name: 'transfer',
  displayName: 'Transfer',
  category: 'Data Entry',
  description:
    'Moves selected records between searchable, paginated source and target lists.',
  exports: ['Transfer'],
  source: 'src/components/transfer/transfer.tsx',
  story: 'stories/transfer.stories.tsx',
  tests: ['tests/transfer/transfer.test.tsx'],
  semanticParts: [
    'root',
    'section',
    'header',
    'title',
    'body',
    'list',
    'item',
    'itemIcon',
    'itemContent',
    'footer',
    'actions',
  ],
  keywords: ['transfer', 'selection', 'dual-list'],
  related: ['Checkbox', 'List', 'Table'],
  usage: {
    description:
      'Assign records by moving them between source and target lists.',
    bestPractices: [
      'Keep targetKeys controlled and update them in onChange.',
      'Use stable keys and searchable labels for large data sets.',
    ],
    avoid: [
      'Do not treat selectedKeys as assigned items; only targetKeys represents the target list.',
    ],
  },
} satisfies ComponentDoc;
