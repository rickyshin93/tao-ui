import type { Meta, StoryObj } from '@storybook/react';
import { Statistic } from '../src/components/statistic/statistic';
export default {
  title: '数据展示 Data Display/Statistic',
  component: Statistic,
} satisfies Meta<typeof Statistic>;
export const Metrics: StoryObj<typeof Statistic> = {
  render: () => (
    <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
      <Statistic title="Active users" value={112893} />
      <Statistic title="Revenue" value={9342.75} precision={2} prefix="$" />
      <Statistic title="Completion" value={93.5} suffix="%" />
    </div>
  ),
};
const deadline = Date.now() + 3600000;
export const Timers: StoryObj<typeof Statistic> = {
  render: () => (
    <Statistic.Timer title="Offer ends in" type="countdown" value={deadline} />
  ),
};
