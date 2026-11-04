import type { ComponentDoc } from '../component-doc';
export const listyDoc = {
  name: 'listy',
  displayName: 'Listy',
  category: 'Data Display',
  description:
    'Renders grouped or virtualized lists with precise item, group and position scrolling.',
  exports: ['Listy'],
  source: 'src/components/listy/listy.tsx',
  story: 'stories/listy.stories.tsx',
  tests: ['tests/listy/listy.test.tsx'],
  semanticParts: ['root', 'item', 'groupHeader'],
  keywords: ['list', 'virtual', 'group', 'scroll'],
  related: ['List', 'Table'],
  usage: {
    description:
      'Render long lists and grouped records without mounting the entire data set.',
    bestPractices: [
      'Provide stable rowKey values and a height when virtual is enabled.',
      'Use scrollTo with keys when records can change order.',
    ],
    avoid: ['Do not enable virtual scrolling without a bounded height.'],
  },
} satisfies ComponentDoc;
