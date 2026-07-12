import type { ComponentDoc } from '../component-doc';

export const sonnerDoc = {
  name: 'sonner',
  displayName: 'Sonner',
  category: 'Feedback',
  description:
    'Displays temporary toast notifications with optional actions and provider-aware theming.',
  exports: ['Sonner', 'toast'],
  source: 'src/components/sonner/sonner.tsx',
  story: 'stories/sonner.stories.tsx',
  tests: ['tests/sonner/sonner.test.tsx'],
  semanticParts: [
    'viewport',
    'toast',
    'content',
    'title',
    'description',
    'actions',
    'action',
    'cancel',
    'close',
  ],
  keywords: ['toast', 'notification', 'sonner'],
  related: ['Modal', 'Drawer', 'Button'],
  usage: {
    description:
      'Mount one Sonner near app root, then call toast() imperatively from event handlers. Supports toast.loading(), toast.promise(), and toast.custom() for richer async and custom notification flows.',
    bestPractices: [
      'Prefer short, status-oriented messages with one primary action at most.',
      'Enable richColors when semantic status color should be visible.',
    ],
    avoid: ['Do not use toast notifications for blocking confirmations.'],
  },
} satisfies ComponentDoc;
