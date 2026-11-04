import type { Meta, StoryObj } from '@storybook/react';
import { Listy } from '../src/components/listy/listy';

const meta = {
  title: '数据展示 Data Display/Listy',
  component: Listy,
  tags: ['autodocs'],
} satisfies Meta<typeof Listy>;
export default meta;
type Story = StoryObj<typeof meta>;
const items = Array.from({ length: 500 }, (_, i) => ({
  id: i,
  title: `Record ${i + 1}`,
  group: Math.floor(i / 10),
}));
export const Basic: Story = {
  render: () => (
    <Listy
      items={items.slice(0, 5)}
      rowKey="id"
      itemRender={(item) => item.title}
    />
  ),
};
export const Virtual: Story = {
  render: () => (
    <Listy
      items={items}
      rowKey="id"
      height={280}
      virtual
      itemRender={(item) => item.title}
    />
  ),
};
export const Grouped: Story = {
  render: () => (
    <Listy
      items={items}
      rowKey="id"
      height={280}
      virtual
      sticky
      group={{
        key: (item) => item.group,
        title: (key, rows) => `Group ${key + 1} · ${rows.length} records`,
      }}
      itemRender={(item) => item.title}
    />
  ),
};
