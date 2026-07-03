import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Table, type TableColumn } from '../../src/components/table/table';
import { TaoProvider } from '../../src/provider/tao-provider';

interface User {
  id: number;
  name: string;
  age: number;
  role: string;
}

const data: User[] = [
  { id: 1, name: 'Alice', age: 30, role: 'admin' },
  { id: 2, name: 'Bob', age: 25, role: 'user' },
  { id: 3, name: 'Charlie', age: 35, role: 'user' },
  { id: 4, name: 'Diana', age: 28, role: 'admin' },
  { id: 5, name: 'Eve', age: 22, role: 'user' },
];

const columns: TableColumn<User>[] = [
  { key: 'name', dataIndex: 'name', title: 'Name' },
  { key: 'age', dataIndex: 'age', title: 'Age' },
  { key: 'role', dataIndex: 'role', title: 'Role' },
];

// ---- Basic rendering ----

test('renders all rows', () => {
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
    />,
  );
  expect(screen.getByText('Alice')).toBeTruthy();
  expect(screen.getByText('Bob')).toBeTruthy();
  expect(screen.getByText('Charlie')).toBeTruthy();
});

test('renders column headers', () => {
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
    />,
  );
  expect(screen.getByText('Name')).toBeTruthy();
  expect(screen.getByText('Age')).toBeTruthy();
  expect(screen.getByText('Role')).toBeTruthy();
});

test('shows empty text when no data', () => {
  render(<Table columns={columns} dataSource={[]} rowKey="id" />);
  expect(screen.getByText('No Data')).toBeTruthy();
});

test('custom emptyText', () => {
  render(
    <Table
      columns={columns}
      dataSource={[]}
      rowKey="id"
      emptyText="Nothing here"
    />,
  );
  expect(screen.getByText('Nothing here')).toBeTruthy();
});

test('custom render function', () => {
  const cols: TableColumn<User>[] = [
    { key: 'name', dataIndex: 'name', title: 'Name', render: (v) => `>> ${v}` },
  ];
  render(
    <Table columns={cols} dataSource={data} rowKey="id" pagination={false} />,
  );
  expect(screen.getByText('>> Alice')).toBeTruthy();
});

test('rowKey as function', () => {
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey={(r) => `user-${r.id}`}
      pagination={false}
    />,
  );
  expect(screen.getByText('Alice')).toBeTruthy();
});

// ---- Size ----

test('inherits size from TaoProvider', () => {
  const { container } = render(
    <TaoProvider size="small">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={false}
      />
    </TaoProvider>,
  );
  const wrapper = container.querySelector(
    '[data-tao-table-wrapper]',
  ) as HTMLElement;
  expect(wrapper.dataset.taoSize).toBe('small');
});

// ---- Bordered ----

test('bordered adds data attribute', () => {
  const { container } = render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      bordered
      pagination={false}
    />,
  );
  const wrapper = container.querySelector(
    '[data-tao-table-wrapper]',
  ) as HTMLElement;
  expect(wrapper.dataset.taoBordered).toBeTruthy();
});

// ---- Variant ----

test('defaults to modern variant', () => {
  const { container } = render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
    />,
  );
  const wrapper = container.querySelector(
    '[data-tao-table-wrapper]',
  ) as HTMLElement;
  expect(wrapper.dataset.taoVariant).toBe('modern');
  expect(wrapper.dataset.taoBordered).toBeTruthy();
});

// ---- Header background ----

test('header background on by default (no off attribute)', () => {
  const { container } = render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
    />,
  );
  const wrapper = container.querySelector(
    '[data-tao-table-wrapper]',
  ) as HTMLElement;
  expect(wrapper.dataset.taoHeaderBg).toBeUndefined();
});

test('headerBackground={false} marks the wrapper for a minimal header', () => {
  const { container } = render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      headerBackground={false}
      pagination={false}
    />,
  );
  const wrapper = container.querySelector(
    '[data-tao-table-wrapper]',
  ) as HTMLElement;
  expect(wrapper.dataset.taoHeaderBg).toBe('off');
});

test('borderless variant sets data attribute and no border', () => {
  const { container } = render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      variant="borderless"
      pagination={false}
    />,
  );
  const wrapper = container.querySelector(
    '[data-tao-table-wrapper]',
  ) as HTMLElement;
  expect(wrapper.dataset.taoVariant).toBe('borderless');
  expect(wrapper.dataset.taoBordered).toBeFalsy();
});

test('outlined variant implies border', () => {
  const { container } = render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      variant="outlined"
      pagination={false}
    />,
  );
  const wrapper = container.querySelector(
    '[data-tao-table-wrapper]',
  ) as HTMLElement;
  expect(wrapper.dataset.taoVariant).toBe('outlined');
  expect(wrapper.dataset.taoBordered).toBeTruthy();
});

test('modern variant sets data attribute and subtle frame', () => {
  const { container } = render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      variant="modern"
      pagination={false}
    />,
  );
  const wrapper = container.querySelector(
    '[data-tao-table-wrapper]',
  ) as HTMLElement;
  expect(wrapper.dataset.taoVariant).toBe('modern');
  expect(wrapper.dataset.taoBordered).toBeTruthy();
});

