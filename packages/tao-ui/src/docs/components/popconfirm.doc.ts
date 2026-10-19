import type { ComponentDoc } from '../component-doc';

export const popconfirmDoc = {
  name: 'popconfirm',
  displayName: 'Popconfirm',
  category: 'Feedback',
  description:
    'Shows a compact confirmation popup anchored to a trigger element, with OK and Cancel actions.',
  exports: ['Popconfirm'],
  source: 'src/components/popconfirm/popconfirm.tsx',
  story: 'stories/popconfirm.stories.tsx',
  tests: ['tests/popconfirm/popconfirm.test.tsx'],
  semanticParts: ['content', 'title', 'description', 'footer', 'icon'],
  keywords: ['popconfirm', 'confirm', 'popover', 'delete', 'warning'],
  related: ['Popover', 'Modal', 'Button'],
  usage: {
    description:
      'Use Popconfirm for lightweight inline confirmations such as delete actions, where a full Modal would be too heavy. Use Modal.confirm for critical or complex confirmations.',
    bestPractices: [
      'Keep the title to one short question; put detail in the description.',
      'Use Popconfirm for reversible, low-risk actions anchored to the control that triggers them.',
    ],
    avoid: [
      'Do not use Popconfirm for irreversible high-risk operations; use Modal.confirm instead.',
      'Do not put forms or rich interactions inside a Popconfirm.',
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode (required)',
      description: 'Main question text of the confirm popup.',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Secondary text shown under the title.',
    },
    {
      name: 'onConfirm',
      type: '(e?: MouseEvent<HTMLElement>) => void',
      description: 'Called when OK is clicked; the popup also closes.',
    },
    {
      name: 'onCancel',
      type: '(e?: MouseEvent<HTMLElement>) => void',
      description: 'Called when Cancel is clicked; the popup also closes.',
    },
    {
      name: 'okText',
      type: 'ReactNode',
      description: 'Text of the OK button.',
      defaultValue: "'OK'",
    },
    {
      name: 'cancelText',
      type: 'ReactNode',
      description: 'Text of the Cancel button.',
      defaultValue: "'Cancel'",
    },
    {
      name: 'okButtonProps',
      type: 'ButtonProps',
      description: 'Extra props forwarded to the OK button.',
    },
    {
      name: 'cancelButtonProps',
      type: 'ButtonProps',
      description: 'Extra props forwarded to the Cancel button.',
    },
    {
      name: 'icon',
      type: 'ReactNode | null',
      description:
        'Icon shown before the title. Pass `null` to hide it. Defaults to a warning triangle.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description:
        'When true, the trigger still renders but the popup never opens.',
      defaultValue: 'false',
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
      name: 'placement',
      type: "'top' | 'bottom' | 'left' | 'right'",
      description: 'Popup side relative to the trigger.',
      defaultValue: "'top'",
    },
    {
      name: 'classNames',
      type: "SemanticClassNames<'content' | 'title' | 'description' | 'footer' | 'icon'>",
      description: 'Semantic per-part class name overrides.',
    },
    {
      name: 'styles',
      type: "SemanticStyles<'content' | 'title' | 'description' | 'footer' | 'icon'>",
      description: 'Semantic per-part inline style overrides.',
    },
  ],
} satisfies ComponentDoc;
