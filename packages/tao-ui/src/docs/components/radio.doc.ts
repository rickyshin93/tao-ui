import type { ComponentDoc } from '../component-doc';

export const radioDoc = {
  name: 'radio',
  displayName: 'Radio',
  category: 'Data Entry',
  description: 'Selects exactly one option from a mutually exclusive set.',
  exports: ['Radio', 'RadioGroup'],
  source: 'src/components/radio/radio.tsx',
  story: 'stories/radio.stories.tsx',
  tests: ['tests/radio/radio.test.tsx'],
  semanticParts: ['root', 'indicator', 'label'],
  keywords: ['radio', 'single choice', 'selection'],
  related: ['Checkbox', 'SegmentedControl'],
  usage: {
    description:
      'Use RadioGroup when every option is visible and only one can be selected.',
    bestPractices: [
      'Use concise labels.',
      'Provide a default value when one option is recommended or required.',
    ],
    avoid: [
      'Do not use RadioGroup for very long option lists; use Select instead.',
    ],
  },
} satisfies ComponentDoc;
