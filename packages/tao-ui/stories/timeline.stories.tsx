import type { Meta, StoryObj } from '@storybook/react';
import { Timeline } from '../src/components/timeline/timeline';
export default {
  title: '数据展示 Data Display/Timeline',
  component: Timeline,
} satisfies Meta<typeof Timeline>;
export const Activity: StoryObj<typeof Timeline> = {
  args: {
    items: [
      { title: '09:00', content: 'Workspace created', color: 'green' },
      { title: '09:20', content: 'Team members invited' },
      { title: '09:45', content: 'Sync in progress', loading: true },
    ],
  },
};
export const Alternate: StoryObj<typeof Timeline> = {
  args: { ...Activity.args, mode: 'alternate' },
};
export const Horizontal: StoryObj<typeof Timeline> = {
  args: { ...Activity.args, orientation: 'horizontal' },
};
