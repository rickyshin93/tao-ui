import type { ComponentDoc } from '../component-doc';
export const masonryDoc = {
  name: 'masonry',
  displayName: 'Masonry',
  category: 'Data Display',
  description:
    'Arranges variable-height content in responsive balanced columns.',
  exports: ['Masonry'],
  source: 'src/components/masonry/masonry.tsx',
  story: 'stories/masonry.stories.tsx',
  tests: ['tests/masonry/masonry.test.tsx'],
  semanticParts: ['root', 'item'],
  usage: {
    description:
      'Arranges variable-height content in responsive balanced columns.',
  },
} satisfies ComponentDoc;
