import type { ComponentDoc } from '../component-doc';
export const badgeDoc = {
  name: 'badge',
  displayName: 'Badge',
  category: 'Data Display',
  description:
    'Adds notification counts, status indicators or a ribbon to content.',
  exports: ['Badge'],
  source: 'src/components/badge/badge.tsx',
  story: 'stories/badge.stories.tsx',
  tests: ['tests/badge/badge.test.tsx'],
  semanticParts: ['root', 'indicator'],
  keywords: ['count', 'status', 'notification', 'ribbon'],
  usage: {
    description: 'Use Badge for compact counts or a status next to a label.',
    bestPractices: ['Pair status colors with meaningful text.'],
    avoid: ['Do not use a count badge for long descriptions.'],
  },
} satisfies ComponentDoc;
