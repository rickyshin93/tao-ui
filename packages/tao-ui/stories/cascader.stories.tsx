import type { Meta, StoryObj } from '@storybook/react';
import { Cascader } from '../src/components/cascader/cascader';

const options = [
  {
    value: 'cn',
    label: 'China',
    children: [
      { value: 'sh', label: 'Shanghai' },
      { value: 'hz', label: 'Hangzhou' },
    ],
  },
  {
    value: 'jp',
    label: 'Japan',
    children: [{ value: 'tokyo', label: 'Tokyo' }],
  },
];
const meta = {
  title: '数据录入 Data Entry/Cascader',
  component: Cascader,
  args: { options, placeholder: 'Choose a location', style: { width: 320 } },
} satisfies Meta<typeof Cascader>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {};
export const Multiple: Story = { args: { multiple: true } };
export const Search: Story = { args: { showSearch: true } };
export const ChangeOnSelect: Story = { args: { changeOnSelect: true } };
export const Panel: Story = {
  render: () => <Cascader.Panel options={options} multiple />,
};
