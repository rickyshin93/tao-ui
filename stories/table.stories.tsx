import { Stack, Table, type TableColumn } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta = {
  title: '数据展示 Data Display/Table',
};
export default meta;

// ---- Sample data ----

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  role: string;
  department: string;
}

const users: User[] = Array.from({ length: 46 }, (_, i) => ({
  id: i + 1,
  name: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank'][
    i % 8
  ],
  age: 22 + (i % 20),
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? 'admin' : i % 3 === 1 ? 'editor' : 'viewer',
  department: ['Engineering', 'Design', 'Marketing', 'Sales'][i % 4],
}));

const baseColumns: TableColumn<User>[] = [
  { key: 'id', dataIndex: 'id', title: 'ID', width: 60, align: 'center' },
  { key: 'name', dataIndex: 'name', title: 'Name' },
  { key: 'age', dataIndex: 'age', title: 'Age', width: 80 },
  { key: 'email', dataIndex: 'email', title: 'Email' },
  { key: 'role', dataIndex: 'role', title: 'Role' },
];

// ---- Stories ----

export const Basic: StoryObj = {
  render: () => <Table columns={baseColumns} dataSource={users} rowKey="id" />,
};

export const Bordered: StoryObj = {
  render: () => (
    <Table columns={baseColumns} dataSource={users} rowKey="id" bordered />
  ),
};

export const Variants: StoryObj = {
  name: 'Variants (filled / outlined / borderless / modern)',
  render: () => (
    <Stack gap="xl">
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
          filled（默认 / 灰底表头）
        </p>
        <Table
          columns={baseColumns}
          dataSource={users.slice(0, 4)}
          rowKey="id"
          variant="filled"
          pagination={false}
        />
      </div>
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
          outlined（带外框 + 列分隔线）
        </p>
        <Table
          columns={baseColumns}
          dataSource={users.slice(0, 4)}
          rowKey="id"
          variant="outlined"
          pagination={false}
        />
      </div>
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
          modern（轻外框 / shadcn-like）
        </p>
        <Table
          columns={baseColumns}
          dataSource={users.slice(0, 4)}
          rowKey="id"
          variant="modern"
          pagination={false}
        />
      </div>
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
          borderless（极简 / 无自带色）
        </p>
        <Table
          columns={baseColumns}
          dataSource={users.slice(0, 4)}
          rowKey="id"
          variant="borderless"
          pagination={false}
        />
      </div>
    </Stack>
  ),
};

export const Modern: StoryObj = {
  name: 'Modern',
  render: () => (
    <Table
      columns={baseColumns}
      dataSource={users}
      rowKey="id"
      variant="modern"
    />
  ),
};

export const Minimal: StoryObj = {
  name: 'Minimal (borderless)',
  render: () => {
    interface Sound {
      id: number;
      description: string;
      category: string;
      duration: string;
      downloads: string;
    }
    const sounds: Sound[] = [
      {
        id: 1,
        description:
          'A single cute cat meow, playful and friendly. stylized game SFX, 0.4 seconds.',
        category: 'Animals › Cat Domestic',
        duration: '0.5s',
        downloads: '507',
      },
      {
        id: 2,
        description:
          "Create a short, friendly 'pop' (thud) sound effect for a button click or window…",
        category: 'User Interface › Click',
        duration: '2s',
        downloads: '181',
      },
      {
        id: 3,
        description:
          'Cute magical pop sound of throwing stones into the swamp, then a short…',
        category: 'Designed › Ethereal',
        duration: '7.1s',
        downloads: '91',
      },
      {
        id: 4,
        description:
          'Short positive organic interface resolution chime, 1.5 to 2 seconds, gentle…',
        category: 'User Interface',
        duration: '1s',
        downloads: '596',
      },
      {
        id: 5,
        description: 'high boom swoosh',
        category: 'Designed › Boom',
        duration: '4s',
        downloads: '1.8K',
      },
    ];
    const columns: TableColumn<Sound>[] = [
      {
        key: 'description',
        dataIndex: 'description',
        title: 'Description',
        render: (_v, record) => (
          <div>
            <div style={{ color: 'var(--tao-color-text)' }}>
              {record.description}
            </div>
            <div
              style={{
                color: 'var(--tao-color-text-tertiary)',
                fontSize: 13,
                marginTop: 2,
              }}
            >
              {record.category}
            </div>
          </div>
        ),
      },
      {
        key: 'duration',
        dataIndex: 'duration',
        title: 'Duration',
        width: 120,
        align: 'right',
      },
      {
        key: 'downloads',
        dataIndex: 'downloads',
        title: 'Downloads',
        width: 120,
        align: 'right',
      },
    ];
    return (
      <Table
        columns={columns}
        dataSource={sounds}
        rowKey="id"
        variant="borderless"
        pagination={false}
      />
    );
  },
};

