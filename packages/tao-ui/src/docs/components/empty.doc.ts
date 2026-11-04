import type { ComponentDoc } from '../component-doc';

export const emptyDoc = {
  name: 'empty',
  displayName: 'Empty',
  category: 'Data Display',
  description:
    'Shows a localized empty state with an illustration, description and optional action.',
  exports: ['Empty'],
  source: 'src/components/empty/empty.tsx',
  story: 'stories/empty.stories.tsx',
  tests: ['tests/empty/empty.test.tsx'],
  semanticParts: ['root', 'image', 'description', 'footer'],
  keywords: ['empty', 'feedback', 'status'],
  related: ['Button', 'Result'],
  usage: {
    description:
      'Shows a localized empty state with an illustration, description and optional action.',
    bestPractices: [
      'Explain the current state and offer a useful next action.',
      'Keep descriptions concise and localized.',
    ],
    avoid: [
      'Do not replace an actionable error with an unexplained empty state.',
    ],
  },
} satisfies ComponentDoc;
