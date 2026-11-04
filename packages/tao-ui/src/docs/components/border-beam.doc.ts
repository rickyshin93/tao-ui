import type { ComponentDoc } from '../component-doc';
export const borderBeamDoc = {
  name: 'border-beam',
  displayName: 'BorderBeam',
  category: 'General',
  description: 'Animates a highlighted beam around the border of its child.',
  exports: ['BorderBeam'],
  source: 'src/components/border-beam/border-beam.tsx',
  story: 'stories/border-beam.stories.tsx',
  tests: ['tests/border-beam/border-beam.test.tsx'],
  semanticParts: ['root', 'beam'],
  usage: {
    description: 'Animates a highlighted beam around the border of its child.',
  },
} satisfies ComponentDoc;
