import type { ComponentDoc } from '../component-doc';

export const stepsDoc = {
  name: 'steps',
  displayName: 'Steps',
  category: 'Navigation',
  description: 'Guides users through the ordered stages of a task.',
  exports: ['Steps'],
  source: 'src/components/steps/steps.tsx',
  story: 'stories/steps.stories.tsx',
  tests: ['tests/steps/steps.test.tsx'],
  semanticParts: [
    'root',
    'item',
    'itemWrapper',
    'itemIcon',
    'itemSection',
    'itemHeader',
    'itemTitle',
    'itemSubtitle',
    'itemContent',
    'itemRail',
  ],
  keywords: [
    'steps',
    'stepper',
    'wizard',
    'progress',
    'sequence',
    'multistep',
    'onboarding',
  ],
  related: ['Tabs', 'Breadcrumb', 'Spinner'],
  usage: {
    description:
      'Use Steps to show progress through a multi-stage task, or to let users jump back to a stage they already visited.',
    bestPractices: [
      'Keep titles to one or two words and move detail into the content.',
      'Drive the whole bar from `current` and let status be derived from position.',
      'Provide `onChange` when revisiting a completed step is meaningful.',
      'Prefer `orientation="vertical"` for long or narrow layouts.',
    ],
    avoid: [
      'Do not use Steps for peer views at the same level; use Tabs.',
      'Do not use Steps as a passive progress indicator for a single operation; use Spinner.',
      'Do not set `status` per item unless a step genuinely failed or was skipped.',
    ],
  },
} satisfies ComponentDoc;
