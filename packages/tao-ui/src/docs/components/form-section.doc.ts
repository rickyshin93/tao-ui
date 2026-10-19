import type { ComponentDoc } from '../component-doc';

export const formSectionDoc = {
  name: 'form-section',
  displayName: 'FormSection',
  category: 'Data Entry',
  description:
    'Groups related form fields with a title and optional description.',
  exports: ['FormSection'],
  source: 'src/components/form-section/form-section.tsx',
  story: 'stories/form.stories.tsx',
  tests: ['tests/form-section/form-section.test.tsx'],
  semanticParts: ['root', 'header', 'title', 'description', 'body'],
  keywords: ['form', 'section', 'group'],
  related: ['FormField', 'FormLayout'],
  usage: {
    description: 'Use FormSection to break long forms into scannable groups.',
    bestPractices: [
      'Use headings that describe the group, not the control type.',
      'Keep each section focused on one user decision area.',
    ],
  },
} satisfies ComponentDoc;