export const Sizes: StoryObj = {
  render: () => (
    <Stack gap="xl">
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>small</p>
        <Table
          columns={baseColumns}
          dataSource={users.slice(0, 3)}
          rowKey="id"
          size="small"
          pagination={false}
        />
      </div>
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
          medium (default)
        </p>
        <Table
          columns={baseColumns}
          dataSource={users.slice(0, 3)}
          rowKey="id"
          size="medium"
          pagination={false}
        />
      </div>
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>large</p>
        <Table
          columns={baseColumns}
          dataSource={users.slice(0, 3)}
          rowKey="id"
          size="large"
          pagination={false}
        />
      </div>
    </Stack>
  ),
};

export const Sorting: StoryObj = {
  render: () => {
    const columns: TableColumn<User>[] = [
      {
        key: 'name',
        dataIndex: 'name',
        title: 'Name',
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        key: 'age',
        dataIndex: 'age',
        title: 'Age',
        sorter: (a, b) => a.age - b.age,
        defaultSortOrder: 'ascend',
      },
      { key: 'role', dataIndex: 'role', title: 'Role' },
    ];
    return <Table columns={columns} dataSource={users} rowKey="id" />;
  },
};

export const Filtering: StoryObj = {
  render: () => {
    const columns: TableColumn<User>[] = [
      { key: 'name', dataIndex: 'name', title: 'Name' },
      { key: 'age', dataIndex: 'age', title: 'Age' },
      {
        key: 'role',
        dataIndex: 'role',
        title: 'Role',
        filters: [
          { text: 'Admin', value: 'admin' },
          { text: 'Editor', value: 'editor' },
          { text: 'Viewer', value: 'viewer' },
        ],
        onFilter: (value, record) => record.role === value,
      },
      {
        key: 'department',
        dataIndex: 'department',
        title: 'Department',
        filters: [
          { text: 'Engineering', value: 'Engineering' },
          { text: 'Design', value: 'Design' },
          { text: 'Marketing', value: 'Marketing' },
          { text: 'Sales', value: 'Sales' },
        ],
        onFilter: (value, record) => record.department === value,
      },
    ];
    return <Table columns={columns} dataSource={users} rowKey="id" />;
  },
};

