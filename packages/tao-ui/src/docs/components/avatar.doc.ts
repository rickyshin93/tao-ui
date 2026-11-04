import type { ComponentDoc } from '../component-doc';
export const avatarDoc = {
  name: 'avatar',
  displayName: 'Avatar',
  category: 'Data Display',
  description:
    'Represents people with images, icons or automatically fitted initials.',
  exports: ['Avatar'],
  source: 'src/components/avatar/avatar.tsx',
  story: 'stories/avatar.stories.tsx',
  tests: ['tests/avatar/avatar.test.tsx'],
  semanticParts: ['root', 'image', 'icon', 'content'],
  keywords: ['profile', 'person', 'group'],
  usage: {
    description:
      'Use Avatar for a person or account; group related people with Avatar.Group.',
    bestPractices: [
      'Provide meaningful image alternative text.',
      'Supply initials or an icon as an image fallback.',
    ],
    avoid: ['Do not rely on an image alone to identify an account.'],
  },
} satisfies ComponentDoc;
