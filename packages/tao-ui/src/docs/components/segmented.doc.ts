import type { ComponentDoc } from '../component-doc';
export const segmentedDoc = {
  name: 'segmented',
  displayName: 'Segmented',
  category: 'Data Entry',
  description: 'Selects one option from a compact accessible radio group.',
  exports: ['Segmented'],
  source: 'src/components/segmented/segmented.tsx',
  story: 'stories/segmented.stories.tsx',
  tests: ['tests/segmented/segmented.test.tsx'],
  semanticParts: ['root', 'item', 'label', 'icon'],
  usage: {
    description: 'Use Segmented for a small set of related views or modes.',
  },
} satisfies ComponentDoc;
