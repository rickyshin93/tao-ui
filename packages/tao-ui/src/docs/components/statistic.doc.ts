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
  props: [
    {
      name: 'locale',
      type: 'string',
      description:
        'BCP 47 numeric locale. Inherits TaoProvider numberLocale. Explicit separators and formatter take precedence; string precision and truncation semantics are preserved.',
    },
  ],
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
