import type { ComponentDoc } from '../component-doc';

export const taoProviderDoc = {
  name: 'tao-provider',
  displayName: 'TaoProvider',
  category: 'Config',
  description:
    'Provides global component defaults, portal scoping, and theme seed token overrides.',
  exports: ['TaoProvider', 'TaoPortalScope'],
  source: 'src/provider/tao-provider.tsx',
  story: 'stories/provider.stories.tsx',
  tests: ['tests/provider/tao-provider.test.tsx'],
  keywords: ['provider', 'theme', 'tokens', 'size', 'disabled'],
  related: ['Button', 'Input', 'tokenVar'],
  usage: {
    description:
      'Wrap an app or subtree with TaoProvider to set size, disabled, variant, and theme defaults.',
    bestPractices: [
      'Prefer provider-level defaults for app-wide decisions.',
      'Use nested providers for scoped theme overrides.',
    ],
    avoid: [
      'Do not override derived CSS variables directly unless a theme token cannot express the change.',
    ],
  },
  props: [
    {
      name: 'size',
      type: 'TaoSize',
      description: 'Default component size for descendants.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Default disabled state for descendants.',
    },
    {
      name: 'variant',
      type: 'TaoVariant',
      description: 'Default field variant for descendants.',
    },
    {
      name: 'theme',
      type: 'TaoThemeConfig',
      description: 'Seed token overrides for the provider scope.',
    },
  ],
} satisfies ComponentDoc;
