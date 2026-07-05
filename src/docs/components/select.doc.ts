import type { ComponentDoc } from '../component-doc';

export const selectDoc = {
  name: 'select',
  displayName: 'Select',
  category: 'Data Entry',
  description: 'Chooses one value from a compact list of options.',
  exports: ['Select', 'ChevronsUpDownIcon'],
  source: 'src/components/select/select.tsx',
  story: 'stories/select.stories.tsx',
  tests: ['tests/select/select.test.tsx'],
  semanticParts: ['root', 'trigger', 'value', 'content', 'item', 'empty'],
  keywords: ['select', 'combobox', 'options'],
  related: ['Dropdown', 'Radio'],
  usage: {
    description:
      'Use Select when choices are known but too numerous or secondary to show as radios.',
    bestPractices: [
      'Use RadioGroup when there are only a few important choices.',
      'Keep option labels stable and easy to scan.',
    ],
    avoid: ['Do not use Select for arbitrary text entry.'],
  },
} satisfies ComponentDoc;
