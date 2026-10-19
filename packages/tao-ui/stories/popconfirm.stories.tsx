import { Button, Popconfirm } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: '反馈 Feedback/Popconfirm',
};
export default meta;

export const Basic: StoryObj = {
  name: 'Delete confirm',
  render: () => (
    <Popconfirm
      title="Delete this item?"
      onConfirm={() => console.log('confirmed')}
      onCancel={() => console.log('cancelled')}
    >
      <Button variant="destructive">Delete</Button>
    </Popconfirm>
  ),
};

export const WithDescription: StoryObj = {
  name: 'With description',
  render: () => (
    <Popconfirm
      title="Delete this item?"
      description="This action cannot be undone. The item will be permanently removed."
      onConfirm={() => console.log('confirmed')}
    >
      <Button variant="destructive">Delete</Button>
    </Popconfirm>
  ),
};

export const CustomButtons: StoryObj = {
  name: 'Custom buttons',
  render: () => (
    <Popconfirm
      title="Leave this page?"
      description="Unsaved changes will be lost."
      okText="Leave"
      cancelText="Stay"
      okButtonProps={{ variant: 'destructive' }}
      onConfirm={() => console.log('confirmed')}
    >
      <Button variant="secondary">Navigate away</Button>
    </Popconfirm>
  ),
};
