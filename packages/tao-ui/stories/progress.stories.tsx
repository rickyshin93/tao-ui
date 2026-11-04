import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from '../src/components/progress/progress';

export default { title: '反馈 Feedback/Progress' } satisfies Meta;

export const Basic: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Progress percent={48} status="active" />
      <div style={{ display: 'flex', gap: 24 }}>
        <Progress type="circle" percent={70} success={{ percent: 30 }} />
        <Progress type="dashboard" percent={65} steps={{ count: 20, gap: 3 }} />
      </div>
    </div>
  ),
};
