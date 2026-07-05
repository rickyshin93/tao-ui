import type { ComponentDoc } from '../component-doc';

export const contextMenuDoc = {
  name: 'context-menu',
  displayName: 'ContextMenu',
  category: 'Navigation',
  description:
    'Displays contextual actions from a right click or long press interaction.',
  exports: ['ContextMenu'],
  source: 'src/components/context-menu/context-menu.tsx',
  story: 'stories/context-menu.stories.tsx',
  tests: ['tests/context-menu/context-menu.test.tsx'],
  semanticParts: ['root', 'trigger', 'content', 'item', 'separator'],
  keywords: ['menu', 'right click', 'actions'],
  related: ['Dropdown'],
  usage: {
    description:
      'Use ContextMenu for secondary actions attached to an object or region.',
    bestPractices: [
      'Keep items short and action-oriented.',
      'Provide another reachable path for critical actions.',
    ],
    avoid: ['Do not put primary workflows only inside a context menu.'],
  },
} satisfies ComponentDoc;
