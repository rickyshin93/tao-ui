import type { ComponentDoc } from '../component-doc';

export const buttonDoc = {
  name: 'button',
  displayName: 'Button',
  category: 'General',
  description:
    'Triggers an immediate action such as submitting, saving, or opening a surface.',
  exports: ['Button'],
  source: 'src/components/button/button.tsx',
  story: 'stories/button.stories.tsx',
  tests: ['tests/button/button.test.tsx'],
  semanticParts: ['root'],
  keywords: ['button', 'action', 'submit', 'loading'],
  related: ['FormActions', 'Modal'],
  usage: {
    description:
      'Use Button for explicit actions. It inherits size, disabled, and variant defaults from TaoProvider.',
    bestPractices: [
      'Prefer one primary action per view or decision area.',
      'Use loading when an action is pending.',
      'Pass a native type when using a button inside a form.',
    ],
    avoid: [
      'Do not use Button for simple navigation when a link is more accurate.',
    ],
  },
  props: [
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'ghost' | 'destructive'",
      description: 'Visual emphasis.',
      defaultValue: "'primary'",
    },
    {
      name: 'size',
      type: 'TaoSize',
      description: 'Control size, falling back to TaoProvider.',
    },
    {
      name: 'loading',
      type: 'boolean',
      description: 'Disables the button and sets aria-busy.',
    },
    {
      name: 'classNames',
      type: "SemanticClassNames<'root'>",
      description: 'Semantic class override.',
    },
  ],
} satisfies ComponentDoc;
