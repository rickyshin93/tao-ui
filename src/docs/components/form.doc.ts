import type { ComponentDoc } from '../component-doc';

export const formDoc = {
  name: 'form',
  displayName: 'Form',
  category: 'Data Entry',
  description:
    'Collects and validates field values with an antd-aligned API (rules, dependencies, Form.List) on top of the rc-form engine.',
  exports: ['Form'],
  source: 'src/components/form/form.tsx',
  story: 'stories/form.stories.tsx',
  tests: ['tests/form/form.test.tsx'],
  semanticParts: ['root'],
  keywords: ['form', 'validation', 'rules', 'submit'],
  related: ['FormField', 'FormSection', 'FormActions', 'Input'],
  usage: {
    description:
      'Use Form with Form.Item when fields need a value store, rule validation, or submit handling. Use the lighter FormField when you manage state yourself.',
    bestPractices: [
      'Declare validation as rules on Form.Item; the required mark is inferred from rules.',
      'Use dependencies for cross-field rules such as password confirmation.',
      'Use Form.useForm() for imperative control (setFieldsValue, resetFields, submit).',
      'Set size or disabled on Form to cascade them to every control inside.',
    ],
    avoid: [
      'Do not bind the same name in two mounted Form.Items.',
      'Do not mix manual value/onChange props with a bound Form.Item on the same control.',
    ],
  },
  props: [
    {
      name: 'initialValues',
      type: 'Record<string, unknown>',
      description: 'Seed values for the form store.',
    },
    {
      name: 'onFinish',
      type: '(values) => void',
      description: 'Called with collected values after a valid submit.',
    },
    {
      name: 'layout',
      type: "'vertical' | 'horizontal'",
      description: 'Label/control arrangement inherited by Form.Item.',
      defaultValue: "'vertical'",
    },
    {
      name: 'Form.Item rules',
      type: 'Rule[]',
      description:
        'Validation rules (required, pattern, min/max, validator, …), same engine as antd.',
    },
    {
      name: 'Form.Item help / extra',
      type: 'ReactNode',
      description:
        'help overrides the rule message; extra renders a description below the control.',
    },
  ],
} satisfies ComponentDoc;
