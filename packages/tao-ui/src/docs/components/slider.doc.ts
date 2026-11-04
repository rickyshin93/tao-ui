import type { ComponentDoc } from '../component-doc';
export const sliderDoc = {
  name: 'slider',
  displayName: 'Slider',
  category: 'Data Entry',
  description:
    'Selects a numeric value or editable range using pointer, touch and keyboard input.',
  exports: ['Slider'],
  source: 'src/components/slider/slider.tsx',
  story: 'stories/slider.stories.tsx',
  tests: ['tests/slider/slider.test.tsx'],
  semanticParts: ['root', 'rail', 'tracks', 'track', 'handle'],
  keywords: ['slider', 'range', 'number'],
  related: ['InputNumber', 'Rate'],
  usage: {
    description: 'Adjust numeric values within explicit bounds.',
    bestPractices: [
      'Label every handle and choose a meaningful step.',
      'Use onChangeComplete for expensive work after a drag finishes.',
    ],
    avoid: [
      'Do not use a slider when users need to enter an exact unbounded number.',
    ],
  },
} satisfies ComponentDoc;
