import type { ComponentDoc } from '../component-doc';
export const carouselDoc = {
  name: 'carousel',
  displayName: 'Carousel',
  category: 'Data Display',
  description:
    'Swipeable slides with fade, directional dots, autoplay, arrows and imperative navigation.',
  exports: ['Carousel'],
  source: 'src/components/carousel/carousel.tsx',
  story: 'stories/carousel.stories.tsx',
  tests: ['tests/carousel/carousel.test.tsx'],
  semanticParts: ['root', 'dots'],
  usage: {
    description:
      'Swipeable slides with fade, directional dots, autoplay, arrows and imperative navigation.',
    bestPractices: [
      'Provide meaningful labels and concise content.',
      'Keep controlled state synchronized through the change callbacks.',
    ],
  },
} satisfies ComponentDoc;
