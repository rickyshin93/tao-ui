import type { ComponentDoc } from '../component-doc';
export const statisticDoc = {
  name: 'statistic',
  displayName: 'Statistic',
  category: 'Data Display',
  description: 'Formats metrics and live count-up or countdown timers.',
  exports: ['Statistic'],
  source: 'src/components/statistic/statistic.tsx',
  story: 'stories/statistic.stories.tsx',
  tests: ['tests/statistic/statistic.test.tsx'],
  semanticParts: [
    'root',
    'header',
    'title',
    'content',
    'value',
    'prefix',
    'suffix',
  ],
  usage: {
    description:
      'Use Statistic to emphasize a single metric with a clear title and unit.',
  },
} satisfies ComponentDoc;
