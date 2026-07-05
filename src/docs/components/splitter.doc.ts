import type { ComponentDoc } from '../component-doc';

export const splitterDoc = {
  name: 'splitter',
  displayName: 'Splitter',
  category: 'Layout',
  description: 'Creates resizable panes separated by draggable handles.',
  exports: ['Splitter'],
  source: 'src/components/splitter/splitter.tsx',
  story: 'stories/splitter.stories.tsx',
  tests: ['tests/splitter/splitter.test.tsx'],
  semanticParts: ['root', 'panel', 'handle'],
  keywords: ['resizable', 'panes', 'layout'],
  related: ['Stack', 'FormLayout'],
  usage: {
    description:
      'Use Splitter for work surfaces where users need to allocate space between adjacent panes.',
    bestPractices: [
      'Set sensible min sizes.',
      'Persist sizes only when the layout is user-specific.',
    ],
  },
} satisfies ComponentDoc;
