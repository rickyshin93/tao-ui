import type { ComponentDoc } from '../component-doc';
export const autoCompleteDoc = {
  name: 'auto-complete',
  displayName: 'AutoComplete',
  category: 'Data Entry',
  description:
    'Editable text input with searchable suggestions, keyboard completion and custom input support.',
  exports: ['AutoComplete'],
  source: 'src/components/auto-complete/auto-complete.tsx',
  story: 'stories/auto-complete.stories.tsx',
  tests: ['tests/auto-complete/auto-complete.test.tsx'],
  semanticParts: [
    'root',
    'prefix',
    'input',
    'placeholder',
    'content',
    'clear',
    'popup.root',
    'popup.list',
    'popup.listItem',
  ],
  keywords: ['autocomplete', 'suggestion', 'search', 'input'],
  related: ['Input', 'Select', 'Mentions'],
  usage: {
    description:
      'Use AutoComplete when free-form input is valid and suggestions help users finish typing.',
    bestPractices: [
      'Control value with onChange and fetch suggestions with onSearch.',
      'Provide stable values and concise option labels.',
      'Give custom input elements an accessible name.',
    ],
    avoid: [
      'Do not use onSearch as the only controlled-value update during composition.',
      'Use Select when users must choose from a closed list.',
    ],
  },
} satisfies ComponentDoc;
