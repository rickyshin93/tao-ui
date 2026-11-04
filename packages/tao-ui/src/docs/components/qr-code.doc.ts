import type { ComponentDoc } from '../component-doc';
export const qrCodeDoc = {
  name: 'qr-code',
  displayName: 'QRCode',
  category: 'Data Display',
  description:
    'Encode a value as a canvas or SVG QR code with status and refresh controls.',
  exports: ['QRCode'],
  source: 'src/components/qr-code/qr-code.tsx',
  story: 'stories/qr-code.stories.tsx',
  tests: ['tests/qr-code/qr-code.test.tsx'],
  semanticParts: ['root', 'cover'],
  keywords: ['qr', 'code', 'scan', 'canvas', 'svg'],
  related: ['Image', 'Spinner'],
  usage: {
    description:
      'Provide a stable value and choose canvas for bitmap download or SVG for resolution-independent output.',
    bestPractices: [
      'Use a high-contrast foreground and background.',
      'Keep the quiet zone clear.',
      'Use onRefresh for expired tokens.',
    ],
    avoid: ['Do not use a large center icon with low error correction.'],
  },
} satisfies ComponentDoc;
