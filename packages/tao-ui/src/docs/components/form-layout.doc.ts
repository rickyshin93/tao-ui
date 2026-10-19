import type { ComponentDoc } from '../component-doc';

export const formLayoutDoc = {
  name: 'form-layout',
  displayName: 'FormLayout',
  category: 'Layout',
  description:
    'Arranges form content with consistent label and control alignment.',
  exports: ['FormLayout'],
  source: 'src/layouts/form-layout/form-layout.tsx',
  story: 'stories/form-layout.stories.tsx',
  tests: ['tests/layouts/form-layout/form-layout.test.tsx'],
  semanticParts: ['root'],
  keywords: ['form', 'layout', 'labels'],
  related: ['FormField', 'FormSection'],
  usage: {
    description: 'Use FormLayout to keep dense forms aligned and predictable.',
    bestPractices: [
      'Use one layout strategy per form.',
      'Prefer vertical layout on narrow screens.',
    ],
  },
} satisfies ComponentDoc;
