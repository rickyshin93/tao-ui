import type { ComponentDoc } from '../component-doc';
export const dividerDoc = {
  name: 'divider',
  displayName: 'Divider',
  category: 'Layout',
  description: 'Separates sections or inline actions with an optional title.',
  exports: ['Divider'],
  source: 'src/components/divider/divider.tsx',
  story: 'stories/divider.stories.tsx',
  tests: ['tests/divider/divider.test.tsx'],
  semanticParts: ['root', 'rail', 'content'],
  keywords: ['separator', 'line', 'section'],
  usage: {
    description:
      'Use a divider when spacing alone cannot explain a section boundary.',
    bestPractices: ['Use vertical dividers between short inline actions.'],
    avoid: ['Do not put titles inside vertical dividers.'],
  },
} satisfies ComponentDoc;
