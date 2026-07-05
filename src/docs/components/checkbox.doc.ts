import type { ComponentDoc } from '../component-doc';

export const checkboxDoc = {
  name: 'checkbox',
  displayName: 'Checkbox',
  category: 'Data Entry',
  description: 'Selects one or more independent boolean options.',
  exports: ['Checkbox', 'CheckboxGroup'],
  source: 'src/components/checkbox/checkbox.tsx',
  story: 'stories/checkbox.stories.tsx',
  tests: ['tests/checkbox/checkbox.test.tsx'],
  semanticParts: ['root', 'input', 'box', 'label', 'group', 'option'],
  keywords: ['checkbox', 'boolean', 'multi select'],
  related: ['Radio', 'Switch'],
  usage: {
    description:
      'Use Checkbox for independent choices, or CheckboxGroup when users can select multiple options from a set.',
    bestPractices: [
      'Use clear labels that describe the checked state.',
      'Group related options with CheckboxGroup.',
    ],
    avoid: [
      'Do not use CheckboxGroup when only one option may be selected; use RadioGroup instead.',
    ],
  },
  props: [
    {
      name: 'checked',
      type: 'boolean',
      description: 'Controlled checked state.',
    },
    {
      name: 'options',
      type: 'CheckboxOptionType[]',
      description: 'Options for CheckboxGroup.',
    },
    {
      name: 'classNames',
      type: 'SemanticClassNames<CheckboxSemanticPart>',
      description: 'Semantic class overrides.',
    },
  ],
} satisfies ComponentDoc;
