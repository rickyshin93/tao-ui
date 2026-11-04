import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '../src/components/slider/slider';

const meta = {
  title: '数据录入 Data Entry/Slider',
  component: Slider,
  tags: ['autodocs'],
  args: { ariaLabelForHandle: 'Value' },
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = { args: { defaultValue: 30 } };
export const Range: Story = {
  args: {
    range: true,
    defaultValue: [20, 60],
    ariaLabelForHandle: ['Minimum', 'Maximum'],
  },
};
export const DraggableRange: Story = {
  args: { range: { draggableTrack: true }, defaultValue: [20, 60] },
};
export const Editable: Story = {
  args: {
    range: { editable: true, minCount: 2, maxCount: 5 },
    defaultValue: [15, 35, 70],
  },
};
export const Marks: Story = {
  args: {
    marks: { 0: 'Low', 25: '25%', 50: '50%', 100: 'High' },
    defaultValue: 25,
    step: null,
  },
};
export const Vertical: Story = {
  render: () => (
    <div style={{ height: 240 }}>
      <Slider orientation="vertical" defaultValue={40} />
    </div>
  ),
};