export const RowSelection: StoryObj = {
  render: () => {
    function Demo() {
      const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
      return (
        <Stack gap="sm">
          <p style={{ fontSize: 13, color: '#888' }}>
            Selected:{' '}
            {selectedKeys.length === 0 ? 'none' : selectedKeys.join(', ')}
          </p>
          <Table
            columns={baseColumns}
            dataSource={users}
            rowKey="id"
            rowSelection={{
              selectedRowKeys: selectedKeys,
              onChange: (keys) => setSelectedKeys(keys),
              getCheckboxProps: (record) => ({
                disabled: record.role === 'viewer',
              }),
            }}
          />
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const HorizontalScroll: StoryObj = {
  name: 'Fixed Columns + Scroll',
  render: () => {
    const columns: TableColumn<User>[] = [
      { key: 'id', dataIndex: 'id', title: 'ID', width: 80, fixed: 'left' },
      {
        key: 'name',
        dataIndex: 'name',
        title: 'Name',
        width: 150,
        fixed: 'left',
      },
      { key: 'age', dataIndex: 'age', title: 'Age', width: 100 },
      { key: 'email', dataIndex: 'email', title: 'Email', width: 250 },
      { key: 'role', dataIndex: 'role', title: 'Role', width: 120 },
      {
        key: 'department',
        dataIndex: 'department',
        title: 'Department',
        width: 150,
      },
      {
        key: 'actions',
        title: 'Actions',
        width: 120,
        fixed: 'right',
        render: () => (
          <button
            type="button"
            style={{
              padding: 0,
              border: 0,
              background: 'transparent',
              color: 'var(--tao-primary)',
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
        ),
      },
    ];
    return (
      <div style={{ maxWidth: 600 }}>
        <Table
          columns={columns}
          dataSource={users.slice(0, 8)}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={false}
        />
      </div>
    );
  },
};

export const Loading: StoryObj = {
  render: () => (
    <Table
      columns={baseColumns}
      dataSource={users.slice(0, 5)}
      rowKey="id"
      loading
      pagination={false}
    />
  ),
};

export const Empty: StoryObj = {
  render: () => (
    <Table
      columns={baseColumns}
      dataSource={[]}
      rowKey="id"
      emptyText="No users found."
    />
  ),
};

export const CustomPagination: StoryObj = {
  name: 'Custom Pagination',
  render: () => (
    <Table
      columns={baseColumns}
      dataSource={users}
      rowKey="id"
      pagination={{
        pageSize: 5,
        showSizeChanger: true,
        showTotal: (total, [s, e]) => `${s}-${e} of ${total} users`,
      }}
    />
  ),
};

export const FullFeature: StoryObj = {
  name: 'Full Feature Demo',
  render: () => {
    function Demo() {
      const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
      const columns: TableColumn<User>[] = [
        {
          key: 'id',
          dataIndex: 'id',
          title: 'ID',
          width: 60,
          align: 'center',
          fixed: 'left',
        },
        {
          key: 'name',
          dataIndex: 'name',
          title: 'Name',
          width: 120,
          fixed: 'left',
          sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
          key: 'age',
          dataIndex: 'age',
          title: 'Age',
          width: 80,
          sorter: (a, b) => a.age - b.age,
        },
        {
          key: 'email',
          dataIndex: 'email',
          title: 'Email',
          width: 220,
          ellipsis: true,
        },
        {
          key: 'role',
          dataIndex: 'role',
          title: 'Role',
          width: 120,
          filters: [
            { text: 'Admin', value: 'admin' },
            { text: 'Editor', value: 'editor' },
            { text: 'Viewer', value: 'viewer' },
          ],
          onFilter: (value, record) => record.role === value,
        },
        {
          key: 'department',
          dataIndex: 'department',
          title: 'Dept',
          width: 140,
          filters: [
            { text: 'Engineering', value: 'Engineering' },
            { text: 'Design', value: 'Design' },
            { text: 'Marketing', value: 'Marketing' },
            { text: 'Sales', value: 'Sales' },
          ],
          onFilter: (value, record) => record.department === value,
        },
        {
          key: 'actions',
          title: 'Actions',
          width: 100,
          fixed: 'right',
          render: () => (
            <button
              type="button"
              style={{
                padding: 0,
                border: 0,
                background: 'transparent',
                color: 'var(--tao-primary)',
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
          ),
        },
      ];
      return (
        <div style={{ maxWidth: 700 }}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            scroll={{ x: 1000 }}
            bordered
            rowSelection={{
              selectedRowKeys: selectedKeys,
              onChange: (keys) => setSelectedKeys(keys),
              fixed: true,
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `${total} users`,
            }}
          />
        </div>
      );
    }
    return <Demo />;
  },
};
