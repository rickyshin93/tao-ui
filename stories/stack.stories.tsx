import {
  Stack,
} from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: '布局 Layout/Stack',
};
export default meta;

export const Horizontal: StoryObj = {
  render: () => (
    <Stack direction="horizontal" gap="md">
      <div
        style={{
          padding: 16,
          background: 'var(--tao-color-fill-tertiary)',
          borderRadius: 6,
        }}
      >
        A
      </div>
      <div
        style={{
          padding: 16,
          background: 'var(--tao-color-fill-tertiary)',
          borderRadius: 6,
        }}
      >
        B
      </div>
      <div
        style={{
          padding: 16,
          background: 'var(--tao-color-fill-tertiary)',
          borderRadius: 6,
        }}
      >
        C
      </div>
    </Stack>
  ),
};

export const Vertical: StoryObj = {
  render: () => (
    <Stack direction="vertical" gap="sm">
      <div
        style={{
          padding: 12,
          background: 'var(--tao-color-fill-tertiary)',
          borderRadius: 6,
        }}
      >
        Item 1
      </div>
      <div
        style={{
          padding: 12,
          background: 'var(--tao-color-fill-tertiary)',
          borderRadius: 6,
        }}
      >
        Item 2
      </div>
      <div
        style={{
          padding: 12,
          background: 'var(--tao-color-fill-tertiary)',
          borderRadius: 6,
        }}
      >
        Item 3
      </div>
    </Stack>
  ),
};

export const Responsive: StoryObj = {
  render: () => (
    <Stack
      direction={{ xs: 'vertical', md: 'horizontal' }}
      gap={{ xs: 'sm', md: 'lg' }}
      align="start"
    >
      {['Alpha', 'Beta', 'Gamma'].map((label) => (
        <div
          key={label}
          style={{
            padding: 16,
            background: 'var(--tao-color-fill-tertiary)',
            borderRadius: 6,
          }}
        >
          {label}
        </div>
      ))}
    </Stack>
  ),
};
