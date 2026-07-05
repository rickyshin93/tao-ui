import type { ComponentDoc } from '../component-doc';

export const headlessInputNumberDoc = {
  name: 'headless-input-number',
  displayName: 'HeadlessInputNumber',
  category: 'Headless',
  description:
    'Headless numeric input primitives and hook for custom number entry experiences.',
  exports: ['HeadlessInputNumber', 'NumberInput', 'useNumberInput'],
  source: 'src/number-input/number-input.tsx',
  story: 'stories/headless-input-number.stories.tsx',
  tests: [
    'tests/number-input/headless-input-number.test.tsx',
    'tests/number-input/use-number-input.test.tsx',
    'tests/number-input/format.test.ts',
    'tests/number-input/validate.test.ts',
  ],
  keywords: ['headless', 'number', 'formatting', 'validation'],
  related: ['InputNumber'],
  usage: {
    description:
      'Use the headless API when tao-ui styling is not appropriate but number formatting behavior should stay consistent.',
    bestPractices: [
      'Use useNumberInput for fully custom rendering.',
      'Reuse the validation helpers for parity with the styled InputNumber.',
    ],
  },
} satisfies ComponentDoc;
