import { Button, Stack } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: '通用 General/Button',
};
export default meta;

export const Variants: StoryObj = {
  render: () => (
    <Stack direction="horizontal" gap="sm">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="bare">Bare</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="primary" disabled>
        Disabled
      </Button>
      <Button variant="primary" loading>
        Loading
      </Button>
    </Stack>
  ),
};

export const Sizes: StoryObj = {
  render: () => (
    <Stack direction="horizontal" gap="sm" align="center">
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </Stack>
  ),
};

export const WithIcon: StoryObj = {
  render: () => (
    <Stack direction="horizontal" gap="sm" align="center">
      <Button icon={<span>⬇</span>}>Icon</Button>
      <Button icon={<span>⬇</span>} loading>
        Loading
      </Button>
    </Stack>
  ),
};
