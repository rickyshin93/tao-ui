import type { Meta, StoryObj } from '@storybook/react';
import { Rate } from '../src/components/rate/rate';

const meta = {
  title: '数据录入 Data Entry/Rate',
  component: Rate,
  tags: ['autodocs'],
  args: { 'aria-label': 'Rating' },
} satisfies Meta<typeof Rate>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = { args: { defaultValue: 3 } };
export const Half: Story = { args: { defaultValue: 2.5, allowHalf: true } };
export const Tooltips: Story = {
  args: { tooltips: ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'] },
};
export const ReadOnly: Story = { args: { value: 4, readOnly: true } };
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <Rate size="small" defaultValue={2} />
      <Rate defaultValue={3} />
      <Rate size="large" defaultValue={4} />
    </div>
  ),
};
