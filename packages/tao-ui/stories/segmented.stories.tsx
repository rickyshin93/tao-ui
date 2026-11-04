import type { Meta, StoryObj } from '@storybook/react';
import { Segmented } from '../src/components/segmented/segmented';
export default {
  title: '数据录入 Data Entry/Segmented',
  component: Segmented,
} satisfies Meta<typeof Segmented>;
export const Views: StoryObj<typeof Segmented> = {
  args: {
    options: [
      'Day',
      'Week',
      'Month',
      { value: 'Year', label: 'Year', disabled: true },
    ],
  },
};
export const Round: StoryObj<typeof Segmented> = {
  args: { options: ['List', 'Board', 'Calendar'], shape: 'round', block: true },
};
export const Vertical: StoryObj<typeof Segmented> = {
  args: {
    options: ['Overview', 'Activity', 'Settings'],
    orientation: 'vertical',
  },
};
