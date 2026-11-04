import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Transfer,
  type TransferKey,
} from '../src/components/transfer/transfer';

const meta = {
  title: '数据录入 Data Entry/Transfer',
  component: Transfer,
  tags: ['autodocs'],
} satisfies Meta<typeof Transfer>;
export default meta;
type Story = StoryObj<typeof meta>;
const items = Array.from({ length: 20 }, (_, i) => ({
  key: String(i),
  title: `Record ${i + 1}`,
  disabled: i === 4,
}));
function Example({
  oneWay = false,
  pagination = false,
}: {
  oneWay?: boolean;
  pagination?: boolean;
}) {
  const [keys, setKeys] = useState<TransferKey[]>(['1', '3']);
  return (
    <Transfer
      dataSource={items}
      targetKeys={keys}
      onChange={setKeys}
      render={(item) => item.title}
      showSearch
      oneWay={oneWay}
      pagination={pagination && { pageSize: 5 }}
    />
  );
}
export const Basic: Story = { render: () => <Example /> };
export const OneWay: Story = { render: () => <Example oneWay /> };
export const Pagination: Story = { render: () => <Example pagination /> };
export const Disabled: Story = {
  args: {
    dataSource: items,
    targetKeys: ['1'],
    disabled: true,
    render: (item) => item.title ?? '',
  },
};
