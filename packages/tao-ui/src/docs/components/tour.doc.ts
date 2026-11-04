import type { ComponentDoc } from '../component-doc';
export const tourDoc = {
  name: 'tour',
  displayName: 'Tour',
  category: 'Feedback',
  description:
    'Guided steps anchored to page elements with a spotlight mask, custom content and accessible actions.',
  exports: ['Tour'],
  source: 'src/components/tour/tour.tsx',
  story: 'stories/tour.stories.tsx',
  tests: ['tests/tour/tour.test.tsx'],
  semanticParts: [
    'root',
    'cover',
    'close',
    'mask',
    'section',
    'footer',
    'actions',
    'indicator',
    'indicators',
    'header',
    'title',
    'description',
  ],
  usage: {
    description:
      'Guided steps anchored to page elements with a spotlight mask, custom content and accessible actions.',
    bestPractices: [
      'Provide meaningful labels and concise content.',
      'Keep controlled state synchronized through the change callbacks.',
    ],
  },
} satisfies ComponentDoc;
