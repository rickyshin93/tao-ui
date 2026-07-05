import type { ComponentDoc } from '../component-doc';

export const collapsibleDoc = {
  name: 'collapsible',
  displayName: 'Collapsible',
  category: 'Data Display',
  description:
    'Shows and hides a region of content while keeping disclosure state accessible.',
  exports: ['Collapsible'],
  source: 'src/components/collapsible/collapsible.tsx',
  story: 'stories/collapsible.stories.tsx',
  tests: ['tests/collapsible/collapsible.test.tsx'],
  semanticParts: ['root', 'trigger', 'content'],
  keywords: ['accordion', 'disclosure', 'expand'],
  related: ['Drawer', 'Tabs'],
  usage: {
    description:
      'Use Collapsible to hide secondary details while preserving a lightweight page layout.',
    bestPractices: [
      'Make the trigger label describe the hidden content.',
      'Use controlled open state when it must coordinate with other UI.',
    ],
    avoid: [
      'Do not hide required form inputs in a collapsed region without a clear cue.',
    ],
  },
} satisfies ComponentDoc;
