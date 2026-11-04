import type { ComponentDoc } from '../component-doc';
export const descriptionsDoc = {
  name: 'descriptions',
  displayName: 'Descriptions',
  category: 'Data Display',
  description:
    'Displays labeled record fields with responsive columns and flexible spans.',
  exports: ['Descriptions'],
  source: 'src/components/descriptions/descriptions.tsx',
  story: 'stories/descriptions.stories.tsx',
  tests: ['tests/descriptions/descriptions.test.tsx'],
  semanticParts: ['root', 'header', 'title', 'extra', 'label', 'content'],
  usage: {
    description:
      'Use Descriptions for read-only details; use Form for editable fields.',
  },
} satisfies ComponentDoc;
