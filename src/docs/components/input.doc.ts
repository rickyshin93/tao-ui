import type { ComponentDoc } from '../component-doc';

export const inputDoc = {
  name: 'input',
  displayName: 'Input',
  category: 'Data Entry',
  description: 'Single-line text input for short freeform values.',
  exports: ['Input'],
  source: 'src/components/input/input.tsx',
  story: 'stories/input.stories.tsx',
  tests: ['tests/input/input.test.tsx'],
  semanticParts: ['root', 'input', 'prefix', 'suffix', 'clear'],
  keywords: ['text field', 'input', 'search'],
  related: ['Textarea', 'FormField'],
  usage: {
    description:
      'Use Input for short text values such as names, filters, search terms, and identifiers.',
    bestPractices: [
      'Pair with FormField for labels and validation.',
      'Use type, inputMode, and autoComplete when applicable.',
    ],
  },
} satisfies ComponentDoc;
