import type { ComponentDoc } from '../component-doc';

export const scrollAreaDoc = {
  name: 'scroll-area',
  displayName: 'ScrollArea',
  category: 'Data Display',
  description: 'Provides a styled scroll container for overflow content.',
  exports: ['ScrollArea'],
  source: 'src/components/scroll-area/scroll-area.tsx',
  story: 'stories/scroll-area.stories.tsx',
  tests: ['tests/scroll-area/scroll-area.test.tsx'],
  semanticParts: ['root', 'viewport', 'scrollbar', 'thumb'],
  keywords: ['scroll', 'overflow', 'viewport'],
  related: ['Table'],
  usage: {
    description:
      'Use ScrollArea when a fixed region needs overflow behavior without changing page scroll.',
    bestPractices: [
      'Constrain height explicitly.',
      'Avoid hiding important actions below a small scroll region.',
    ],
  },
} satisfies ComponentDoc;
