import type { Meta, StoryObj } from '@storybook/react';
import dayjs from 'dayjs';
import { Calendar } from '../src/components/calendar/calendar';

const meta = {
  title: '数据展示 Data Display/Calendar',
  component: Calendar,
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { defaultValue: dayjs('2026-11-04') } };
export const Compact: Story = {
  args: { fullscreen: false },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <Calendar {...args} />
    </div>
  ),
};
export const Events: Story = {
  args: { cellRender: (date) => (date.date() === 12 ? 'Team review' : null) },
};
