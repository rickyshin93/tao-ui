import type { ComponentDoc } from '../component-doc';
export const watermarkDoc = {
  name: 'watermark',
  displayName: 'Watermark',
  category: 'General',
  description:
    'Repeats a text or image watermark over content and inherited dialog panels.',
  exports: ['Watermark'],
  source: 'src/components/watermark/watermark.tsx',
  story: 'stories/watermark.stories.tsx',
  tests: ['tests/watermark/watermark.test.tsx'],
  semanticParts: ['root', 'mark'],
  usage: {
    description:
      'Repeats a text or image watermark over content and inherited dialog panels.',
  },
} satisfies ComponentDoc;
