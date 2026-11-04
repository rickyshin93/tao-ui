import type { ComponentDoc } from '../component-doc';

export const progressDoc = {
  name: 'progress',
  displayName: 'Progress',
  category: 'Feedback',
  description:
    'Shows measured completion with line, circle, dashboard or stepped progress indicators.',
  exports: ['Progress'],
  source: 'src/components/progress/progress.tsx',
  story: 'stories/progress.stories.tsx',
  tests: ['tests/progress/progress.test.tsx'],
  semanticParts: ['root', 'body', 'rail', 'track', 'indicator'],
  keywords: ['progress', 'feedback', 'loading'],
  related: ['Spinner', 'Skeleton'],
  usage: {
    description:
      'Shows measured completion with line, circle, dashboard or stepped progress indicators.',
    bestPractices: [
      'Choose a shape that matches the content and available space.',
      'Provide meaningful labels and real loading state.',
    ],
    avoid: [
      'Do not show fabricated progress or leave loading states unresolved.',
    ],
  },
} satisfies ComponentDoc;
