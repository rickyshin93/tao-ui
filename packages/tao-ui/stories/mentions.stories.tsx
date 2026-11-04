import type { Meta, StoryObj } from '@storybook/react';
import { Mentions } from '../src/components/mentions/mentions';

const options = [
  { value: 'alice', label: 'Alice Chen' },
  { value: 'bob', label: 'Bob Li' },
  { value: 'design', label: 'Design team' },
];
const meta = {
  title: '数据录入 Data Entry/Mentions',
  component: Mentions,
  args: {
    options,
    placeholder: 'Use @ to mention a teammate',
    rows: 3,
    style: { width: 360 },
  },
} satisfies Meta<typeof Mentions>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {};
export const MultiplePrefixes: Story = {
  args: { prefix: ['@', '#'], placeholder: 'Mention with @ or #' },
};
export const Clear: Story = {
  args: { defaultValue: 'Review this with @alice ', allowClear: true },
};
export const Loading: Story = { args: { loading: true } };
export const AutoSize: Story = {
  args: { autoSize: { minRows: 2, maxRows: 6 } },
};
