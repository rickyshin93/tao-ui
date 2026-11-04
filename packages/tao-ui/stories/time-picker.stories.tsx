import type { Meta, StoryObj } from '@storybook/react';
import dayjs from 'dayjs';
import { TimePicker } from '../src/components/time-picker/time-picker';

const meta = {
  title: '数据录入 Data Entry/TimePicker',
  component: TimePicker,
  args: { defaultValue: dayjs('2026-11-04T09:30:00') },
} satisfies Meta<typeof TimePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
export const HoursAndMinutes: Story = {
  args: { format: 'HH:mm', minuteStep: 15 },
};
export const TwelveHours: Story = { args: { use12Hours: true } };
export const ImmediateSelection: Story = { args: { needConfirm: false } };
export const DisabledHours: Story = {
  args: {
    disabledTime: () => ({ disabledHours: () => [0, 1, 2, 3, 4, 5, 22, 23] }),
  },
};
export const Range: Story = {
  render: () => (
    <TimePicker.RangePicker
      format="HH:mm"
      defaultValue={[
        dayjs('2026-11-04T09:00:00'),
        dayjs('2026-11-04T18:00:00'),
      ]}
    />
  ),
};
