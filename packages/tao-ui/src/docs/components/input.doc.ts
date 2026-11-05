import type { ComponentDoc } from '../component-doc';

export const inputDoc = {
  name: 'input',
  displayName: 'Input',
  category: 'Data Entry',
  description:
    'Text inputs with clearing, counting, password visibility, search, text areas and OTP.',
  exports: ['Input'],
  source: 'src/components/input/input.tsx',
  story: 'stories/input.stories.tsx',
  tests: ['tests/input/input.test.tsx', 'tests/input/family.test.tsx'],
  semanticParts: [
    'root',
    'input',
    'prefix',
    'suffix',
    'clear',
    'count',
    'addonBefore',
    'addonAfter',
  ],
  keywords: ['text field', 'input', 'search'],
  related: ['Textarea', 'FormField'],
  usage: {
    description:
      'Use Input for short text values such as names, filters, search terms, and identifiers.',
    bestPractices: [
      'Pair with FormField for labels and validation.',
      'Use type, inputMode, and autoComplete when applicable.',
      'Use Input.Password, Input.Search, Input.TextArea and Input.OTP for specialized input.',
      'Use count.max for a soft limit; add exceedFormatter for custom clipping.',
    ],
  },
} satisfies ComponentDoc;
