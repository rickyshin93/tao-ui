import type { ComponentDoc } from '../component-doc';

export const formActionsDoc = {
  name: 'form-actions',
  displayName: 'FormActions',
  category: 'Data Entry',
  description: 'Lays out submit, cancel, and secondary actions for forms.',
  exports: ['FormActions'],
  source: 'src/components/form-actions/form-actions.tsx',
  story: 'stories/form.stories.tsx',
  tests: ['tests/form-actions/form-actions.test.tsx'],
  semanticParts: ['root'],
  keywords: ['form', 'actions', 'submit'],
  related: ['Button', 'FormField', 'FormSection'],
  usage: {
    description:
      'Use FormActions at the end of a form or section to align the final actions consistently.',
    bestPractices: [
      'Keep action order consistent across forms.',
      'Use a single submit action unless the workflow truly branches.',
    ],
  },
} satisfies ComponentDoc;
