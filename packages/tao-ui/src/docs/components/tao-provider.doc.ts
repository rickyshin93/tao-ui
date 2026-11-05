import type { ComponentDoc } from '../component-doc';

export const taoProviderDoc = {
  name: 'tao-provider',
  displayName: 'TaoProvider',
  category: 'Config',
  description:
    'Provides global component defaults, portal scoping, and theme seed token overrides.',
  exports: ['TaoProvider'],
  source: 'src/provider/tao-provider.tsx',
  story: 'stories/provider.stories.tsx',
  tests: ['tests/provider/tao-provider.test.tsx'],
  keywords: ['provider', 'theme', 'tokens', 'size', 'disabled'],
  related: ['Button', 'Input', 'tokenVar'],
  usage: {
    description:
      'Wrap an app or subtree with TaoProvider to set size, disabled, variant, direction, and theme defaults.',
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
      name: 'direction',
      type: "'ltr' | 'rtl'",
      description:
        'Text and interaction direction. Inherits the surrounding DOM when omitted; nested providers and component props can override it. Portals retain their source direction.',
    },
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
      description:
        'Seed token overrides for the provider scope; also carries mode, compact density, and per-component token overrides.',
    },
    {
      name: 'theme.compact',
      type: 'boolean',
      description:
        'Compact density: control height 32→28 and paddings one notch tighter, cascades like mode.',
    },
    {
      name: 'theme.components',
      type: 'TaoComponentTokenMap',
      description:
        'Per-component token overrides (Button/Input/FormField), serialized to --tao-{component}-* CSS variables.',
    },
  ],
} satisfies ComponentDoc;
