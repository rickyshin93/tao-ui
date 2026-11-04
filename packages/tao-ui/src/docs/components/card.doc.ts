import type { ComponentDoc } from '../component-doc';
export const cardDoc = {
  name: 'card',
  displayName: 'Card',
  category: 'Data Display',
  description:
    'Groups related content with an optional heading, cover, tabs and actions.',
  exports: ['Card'],
  source: 'src/components/card/card.tsx',
  story: 'stories/card.stories.tsx',
  tests: ['tests/card/card.test.tsx'],
  semanticParts: [
    'root',
    'header',
    'body',
    'extra',
    'title',
    'actions',
    'cover',
  ],
  keywords: ['container', 'content', 'metadata', 'panel'],
  usage: {
    description:
      'Use Card for a distinct content item; Card.Meta organizes its identity and description.',
    bestPractices: ['Keep titles short and actions specific.'],
    avoid: ['Do not wrap every page section in nested cards.'],
  },
} satisfies ComponentDoc;
