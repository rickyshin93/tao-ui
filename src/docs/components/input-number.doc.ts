import type { ComponentDoc } from '../component-doc';

export const inputNumberDoc = {
  name: 'input-number',
  displayName: 'InputNumber',
  category: 'Data Entry',
  description:
    'A styled numeric input built on tao-ui number formatting and validation behavior.',
  exports: ['InputNumber'],
  source: 'src/components/input-number/input-number.tsx',
  story: 'stories/input-number.stories.tsx',
  tests: ['tests/input-number/input-number.test.tsx'],
  semanticParts: ['root', 'input', 'controls', 'increment', 'decrement'],
  keywords: ['number', 'numeric', 'stepper'],
  related: ['HeadlessInputNumber', 'Input'],
  usage: {
    description:
      'Use InputNumber for numeric values that need min, max, step, precision, or formatted display.',
    bestPractices: [
      'Set min and max when the domain is bounded.',
      'Use the headless API when custom rendering is required.',
    ],
    avoid: [
      'Do not use a numeric input for identifiers such as account numbers.',
    ],
  },
} satisfies ComponentDoc;
