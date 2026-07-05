import type { ComponentDoc } from '../component-doc';

export const switchDoc = {
  name: 'switch',
  displayName: 'Switch',
  category: 'Data Entry',
  description: 'Toggles a setting on or off with immediate effect.',
  exports: ['Switch'],
  source: 'src/components/switch/switch.tsx',
  story: 'stories/switch.stories.tsx',
  tests: ['tests/switch/switch.test.tsx'],
  semanticParts: ['root', 'thumb', 'label'],
  keywords: ['toggle', 'setting', 'boolean'],
  related: ['Checkbox'],
  usage: {
    description: 'Use Switch for settings that take effect immediately.',
    bestPractices: [
      'Use labels that describe the enabled state.',
      'Use Checkbox when the value is submitted with a form.',
    ],
  },
} satisfies ComponentDoc;
