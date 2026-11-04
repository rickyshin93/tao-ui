import type { Meta, StoryObj } from '@storybook/react';
import { List } from '../src/components/list/list';

const meta = {
  title: '数据展示 Data Display/List',
  component: List,
  tags: ['autodocs'],
} satisfies Meta<typeof List>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {
  render: () => (
    <List
      bordered
      header="Team"
      dataSource={['Alex', 'Jordan', 'Robin']}
      renderItem={(name) => (
        <List.Item
          actions={[
            <a key="view" href={`#${name}`}>
              View
            </a>,
          ]}
        >
          <List.Item.Meta title={name} description="Product team" />
        </List.Item>
      )}
    />
  ),
};
export const Paginated: Story = {
  render: () => (
    <List
      dataSource={Array.from({ length: 25 }, (_, i) => `Record ${i + 1}`)}
      renderItem={(name) => <List.Item>{name}</List.Item>}
      pagination={{
        defaultPageSize: 5,
        showTotal: (total) => `${total} records`,
      }}
    />
  ),
};
export const Grid: Story = {
  render: () => (
    <List
      grid={{ xs: 1, sm: 2, lg: 3, gutter: 16 }}
      dataSource={['Research', 'Design', 'Engineering']}
      renderItem={(name) => (
        <List.Item>
          <List.Item.Meta title={name} description="Responsive column" />
        </List.Item>
      )}
    />
  ),
};
export const Loading: Story = { args: { loading: true } };
