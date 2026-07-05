import type { ComponentDoc } from '../component-doc';

export const modalDoc = {
  name: 'modal',
  displayName: 'Modal',
  category: 'Feedback',
  description:
    'Displays a focused dialog for decisions, forms, and interruptive information.',
  exports: ['Modal'],
  source: 'src/components/modal/modal.tsx',
  story: 'stories/modal.stories.tsx',
  tests: ['tests/modal/modal.test.tsx'],
  semanticParts: [
    'root',
    'overlay',
    'content',
    'header',
    'body',
    'footer',
    'close',
  ],
  keywords: ['dialog', 'confirm', 'overlay'],
  related: ['Drawer', 'Button'],
  usage: {
    description:
      'Use Modal for focused tasks or decisions. Static helpers such as Modal.confirm mirror common confirmation flows.',
    bestPractices: [
      'Prefer Modal.useModal inside React trees so dialogs inherit TaoProvider context.',
      'Keep modal content short and task-oriented.',
    ],
    avoid: ['Do not use nested modals for multi-step workflows.'],
  },
} satisfies ComponentDoc;
