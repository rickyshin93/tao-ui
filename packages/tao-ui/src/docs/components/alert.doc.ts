import type { ComponentDoc } from '../component-doc';

export const alertDoc = {
  name: 'alert',
  displayName: 'Alert',
  category: 'Feedback',
  description:
    'Displays important contextual feedback messages with semantic status types.',
  exports: ['Alert'],
  source: 'src/components/alert/alert.tsx',
  story: 'stories/alert.stories.tsx',
  tests: ['tests/alert/alert.test.tsx'],
  semanticParts: ['root', 'icon', 'title', 'description', 'action', 'close'],
  keywords: [
    'alert',
    'banner',
    'feedback',
    'message',
    'notification',
    'status',
  ],
  related: ['Sonner', 'Modal', 'Tag'],
  usage: {
    description:
      'Use Alert for persistent, page-level feedback about a state or operation. Use Sonner toasts for transient notifications.',
    bestPractices: [
      'Pick the semantic type that matches the severity of the message.',
      'Keep the title short; put detail in the description.',
      'Enable showIcon when the alert needs to be scannable at a glance.',
    ],
    avoid: [
      'Do not stack many alerts in one view; prefer a single summary.',
      'Do not use Alert for transient feedback; use a toast instead.',
    ],
  },
  props: [
    {
      name: 'type',
      type: "'success' | 'info' | 'warning' | 'error'",
      description: 'Semantic status type controlling colors and default icon.',
      defaultValue: "'info'",
    },
    {
      name: 'title',
      type: 'ReactNode',
      description: 'Bold heading line of the alert.',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Secondary text rendered below the title.',
    },
    {
      name: 'showIcon',
      type: 'boolean',
      description: 'Whether to render the per-type status icon.',
      defaultValue: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Custom icon overriding the per-type default.',
    },
    {
      name: 'closable',
      type: 'boolean',
      description: 'Whether to show a close button that dismisses the alert.',
      defaultValue: 'false',
    },
    {
      name: 'onClose',
      type: '(e: MouseEvent<HTMLElement>) => void',
      description: 'Called when the close button is clicked.',
    },
    {
      name: 'action',
      type: 'ReactNode',
      description: 'Right-side action slot, e.g. a button.',
    },
  ],
} satisfies ComponentDoc;
