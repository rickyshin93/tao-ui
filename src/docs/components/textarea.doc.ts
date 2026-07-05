import type { ComponentDoc } from '../component-doc';

export const textareaDoc = {
  name: 'textarea',
  displayName: 'Textarea',
  category: 'Data Entry',
  description: 'Multi-line text input with optional auto sizing.',
  exports: ['Textarea'],
  source: 'src/components/textarea/textarea.tsx',
  story: 'stories/textarea.stories.tsx',
  tests: ['tests/textarea/textarea.test.tsx'],
  semanticParts: ['root', 'textarea'],
  keywords: ['textarea', 'multiline', 'input'],
  related: ['Input', 'FormField'],
  usage: {
    description:
      'Use Textarea for longer freeform content such as descriptions, notes, and comments.',
    bestPractices: [
      'Set rows or autoSize based on expected content length.',
      'Use maxLength when limits are strict.',
    ],
  },
} satisfies ComponentDoc;
