import type { ComponentDoc } from '../component-doc';
export const floatButtonDoc = {
  name: 'float-button',
  displayName: 'FloatButton',
  category: 'General',
  description:
    'Provides floating actions, grouped controls and a scroll-to-top action.',
  exports: ['FloatButton'],
  source: 'src/components/float-button/float-button.tsx',
  story: 'stories/float-button.stories.tsx',
  tests: ['tests/float-button/float-button.test.tsx'],
  semanticParts: ['root', 'icon', 'content'],
  usage: {
    description:
      'Provides floating actions, grouped controls and a scroll-to-top action.',
  },
} satisfies ComponentDoc;
