import type { ComponentDoc } from '../component-doc';

export const stackDoc = {
  name: 'stack',
  displayName: 'Stack',
  category: 'Layout',
  description:
    'Composes children in a flex row or column with consistent spacing.',
  exports: ['Stack'],
  source: 'src/layouts/stack/stack.tsx',
  story: 'stories/stack.stories.tsx',
  tests: ['tests/layouts/stack/stack.test.tsx'],
  semanticParts: ['root'],
  keywords: ['layout', 'flex', 'spacing'],
  related: ['Splitter', 'FormLayout'],
  usage: {
    description: 'Use Stack for simple one-dimensional layout and spacing.',
    bestPractices: [
      'Prefer Stack over one-off margin rules for repeated spacing.',
      'Use semantic containers when the layout has richer meaning.',
    ],
  },
} satisfies ComponentDoc;
