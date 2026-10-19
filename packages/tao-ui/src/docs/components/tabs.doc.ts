import type { ComponentDoc } from '../component-doc';

export const tabsDoc = {
  name: 'tabs',
  displayName: 'Tabs',
  category: 'Navigation',
  description: 'Switches between peer panels within the same page context.',
  exports: ['Tabs'],
  source: 'src/components/tabs/tabs.tsx',
  story: 'stories/tabs.stories.tsx',
  tests: ['tests/tabs/tabs.test.tsx'],
  semanticParts: ['root', 'nav', 'tab', 'indicator', 'panel'],
  keywords: ['tabs', 'sections', 'navigation'],
  related: ['Breadcrumb'],
  usage: {
    description:
      'Use Tabs to separate peer views without navigating away from the current task.',
    bestPractices: [
      'Use short tab labels.',
      'Keep tab panels at comparable hierarchy.',
    ],
    avoid: ['Do not use Tabs for sequential steps.'],
  },
} satisfies ComponentDoc;
