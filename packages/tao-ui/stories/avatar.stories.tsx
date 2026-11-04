import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '../src/components/avatar/avatar';
export default {
  title: '数据展示 Data Display/Avatar',
  component: Avatar,
} satisfies Meta<typeof Avatar>;
export const People: StoryObj<typeof Avatar> = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <Avatar size="large">RH</Avatar>
      <Avatar shape="square">Ada</Avatar>
      <Avatar.Group max={{ count: 2, popover: { trigger: 'click' } }}>
        <Avatar>AB</Avatar>
        <Avatar>CD</Avatar>
        <Avatar>EF</Avatar>
        <Avatar>GH</Avatar>
      </Avatar.Group>
    </div>
  ),
};
