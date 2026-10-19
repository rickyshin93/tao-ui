import type { ComponentDoc } from '../component-doc';

export const popoverDoc = {
  name: 'popover',
  displayName: 'Popover',
  category: 'Data Display',
  description:
    'Displays a floating card with rich content anchored to a trigger element, opened by click or hover.',
  exports: ['Popover'],
  source: 'src/components/popover/popover.tsx',
  story: 'stories/popover.stories.tsx',
  tests: ['tests/popover/popover.test.tsx'],
  semanticParts: ['root', 'container', 'title', 'content', 'arrow'],
  keywords: ['popover', 'popup', 'floating', 'card', 'hover', 'click'],
  related: ['Tooltip', 'Dropdown', 'Modal'],
  usage: {
    description:
      'Use Popover for rich, non-blocking contextual content behind a click or hover. Use Tooltip for short text-only hints and Modal for blocking interactions.',
    bestPractices: [
      'Keep the title to one short line; put detail in the content.',
      'Use the default hover trigger for read-only previews and trigger="click" for interactive content.',
      'Keep popup content compact; link out for long-form detail.',
    ],
    avoid: [
      'Do not nest essential workflows inside a hover-only popover.',
      'Do not chain popovers from inside another popover.',
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description: 'Header text of the popup.',
    },
    {
      name: 'content',
      type: 'ReactNode',
      description: 'Body content of the popup.',
    },
    {
      name: 'trigger',
      type: "'hover' | 'focus' | 'click' | 'contextMenu' | PopoverTrigger[]",
      description: 'How the popup opens.',
      defaultValue: "'hover'",
    },
    {
      name: 'placement',
      type: "'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight' | 'left' | 'leftTop' | 'leftBottom' | 'right' | 'rightTop' | 'rightBottom'",
      description: 'Popup side relative to the trigger.',
      defaultValue: "'top'",
    },
    {
      name: 'open',
      type: 'boolean',
      description: 'Controlled open state.',
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      description: 'Initial open state (uncontrolled).',
      defaultValue: 'false',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: 'Called when the open state changes.',
    },
    {
      name: 'mouseEnterDelay',
      type: 'number',
      description: 'Delay in seconds before a hover opens the popup.',
      defaultValue: '0.1',
    },
    {
      name: 'mouseLeaveDelay',
      type: 'number',
      description: 'Delay in seconds before a hover closes the popup.',
      defaultValue: '0.1',
    },
    {
      name: 'arrow',
      type: 'boolean | { pointAtCenter?: boolean }',
      description: 'Whether to render a pointing arrow on the popup.',
      defaultValue: 'true',
    },
    {
      name: 'destroyOnHidden',
      type: 'boolean',
      description:
        'Unmount the popup content while closed. When false, the content is kept mounted and hidden.',
      defaultValue: 'false',
    },
    {
      name: 'classNames',
      type: "SemanticClassNames<'root' | 'container' | 'title' | 'content' | 'arrow'>",
      description: 'Semantic per-part class name overrides.',
    },
    {
      name: 'styles',
      type: "SemanticStyles<'root' | 'container' | 'title' | 'content' | 'arrow'>",
      description: 'Semantic per-part inline style overrides.',
    },
  ],
} satisfies ComponentDoc;