test('borderless ignores bordered prop', () => {
  const { container } = render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      variant="borderless"
      bordered
      pagination={false}
    />,
  );
  const wrapper = container.querySelector(
    '[data-tao-table-wrapper]',
  ) as HTMLElement;
  expect(wrapper.dataset.taoBordered).toBeFalsy();
});

test('inherits variant from TaoProvider', () => {
  const { container } = render(
    <TaoProvider variant="borderless">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={false}
      />
    </TaoProvider>,
  );
  const wrapper = container.querySelector(
    '[data-tao-table-wrapper]',
  ) as HTMLElement;
  expect(wrapper.dataset.taoVariant).toBe('borderless');
});

// ---- Sorting ----

test('client-side sort on click', () => {
  const sortColumns: TableColumn<User>[] = [
    { key: 'name', dataIndex: 'name', title: 'Name' },
    {
      key: 'age',
      dataIndex: 'age',
      title: 'Age',
      sorter: (a, b) => a.age - b.age,
    },
  ];
  render(
    <Table
      columns={sortColumns}
      dataSource={data}
      rowKey="id"
      pagination={false}
    />,
  );

  const ageHeader = screen.getByText('Age');
  fireEvent.click(ageHeader);

  // After ascending sort, first row should be Eve (22)
  const cells = screen.getAllByRole('cell');
  // Find the first age cell (column index 1 -> index 1 in each row)
  const rows = screen.getAllByRole('row');
  // rows[0] = header, rows[1] = first data row
  const firstRowCells = rows[1].querySelectorAll('td');
  expect(firstRowCells[1].textContent).toBe('22');
});

test('sort cycles ascend -> descend -> null', () => {
  const sortColumns: TableColumn<User>[] = [
    {
      key: 'age',
      dataIndex: 'age',
      title: 'Age',
      sorter: (a, b) => a.age - b.age,
    },
  ];
  let lastSorter: any = null;
  render(
    <Table
      columns={sortColumns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      onChange={(_p, _f, s) => {
        lastSorter = s;
      }}
    />,
  );
  const header = screen.getByText('Age');

  fireEvent.click(header); // ascend
  expect(lastSorter.order).toBe('ascend');

  fireEvent.click(header); // descend
  expect(lastSorter.order).toBe('descend');

  fireEvent.click(header); // null
  expect(lastSorter.order).toBe(null);
});

// ---- Filtering ----

test('client-side filter', () => {
  const filterColumns: TableColumn<User>[] = [
    { key: 'name', dataIndex: 'name', title: 'Name' },
    {
      key: 'role',
      dataIndex: 'role',
      title: 'Role',
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
      ],
      onFilter: (value, record) => record.role === value,
    },
  ];
  render(
    <Table
      columns={filterColumns}
      dataSource={data}
      rowKey="id"
      pagination={false}
    />,
  );

  // Click filter trigger
  const filterBtn = screen.getByLabelText('Filter');
  fireEvent.click(filterBtn);

  // Click "Admin" option
  fireEvent.click(screen.getByText('Admin'));

  // Should only show admins (Alice, Diana)
  expect(screen.getByText('Alice')).toBeTruthy();
  expect(screen.getByText('Diana')).toBeTruthy();
  expect(screen.queryByText('Bob')).toBeNull();
});

// ---- Pagination ----

test('paginates data by default (10 per page)', () => {
  const bigData = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    name: `User ${i}`,
    age: 20 + i,
    role: 'user',
  }));
  render(<Table columns={columns} dataSource={bigData} rowKey="id" />);

  // Should show first 10
  expect(screen.getByText('User 0')).toBeTruthy();
  expect(screen.getByText('User 9')).toBeTruthy();
  expect(screen.queryByText('User 10')).toBeNull();
});

test('pagination: false shows all data', () => {
  const bigData = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    name: `User ${i}`,
    age: 20 + i,
    role: 'user',
  }));
  render(
    <Table
      columns={columns}
      dataSource={bigData}
      rowKey="id"
      pagination={false}
    />,
  );
  expect(screen.getByText('User 0')).toBeTruthy();
  expect(screen.getByText('User 24')).toBeTruthy();
});

// ---- Row selection ----

test('rowSelection renders checkboxes', () => {
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      rowSelection={{ selectedRowKeys: [], onChange: () => {} }}
    />,
  );
  const checkboxes = screen.getAllByRole('checkbox');
  // 1 header checkbox + 5 row checkboxes
  expect(checkboxes.length).toBe(6);
});

test('rowSelection onChange fires', () => {
  let keys: React.Key[] = [];
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      rowSelection={{
        selectedRowKeys: [],
        onChange: (k) => {
          keys = k;
        },
      }}
    />,
  );
  const checkboxes = screen.getAllByRole('checkbox');
  fireEvent.click(checkboxes[1]); // first row
  expect(keys).toEqual([1]);
});

test('select all checkbox', () => {
  let keys: React.Key[] = [];
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      rowSelection={{
        selectedRowKeys: [],
        onChange: (k) => {
          keys = k;
        },
      }}
    />,
  );
  const selectAll = screen.getAllByRole('checkbox')[0];
  fireEvent.click(selectAll);
  expect(keys).toEqual([1, 2, 3, 4, 5]);
});

// ---- Loading ----

test('loading shows spinner overlay', () => {
  const { container } = render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading
      pagination={false}
    />,
  );
  expect(container.querySelector('[data-tao-table-loading]')).toBeTruthy();
});
