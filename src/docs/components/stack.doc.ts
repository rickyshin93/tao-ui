import type { ComponentDoc } from '../component-doc';

export const stackDoc = {
  name: 'stack',
  displayName: 'Stack',
  category: 'Layout',
  description:
    'Composes children in a flex row or column with consistent spacing.',
  exports: ['Stack'],
  source: 'src/layouts/stack/stack.tsx',
  story: 'stories/stack.stories.tsx',
  tests: ['tests/layouts/stack/stack.test.tsx'],
  semanticParts: ['root'],
  keywords: ['layout', 'flex', 'spacing'],
  related: ['Splitter', 'FormLayout'],
  usage: {
    description: 'Use Stack for simple one-dimensional layout and spacing.',
    bestPractices: [
      'Prefer Stack over one-off margin rules for repeated spacing.',
      'Use semantic containers when the layout has richer meaning.',
      'Pass breakpoint maps (e.g. direction={{ xs: \'vertical\', md: \'horizontal\' }}) for responsive layouts.',
    ],
  },
  props: [
    {
      name: 'direction',
      type: "TaoResponsiveValue<'vertical' | 'horizontal'>",
      description:
        'Flex direction; accepts a breakpoint map resolved via useBreakpoint.',
      defaultValue: "'vertical'",
    },
    {
      name: 'gap',
      type: "TaoResponsiveValue<'sm' | 'md' | 'lg'>",
      description: 'Spacing between children; accepts a breakpoint map.',
      defaultValue: "'md'",
    },
    {
      name: 'align',
      type: "TaoResponsiveValue<'start' | 'center' | 'end' | 'stretch'>",
      description: 'Cross-axis alignment; accepts a breakpoint map.',
      defaultValue: "'stretch'",
    },
  ],
} satisfies ComponentDoc;
