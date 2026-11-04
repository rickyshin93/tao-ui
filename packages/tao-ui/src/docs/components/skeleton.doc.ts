import type { ComponentDoc } from '../component-doc';

export const skeletonDoc = {
  name: 'skeleton',
  displayName: 'Skeleton',
  category: 'Feedback',
  description:
    'Displays theme-aware loading placeholders for content, avatars, controls and images.',
  exports: ['Skeleton'],
  source: 'src/components/skeleton/skeleton.tsx',
  story: 'stories/skeleton.stories.tsx',
  tests: ['tests/skeleton/skeleton.test.tsx'],
  semanticParts: ['root', 'header', 'section', 'avatar', 'title', 'paragraph'],
  keywords: ['skeleton', 'feedback', 'loading'],
  related: ['Spinner', 'Progress'],
  usage: {
    description:
      'Displays theme-aware loading placeholders for content, avatars, controls and images.',
    bestPractices: [
      'Choose a shape that matches the content and available space.',
      'Provide meaningful labels and real loading state.',
    ],
    avoid: [
      'Do not show fabricated progress or leave loading states unresolved.',
    ],
  },
} satisfies ComponentDoc;
