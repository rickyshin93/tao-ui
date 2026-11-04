import type { ComponentDoc } from '../component-doc';
export const mentionsDoc = {
  name: 'mentions',
  displayName: 'Mentions',
  category: 'Data Entry',
  description:
    'Insert mentions into multiline text using configurable prefixes, search suggestions and keyboard selection.',
  exports: ['Mentions'],
  source: 'src/components/mentions/mentions.tsx',
  story: 'stories/mentions.stories.tsx',
  tests: ['tests/mentions/mentions.test.tsx'],
  semanticParts: ['root', 'textarea', 'popup', 'suffix'],
  keywords: ['mention', 'textarea', 'people', 'tag'],
  related: ['Textarea', 'AutoComplete'],
  usage: {
    description:
      'Use Mentions for comments and messages that refer to people, topics or identifiers.',
    bestPractices: [
      'Use onSearch to fetch suggestions and loading while they arrive.',
      'Use unique option values that are meaningful in the resulting text.',
      'Use Mentions.getMentions with the same prefix and split configuration.',
    ],
    avoid: [
      'Keep prefix and split consistent when parsing stored text.',
      'Do not use labels as insertion values when identifiers differ.',
    ],
  },
} satisfies ComponentDoc;
