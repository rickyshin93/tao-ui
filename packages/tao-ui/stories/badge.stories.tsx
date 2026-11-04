import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '../src/components/avatar/avatar';
import { Badge } from '../src/components/badge/badge';
export default {
  title: '数据展示 Data Display/Badge',
  component: Badge,
} satisfies Meta<typeof Badge>;
export const CountsAndStatus: StoryObj<typeof Badge> = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Badge count={12}>
        <Avatar>RH</Avatar>
      </Badge>
      <Badge count={120} />
      <Badge status="success" text="Available" />
      <Badge status="processing" text="Syncing" />
    </div>
  ),
};
export const Ribbon: StoryObj<typeof Badge> = {
  render: () => (
    <Badge.Ribbon text="Featured">
      <div
        style={{
          padding: 32,
          background: 'var(--tao-color-bg-container)',
          border: '1px solid var(--tao-color-border)',
          borderRadius: 'var(--tao-radius)',
        }}
      >
        Workspace
      </div>
    </Badge.Ribbon>
  ),
};
