import type { ComponentDoc } from '../component-doc';
export const uploadDoc = {
  name: 'upload',
  displayName: 'Upload',
  category: 'Data Entry',
  description:
    'Select, transform, upload and manage files with real request progress and cancellation.',
  exports: ['Upload'],
  source: 'src/components/upload/upload.tsx',
  story: 'stories/upload.stories.tsx',
  tests: ['tests/upload/upload.test.tsx'],
  semanticParts: ['root', 'list', 'item', 'trigger'],
  keywords: ['upload', 'file', 'drop', 'request', 'progress'],
  related: ['Button', 'Progress'],
  usage: {
    description:
      'Provide an upload action or a customRequest transport, or return false from beforeUpload to manage files locally.',
    bestPractices: [
      'Return Upload.LIST_IGNORE to keep rejected files out of the list.',
      'Use onChange to synchronize controlled fileList values.',
      'Return an abort handler from customRequest for cancellation.',
    ],
    avoid: ['Do not mark a file successful until the server confirms it.'],
  },
} satisfies ComponentDoc;
