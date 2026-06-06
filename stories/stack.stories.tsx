import type { Meta, StoryObj } from '@storybook/react';
import { Stack, FormLayout, FormSection, FormField, Input, Button, FormActions } from 'tao-ui';

const meta: Meta = {
  title: '布局 Layout/Stack',
};
export default meta;

export const Horizontal: StoryObj = {
  render: () => (
    <Stack direction="horizontal" gap="md">
      <div style={{ padding: 16, background: 'var(--tao-color-fill-tertiary)', borderRadius: 6 }}>A</div>
      <div style={{ padding: 16, background: 'var(--tao-color-fill-tertiary)', borderRadius: 6 }}>B</div>
      <div style={{ padding: 16, background: 'var(--tao-color-fill-tertiary)', borderRadius: 6 }}>C</div>
    </Stack>
  ),
};

export const Vertical: StoryObj = {
  render: () => (
    <Stack direction="vertical" gap="sm">
      <div style={{ padding: 12, background: 'var(--tao-color-fill-tertiary)', borderRadius: 6 }}>Item 1</div>
      <div style={{ padding: 12, background: 'var(--tao-color-fill-tertiary)', borderRadius: 6 }}>Item 2</div>
      <div style={{ padding: 12, background: 'var(--tao-color-fill-tertiary)', borderRadius: 6 }}>Item 3</div>
    </Stack>
  ),
};
