import type { ComponentDoc } from '../component-doc';

export const resultDoc = {
  name: 'result',
  displayName: 'Result',
  category: 'Feedback',
  description:
    'Communicates an operation result or error page with status, explanation and next actions.',
  exports: ['Result'],
  source: 'src/components/result/result.tsx',
  story: 'stories/result.stories.tsx',
  tests: ['tests/result/result.test.tsx'],
  semanticParts: ['root', 'title', 'subTitle', 'body', 'extra', 'icon'],
  keywords: ['result', 'feedback', 'status'],
  related: ['Button', 'Empty'],
  usage: {
    description:
      'Communicates an operation result or error page with status, explanation and next actions.',
    bestPractices: [
      'Explain the current state and offer a useful next action.',
      'Keep descriptions concise and localized.',
    ],
    avoid: [
      'Do not replace an actionable error with an unexplained empty state.',
    ],
  },
} satisfies ComponentDoc;
