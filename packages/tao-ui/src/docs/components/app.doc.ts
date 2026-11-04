import type { ComponentDoc } from '../component-doc';

export const appDoc = {
  name: 'app',
  displayName: 'App',
  category: 'Config',
  description:
    'Scopes imperative messages, notifications and confirmation dialogs to the current React tree and TaoProvider theme.',
  exports: ['App'],
  source: 'src/components/app/app.tsx',
  story: 'stories/app.stories.tsx',
  tests: ['tests/app/app.test.tsx'],
  semanticParts: ['root'],
  keywords: ['app', 'message', 'notification', 'modal', 'context'],
  related: ['TaoProvider', 'Modal', 'Sonner'],
  usage: {
    description:
      'Place App below TaoProvider, then call App.useApp() from descendant components. Messages return callable close handles that can be awaited; confirmation dialogs return update, destroy and then.',
    bestPractices: [
      'Create feedback in event handlers or effects.',
      'Await modal confirmation when the next action depends on the user’s choice.',
      'Keep an App instance mounted for the lifetime of its feedback.',
    ],
    avoid: [
      'Do not call App.useApp() above its App provider.',
      'Do not use transient messages for information that must remain available.',
    ],
  },
} satisfies ComponentDoc;
