import type { ComponentDoc } from '../component-doc';
export const rateDoc = {
  name: 'rate',
  displayName: 'Rate',
  category: 'Data Entry',
  description:
    'Collects or displays a rating with half steps, keyboard control and custom symbols.',
  exports: ['Rate'],
  source: 'src/components/rate/rate.tsx',
  story: 'stories/rate.stories.tsx',
  tests: ['tests/rate/rate.test.tsx'],
  semanticParts: ['root', 'item'],
  keywords: ['rate', 'rating', 'stars'],
  related: ['Slider', 'Form'],
  usage: {
    description: 'Collect or show a bounded rating.',
    bestPractices: [
      'Label the rating with aria-label or aria-labelledby.',
      'Use readOnly for results and allowHalf only when precision is meaningful.',
    ],
    avoid: ['Do not rely on color alone to explain a rating scale.'],
  },
} satisfies ComponentDoc;
