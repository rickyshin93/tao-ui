import type { ComponentDoc } from '../component-doc';
export const timelineDoc = {
  name: 'timeline',
  displayName: 'Timeline',
  category: 'Data Display',
  description:
    'Shows ordered events with timestamps, indicators and alternate layouts.',
  exports: ['Timeline'],
  source: 'src/components/timeline/timeline.tsx',
  story: 'stories/timeline.stories.tsx',
  tests: ['tests/timeline/timeline.test.tsx'],
  semanticParts: [
    'root',
    'item',
    'itemWrapper',
    'itemIcon',
    'itemSection',
    'itemHeader',
    'itemTitle',
    'itemContent',
    'itemRail',
  ],
  usage: {
    description:
      'Use Timeline for chronological events and their current progress.',
  },
} satisfies ComponentDoc;
