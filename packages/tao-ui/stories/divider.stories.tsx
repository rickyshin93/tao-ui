import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from '../src/components/divider/divider';
export default {
  title: '布局 Layout/Divider',
  component: Divider,
} satisfies Meta<typeof Divider>;
export const Variants: StoryObj<typeof Divider> = {
  render: () => (
    <div>
      <p>Profile details</p>
      <Divider titlePlacement="start">Permissions</Divider>
      <p>Workspace access</p>
      <Divider variant="dashed" />
      <span>View</span>
      <Divider orientation="vertical" />
      <span>Edit</span>
    </div>
  ),
};
