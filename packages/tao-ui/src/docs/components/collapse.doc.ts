import type { ComponentDoc } from '../component-doc';

export const collapseDoc = {
  name: 'collapse',
  displayName: 'Collapse',
  category: 'Data Display',
  description:
    'Groups content into accessible item-based panels with built-in headers, expand icons and accordion behavior.',
  exports: ['Collapse'],
  source: 'src/components/collapse/collapse.tsx',
  story: 'stories/collapse.stories.tsx',
  tests: ['tests/collapse/collapse.test.tsx', 'tests/collapse/panels.test.tsx'],
  semanticParts: [
    'root',
    'item',
    'header',
    'trigger',
    'title',
    'icon',
    'extra',
    'content',
    'body',
  ],
  keywords: ['accordion', 'disclosure', 'expand'],
  related: ['Drawer', 'Tabs'],
  usage: {
    description:
      'Pass items with key, label and children for ready-to-use panels; use accordion to allow one open panel and activeKey/onChange for controlled state.',
    bestPractices: [
      'Make the trigger label describe the hidden content.',
      'Use activeKey/onChange when expansion must coordinate with other UI.',
      'Keep independent header actions in extra; reserve collapsible="icon" for icon-only activation.',
    ],
    avoid: [
      'Do not hide required form inputs in a collapsed region without a clear cue.',
    ],
  },
} satisfies ComponentDoc;
