import type { Meta, StoryObj } from '@storybook/react';
import { Input, Stack, FormField } from 'tao-ui';

const meta: Meta = {
  title: '数据录入 Data Entry/Input',
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <Input placeholder="Default input" />
      <Input placeholder="With prefix" prefix={<span>🔍</span>} />
      <Input placeholder="With suffix" suffix={<span>USD</span>} />
      <Input value="Error state" error />
      <Input placeholder="Disabled" disabled />
    </Stack>
  ),
};

export const Variants: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <Input placeholder="Outlined (default)" variant="outlined" />
      <Input placeholder="Filled" variant="filled" />
      <Input placeholder="Borderless" variant="borderless" />
    </Stack>
  ),
};
