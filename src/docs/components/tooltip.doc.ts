import type { ComponentDoc } from '../component-doc';

export const tooltipDoc = {
  name: 'tooltip',
  displayName: 'Tooltip',
  category: 'Data Display',
  description:
    'Shows a brief informational popup when hovering or focusing an element.',
  exports: ['Tooltip'],
  source: 'src/components/tooltip/tooltip.tsx',
  story: 'stories/tooltip.stories.tsx',
  tests: ['tests/tooltip/tooltip.test.tsx'],
  semanticParts: ['content', 'arrow'],
  keywords: ['hover', 'hint', 'popup', 'infotip'],
  related: ['Dropdown', 'Modal'],
  usage: {
    description:
      'Use Tooltip for short contextual hints on hover or focus. The popup is portaled and inherits the TaoProvider theme.',
    bestPractices: [
      'Keep tooltip text short and supplementary.',
      'Wrap exactly one focusable trigger element.',
    ],
    avoid: [
      'Do not put critical information or interactive content inside a Tooltip.',
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description:
        'Tooltip content; null, undefined or empty string disables the tooltip.',
      required: true,
    },
    {
      name: 'placement',
      type: "'top' | 'bottom' | 'left' | 'right'",
      description: 'Popup side relative to the trigger.',
      defaultValue: "'top'",
    },
    {
      name: 'arrow',
      type: 'boolean',
      description: 'Show the arrow pointing at the trigger.',
      defaultValue: 'true',
    },
    {
      name: 'mouseEnterDelay',
      type: 'number',
      description: 'Hover delay in seconds before opening.',
      defaultValue: '0.1',
    },
    {
      name: 'mouseLeaveDelay',
      type: 'number',
      description:
        'Delay in seconds before a pointer-leave closes the tooltip; re-entering cancels the close. Esc/blur closes stay immediate.',
      defaultValue: '0.1',
    },
    {
      name: 'color',
      type: 'string',
      description: 'Custom content background color.',
    },
  ],
} satisfies ComponentDoc;
