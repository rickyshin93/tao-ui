import { Button, FormField, Input, Stack, TaoProvider } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: '配置 Config/TaoProvider',
};
export default meta;

export const GlobalSize: StoryObj = {
  name: 'Global Size',
  render: () => (
    <Stack gap="lg">
      <TaoProvider size="small">
        <Stack direction="horizontal" gap="sm" align="center">
          <span style={{ fontSize: 12, color: '#888', minWidth: 60 }}>
            small
          </span>
          <Button>Button</Button>
          <Input placeholder="Input" style={{ width: 160 }} />
        </Stack>
      </TaoProvider>
      <TaoProvider size="medium">
        <Stack direction="horizontal" gap="sm" align="center">
          <span style={{ fontSize: 12, color: '#888', minWidth: 60 }}>
            medium
          </span>
          <Button>Button</Button>
          <Input placeholder="Input" style={{ width: 160 }} />
        </Stack>
      </TaoProvider>
      <TaoProvider size="large">
        <Stack direction="horizontal" gap="sm" align="center">
          <span style={{ fontSize: 12, color: '#888', minWidth: 60 }}>
            large
          </span>
          <Button>Button</Button>
          <Input placeholder="Input" style={{ width: 160 }} />
        </Stack>
      </TaoProvider>
    </Stack>
  ),
};

export const GlobalVariant: StoryObj = {
  name: 'Global Variant',
  render: () => (
    <Stack gap="lg" style={{ maxWidth: 300 }}>
      <TaoProvider variant="outlined">
        <FormField label="Outlined">
          <Input placeholder="outlined" />
        </FormField>
      </TaoProvider>
      <TaoProvider variant="filled">
        <FormField label="Filled">
          <Input placeholder="filled" />
        </FormField>
      </TaoProvider>
      <TaoProvider variant="borderless">
        <FormField label="Borderless">
          <Input placeholder="borderless" />
        </FormField>
      </TaoProvider>
    </Stack>
  ),
};
