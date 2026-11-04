import type { ComponentDoc } from '../component-doc';
export const imageDoc = {
  name: 'image',
  displayName: 'Image',
  category: 'Data Display',
  description:
    'Images with keyboard-accessible preview, grouping, transforms, fallbacks and upload progress.',
  exports: ['Image', 'ImagePreviewGroup'],
  source: 'src/components/image/image.tsx',
  story: 'stories/image.stories.tsx',
  tests: ['tests/image/image.test.tsx'],
  semanticParts: [
    'root',
    'image',
    'cover',
    'popup.root',
    'popup.mask',
    'popup.body',
    'popup.footer',
    'popup.actions',
    'popup.close',
    'placeholder.progress.root',
    'placeholder.progress.content',
    'placeholder.progress.rail',
    'placeholder.progress.indicator',
  ],
  usage: {
    description:
      'Images with keyboard-accessible preview, grouping, transforms, fallbacks and upload progress.',
    bestPractices: [
      'Provide meaningful labels and concise content.',
      'Keep controlled state synchronized through the change callbacks.',
    ],
  },
} satisfies ComponentDoc;
