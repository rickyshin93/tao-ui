import type { Meta, StoryObj } from '@storybook/react';
import { Watermark } from '../src/components/watermark/watermark';
export default {
  title: '通用 General/Watermark',
  component: Watermark,
} satisfies Meta<typeof Watermark>;
export const Confidential: StoryObj<typeof Watermark> = {
  args: {
    content: ['Tao workspace', 'Confidential'],
    children: (
      <div style={{ minHeight: 320, padding: 24 }}>
        This content is marked with repeating text.
      </div>
    ),
  },
};
export const LineFonts: StoryObj<typeof Watermark> = {
  args: {
    content: [
      { text: 'REVIEW', font: { fontWeight: 700 } },
      { text: 'Internal copy', font: { fontSize: 12 } },
    ],
    rotate: -30,
    gap: [80, 80],
    children: <div style={{ height: 320 }} />,
  },
};
