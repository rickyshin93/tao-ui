import type { ComponentDoc } from '../component-doc';

export const tagDoc = {
  name: 'tag',
  displayName: 'Tag',
  category: 'Data Display',
  description:
    'Displays compact labels, statuses, categories, or checkable chips.',
  exports: ['Tag', 'CheckableTag'],
  source: 'src/components/tag/tag.tsx',
  story: 'stories/tag.stories.tsx',
  tests: ['tests/tag/tag.test.tsx'],
  semanticParts: ['root', 'icon', 'close'],
  keywords: ['badge', 'chip', 'status', 'label'],
  related: ['Checkbox', 'Table'],
  usage: {
    description:
      'Use Tag for lightweight metadata or status markers. Use CheckableTag for compact filter choices.',
    bestPractices: [
      'Use semantic colors consistently.',
      'Keep tag text short.',
    ],
    avoid: ['Do not encode critical state by color alone.'],
  },
} satisfies ComponentDoc;
