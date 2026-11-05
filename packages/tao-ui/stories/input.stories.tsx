import { Input, Stack } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';

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

export const InputFamily: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <Input
        aria-label="Name"
        defaultValue="tao-ui"
        allowClear
        showCount
        maxLength={24}
      />
      <Input
        aria-label="Underlined"
        variant="underlined"
        placeholder="Underlined"
      />
      <Input.Password aria-label="Password" defaultValue="secret" allowClear />
      <Input.Search aria-label="Search" enterButton="Search" allowClear />
      <Input.TextArea
        aria-label="Description"
        autoSize={{ minRows: 2, maxRows: 5 }}
        showCount
        allowClear
      />
      <Input.OTP aria-label="Verification code" length={6} />
    </Stack>
  ),
};
