import type { ComponentDoc } from '../component-doc';

export const spinnerDoc = {
  name: 'spinner',
  displayName: 'Spinner',
  category: 'Feedback',
  description: 'Indicates indeterminate loading activity.',
  exports: ['Spinner'],
  source: 'src/components/spinner/spinner.tsx',
  story: 'stories/spinner.stories.tsx',
  tests: ['tests/spinner/spinner.test.tsx'],
  semanticParts: ['root'],
  keywords: ['loading', 'progress', 'busy'],
  related: ['Button'],
  usage: {
    description:
      'Use Spinner for short indeterminate waits when progress cannot be measured.',
    bestPractices: [
      'Prefer inline placement near the content that is loading.',
      'Use aria labels for standalone spinners.',
    ],
    avoid: ['Do not use Spinner for determinate progress.'],
  },
} satisfies ComponentDoc;
