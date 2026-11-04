import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '../src/components/skeleton/skeleton';

export default { title: '反馈 Feedback/Skeleton' } satisfies Meta;

export const Basic: StoryObj = {
  render: () => <Skeleton active avatar paragraph={{ rows: 3 }} />,
};
