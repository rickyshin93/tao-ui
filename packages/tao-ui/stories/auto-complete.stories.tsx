import type { Meta, StoryObj } from '@storybook/react';
import { AutoComplete } from '../src/components/auto-complete/auto-complete';
import { Input } from '../src/components/input/input';

const options = [
  { value: 'alice@example.com', label: 'Alice' },
  { value: 'bob@example.com', label: 'Bob' },
];
const meta = {
  title: '数据录入 Data Entry/AutoComplete',
  component: AutoComplete,
  args: {
    options,
    placeholder: 'Type an email address',
    style: { width: 320 },
    allowClear: true,
  },
} satisfies Meta<typeof AutoComplete>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {};
export const Search: Story = {
  args: {
    showSearch: {
      filterOption: (search, option) => String(option?.value).includes(search),
    },
  },
};
export const KeyboardBackfill: Story = { args: { backfill: true } };
export const CustomInput: Story = {
  render: (args) => (
    <AutoComplete {...args}>
      <Input prefix="@" placeholder="Search a person" />
    </AutoComplete>
  ),
};
export const Grouped: Story = {
  args: { options: [{ label: 'People', options }] },
};
