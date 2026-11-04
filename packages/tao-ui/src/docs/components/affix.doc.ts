import type { ComponentDoc } from '../component-doc';
export const affixDoc = {
  name: 'affix',
  displayName: 'Affix',
  category: 'Navigation',
  description: 'Affixes content to a window or scroll container boundary.',
  exports: ['Affix'],
  source: 'src/components/affix/affix.tsx',
  story: 'stories/affix.stories.tsx',
  tests: ['tests/affix/affix.test.tsx'],
  semanticParts: ['root', 'content'],
  usage: {
    description: 'Affixes content to a window or scroll container boundary.',
  },
} satisfies ComponentDoc;
