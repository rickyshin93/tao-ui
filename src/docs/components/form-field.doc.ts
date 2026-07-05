import type { ComponentDoc } from '../component-doc';

export const formFieldDoc = {
  name: 'form-field',
  displayName: 'FormField',
  category: 'Data Entry',
  description: 'Associates labels, help text, validation state, and controls.',
  exports: ['FormField'],
  source: 'src/components/form-field/form-field.tsx',
  story: 'stories/form.stories.tsx',
  tests: ['tests/form-field/form-field.test.tsx'],
  semanticParts: ['root', 'label', 'control', 'description', 'error'],
  keywords: ['form', 'label', 'validation'],
  related: ['Input', 'Select', 'FormSection'],
  usage: {
    description:
      'Use FormField to provide accessible labeling and status text around a single control.',
    bestPractices: [
      'Connect every input with a visible label.',
      'Keep validation copy specific and actionable.',
    ],
  },
} satisfies ComponentDoc;
