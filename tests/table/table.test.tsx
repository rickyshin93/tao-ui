import { afterEach, expect, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import {
  type SorterResult,
  Table,
  type TableColumn,
  type TableProps,
} from '../../src/components/table/table';
import { TaoProvider } from '../../src/provider/tao-provider';
import { restoreViewport, setViewportWidth } from '../utils/mock-viewport';

afterEach(() => {
  restoreViewport();
});

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

// ---- Customization ----

test('supports semantic classNames and styles as functions', () => {
  const { container } = render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      size="small"
      classNames={({ props }) => ({
        root: props.size === 'small' ? 'table-small-root' : 'table-root',
        'header.cell': 'table-header-cell',
        'header.content': 'table-header-content',
        'body.cell': 'table-body-cell',
      })}
      styles={({ props }) => ({
        root: { color: props.size === 'small' ? 'rgb(1, 2, 3)' : undefined },
        'header.cell': { padding: 11 },
      })}
    />,
  );
  expect(container.querySelector('.table-small-root')).toBeTruthy();
  expect(container.querySelector('.table-header-cell')).toBeTruthy();
  expect(container.querySelector('.table-header-content')).toBeTruthy();
  expect(container.querySelector('.table-body-cell')).toBeTruthy();
  const wrapper = container.querySelector(
    '[data-tao-table-wrapper]',
  ) as HTMLElement;
  expect(wrapper.style.color).toBe('rgb(1, 2, 3)');
});

test('supports row props and row class/style hooks', () => {
  let clickedId: number | null = null;
  const { container } = render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      rowClassName={(record) =>
        record.id === 1 ? 'first-row-class' : 'other-row-class'
      }
      rowStyle={(record) =>
        record.id === 1 ? { backgroundColor: 'rgb(4, 5, 6)' } : {}
      }
      onRow={(record) => ({
        'data-row-id': String(record.id),
        className: 'row-prop-class',
        onClick: () => {
          clickedId = record.id;
        },
      })}
    />,
  );
  const firstRow = container.querySelector('[data-row-id="1"]') as HTMLElement;
  expect(firstRow.className).toContain('first-row-class');
  expect(firstRow.className).toContain('row-prop-class');
  expect(firstRow.style.backgroundColor).toBe('rgb(4, 5, 6)');
  fireEvent.click(firstRow);
  expect(clickedId).toBe(1);
});

test('supports column cell and header cell props', () => {
  const customColumns: TableColumn<User>[] = [
    {
      key: 'name',
      dataIndex: 'name',
      title: 'Name',
      onHeaderCell: () => ({
        className: 'name-header',
        'data-header': 'name',
      }),
      onCell: (record) => ({
        className: record.id === 1 ? 'first-name-cell' : undefined,
        'data-cell-id': String(record.id),
      }),
    },
  ];

  const { container } = render(
    <Table
      columns={customColumns}
      dataSource={data}
      rowKey="id"
      pagination={false}
    />,
  );
  expect(container.querySelector('[data-header="name"]')).toBeTruthy();
  expect(container.querySelector('.name-header')).toBeTruthy();
  expect(container.querySelector('[data-cell-id="1"]')).toBeTruthy();
  expect(container.querySelector('.first-name-cell')).toBeTruthy();
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
  let lastSorter: SorterResult<User> = { order: null };
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

test('sortable headers expose aria-sort and plain headers are not disabled buttons', () => {
  render(
    <Table
      columns={[
        { key: 'name', dataIndex: 'name', title: 'Name' },
        {
          key: 'age',
          dataIndex: 'age',
          title: 'Age',
          sorter: (a, b) => a.age - b.age,
        },
      ]}
      dataSource={data}
      rowKey="id"
      pagination={false}
    />,
  );

  expect(screen.queryByRole('button', { name: 'Name' })).toBeNull();
  const ageButton = screen.getByRole('button', { name: 'Age' });
  const ageHeader = ageButton.closest('th')!;
  expect(ageHeader.getAttribute('aria-sort')).toBe('none');

  fireEvent.click(ageButton);
  expect(ageHeader.getAttribute('aria-sort')).toBe('ascending');
});

// ---- Filtering ----

test('client-side filter', async () => {
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
  await userEvent.click(filterBtn);

  // Click "Admin" option
  await userEvent.click(screen.getByText('Admin'));

  // Should only show admins (Alice, Diana)
  expect(screen.getByText('Alice')).toBeTruthy();
  expect(screen.getByText('Diana')).toBeTruthy();
  expect(screen.queryByText('Bob')).toBeNull();
});

test('filter menu exposes keyboard menu semantics', async () => {
  const filterColumns: TableColumn<User>[] = [
    {
      key: 'role',
      dataIndex: 'role',
      title: 'Role',
      filters: [{ text: 'Admin', value: 'admin' }],
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

  const trigger = screen.getByRole('button', { name: 'Filter' });
  expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
  await userEvent.click(trigger);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByRole('menuitemcheckbox', { name: 'Admin' })).toBeTruthy();

  fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
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

test('pagination callbacks preserve current controlled sorting and filters', () => {
  const changes: {
    filters: Record<string, string[] | null>;
    sorter: SorterResult<User>;
  }[] = [];
  const onChange: NonNullable<TableProps<User>['onChange']> = (
    _,
    filters,
    sorter,
  ) => {
    changes.push({ filters, sorter });
  };
  const controlledColumns = (
    order: 'ascend' | 'descend',
    role: string,
  ): TableColumn<User>[] => [
    {
      key: 'age',
      dataIndex: 'age',
      title: 'Age',
      sorter: (a, b) => a.age - b.age,
      sortOrder: order,
    },
    {
      key: 'role',
      dataIndex: 'role',
      title: 'Role',
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
      ],
      filteredValue: [role],
    },
  ];
  const { rerender } = render(
    <Table
      columns={controlledColumns('descend', 'admin')}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 2 }}
      onChange={onChange}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
  expect(changes[0]).toMatchObject({
    filters: { role: ['admin'] },
    sorter: { field: 'age', order: 'descend' },
  });

  rerender(
    <Table
      columns={controlledColumns('ascend', 'user')}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 2 }}
      onChange={onChange}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
  expect(changes[1]).toMatchObject({
    filters: { role: ['user'] },
    sorter: { field: 'age', order: 'ascend' },
  });
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

test('uncontrolled selection works without a change callback', () => {
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      rowSelection={{}}
    />,
  );
  const first = screen.getByRole('checkbox', { name: 'Select row 1' });
  const all = screen.getByRole('checkbox', { name: 'Select all rows' });
  fireEvent.click(first);
  expect(first).toBeChecked();
  expect(all).toBePartiallyChecked();
  fireEvent.click(first);
  expect(first).not.toBeChecked();
  fireEvent.click(all);
  for (const input of screen.getAllByRole('checkbox'))
    expect(input).toBeChecked();
  fireEvent.click(all);
  expect(first).not.toBeChecked();
});

test('uncontrolled selection accumulates across pages and skips disabled rows', () => {
  let selectedKeys: React.Key[] = [];
  let selectedRows: User[] = [];
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ pageSize: 2 }}
      rowSelection={{
        getCheckboxProps: (record) => ({ disabled: record.id === 3 }),
        onChange: (keys, rows) => {
          selectedKeys = keys;
          selectedRows = rows;
        },
      }}
    />,
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
  expect(selectedKeys).toEqual([1, 4]);
  expect(selectedRows).toEqual([data[0], data[3]]);
  expect(
    screen.getByRole('checkbox', { name: 'Select row 3' }),
  ).not.toBeChecked();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
  expect(selectedKeys).toEqual([1]);
  fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
  expect(screen.getByRole('checkbox', { name: 'Select row 1' })).toBeChecked();
});

test('uncontrolled radio selection replaces the previous row', () => {
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      rowSelection={{ type: 'radio' }}
    />,
  );
  const radios = screen.getAllByRole('radio');
  fireEvent.click(radios[0]);
  expect(radios[0]).toBeChecked();
  fireEvent.click(radios[1]);
  expect(radios[0]).not.toBeChecked();
  expect(radios[1]).toBeChecked();
});

test('controlled selection waits for its parent to accept the change', () => {
  let selectedKeys: React.Key[] = [];
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      rowSelection={{
        selectedRowKeys: [],
        onChange: (keys) => {
          selectedKeys = keys;
        },
      }}
    />,
  );
  const first = screen.getByRole('checkbox', { name: 'Select row 1' });
  fireEvent.click(first);
  expect(selectedKeys).toEqual([1]);
  expect(first).not.toBeChecked();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
  expect(selectedKeys).toEqual(data.map((record) => record.id));
  expect(first).not.toBeChecked();
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

test('selecting and clearing a page preserves other pages and disabled selections', () => {
  let keys: React.Key[] = [1, 3];
  let rows: User[] = [];
  const table = () => (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 2, pageSize: 2 }}
      rowSelection={{
        selectedRowKeys: keys,
        getCheckboxProps: (record) => ({ disabled: record.id === 3 }),
        onChange: (nextKeys, nextRows) => {
          keys = nextKeys;
          rows = nextRows;
        },
      }}
    />
  );
  const { rerender } = render(table());
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
  expect(keys).toEqual([1, 3, 4]);
  expect(rows.map((row) => row.id)).toEqual([1, 3, 4]);
  rerender(table());
  expect(
    screen.getByRole('checkbox', { name: 'Select all rows' }),
  ).toBeChecked();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
  expect(keys).toEqual([1, 3]);
  expect(rows.map((row) => row.id)).toEqual([1, 3]);
  keys = [1];
  rerender(table());
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
  expect(keys).toEqual([1, 4]);
  expect(rows.map((row) => row.id)).toEqual([1, 4]);
});

test('large controlled selection preserves key and row order across updates', () => {
  const rows = Array.from({ length: 1000 }, (_, id) => ({
    id: `row-${id}`,
    name: `Row ${id}`,
  }));
  let keys = [
    'outside',
    ...rows
      .slice(0, 800)
      .map((row) => row.id)
      .reverse(),
  ];
  let selectedRows: typeof rows = [];
  const table = () => (
    <Table
      dataSource={rows}
      columns={[{ dataIndex: 'name', title: 'Name' }]}
      rowKey="id"
      rowSelection={{
        selectedRowKeys: keys,
        onChange: (nextKeys, nextRows) => {
          keys = nextKeys as string[];
          selectedRows = nextRows;
        },
      }}
    />
  );
  const { rerender } = render(table());
  const originalKeys = [...keys];
  fireEvent.click(screen.getAllByRole('checkbox')[1]);
  expect(keys).toEqual(originalKeys.filter((key) => key !== 'row-0'));
  expect(selectedRows).toEqual(rows.slice(1, 800));
  rerender(table());
  expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
  fireEvent.click(screen.getAllByRole('checkbox')[1]);
  expect(keys).toEqual([
    ...originalKeys.filter((key) => key !== 'row-0'),
    'row-0',
  ]);
  expect(selectedRows).toEqual(rows.slice(0, 800));
  rerender(table());
  expect(screen.getAllByRole('checkbox')[1]).toBeChecked();
});

test('selection header reflects only selectable rows on the current page', () => {
  const table = (keys: React.Key[], disabled: boolean, current = 1) => (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current, pageSize: 2 }}
      rowSelection={{
        selectedRowKeys: keys,
        getCheckboxProps: (record) => ({
          disabled: disabled || record.id === 3,
        }),
      }}
    />
  );
  const { rerender } = render(table([1, 3], false));
  expect(
    screen.getByRole('checkbox', { name: 'Select all rows' }),
  ).toBePartiallyChecked();
  rerender(table([1, 3], false, 2));
  expect(
    screen.getByRole('checkbox', { name: 'Select all rows' }),
  ).not.toBeChecked();
  expect(
    screen.getByRole('checkbox', { name: 'Select all rows' }),
  ).not.toBePartiallyChecked();
  rerender(table([1, 3, 4], false, 2));
  expect(
    screen.getByRole('checkbox', { name: 'Select all rows' }),
  ).toBeChecked();
  expect(
    screen.getByRole('checkbox', { name: 'Select all rows' }),
  ).not.toBePartiallyChecked();
  rerender(table([1, 3, 4], true, 2));
  expect(
    screen.getByRole('checkbox', { name: 'Select all rows' }),
  ).not.toBeChecked();
  expect(
    screen.getByRole('checkbox', { name: 'Select all rows' }),
  ).not.toBePartiallyChecked();
  expect(
    screen.getByRole('checkbox', { name: 'Select all rows' }),
  ).toBeDisabled();
});

test('selection checkboxes have accessible names', () => {
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      rowSelection={{}}
    />,
  );

  expect(
    screen.getByRole('checkbox', { name: 'Select all rows' }),
  ).toBeTruthy();
  expect(screen.getByRole('checkbox', { name: 'Select row 1' })).toBeTruthy();
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

// ---- Responsive columns ----

test('column with responsive list renders only when a breakpoint matches', async () => {
  setViewportWidth(400);
  const responsiveColumns: TableColumn<User>[] = [
    { key: 'name', dataIndex: 'name', title: 'Name' },
    { key: 'role', dataIndex: 'role', title: 'Role', responsive: ['lg'] },
  ];
  render(
    <Table
      columns={responsiveColumns}
      dataSource={data}
      rowKey="id"
      pagination={false}
    />,
  );
  // 400px matches xs only — the lg-gated column stays hidden after hydration
  await waitFor(() => expect(screen.getByText('Alice')).toBeTruthy());
  expect(screen.queryByText('Role')).toBeNull();
  expect(screen.queryByText('admin')).toBeNull();
});

test('responsive column appears once its breakpoint matches', async () => {
  setViewportWidth(1200);
  const responsiveColumns: TableColumn<User>[] = [
    { key: 'name', dataIndex: 'name', title: 'Name' },
    { key: 'role', dataIndex: 'role', title: 'Role', responsive: ['lg'] },
  ];
  render(
    <Table
      columns={responsiveColumns}
      dataSource={data}
      rowKey="id"
      pagination={false}
    />,
  );
  await waitFor(() => expect(screen.getByText('Role')).toBeTruthy());
  expect(screen.getAllByText('admin').length).toBeGreaterThan(0);
});

test('uncontrolled local pagination clamps after data shrinks without reviving the old page', () => {
  const rows = Array.from({ length: 11 }, (_, i) => ({
    key: i + 1,
    name: `Row ${i + 1}`,
  }));
  const cols = [{ dataIndex: 'name', title: 'Name' }];
  const { rerender } = render(
    <Table
      columns={cols}
      dataSource={rows}
      pagination={{ defaultCurrent: 2 }}
    />,
  );
  expect(screen.getByText('Row 11')).toBeTruthy();
  rerender(
    <Table
      columns={cols}
      dataSource={rows.slice(0, 10)}
      pagination={{ defaultCurrent: 2 }}
    />,
  );
  expect(screen.getByText('Row 1')).toBeTruthy();
  expect(screen.getByLabelText('Page 1')).toHaveAttribute(
    'aria-current',
    'page',
  );
  rerender(
    <Table
      columns={cols}
      dataSource={rows}
      pagination={{ defaultCurrent: 2 }}
    />,
  );
  expect(screen.queryByText('Row 11')).toBeNull();
});

test('remote pagination clamps by total rather than the current page row count', () => {
  const cols = [{ dataIndex: 'name', title: 'Name' }];
  const rows = [{ key: 1, name: 'Remote row' }];
  const { rerender } = render(
    <Table
      columns={cols}
      dataSource={rows}
      pagination={{ defaultCurrent: 3, total: 30 }}
    />,
  );
  expect(screen.getByLabelText('Page 3')).toHaveAttribute(
    'aria-current',
    'page',
  );
  expect(screen.getByText('Remote row')).toBeTruthy();
  rerender(
    <Table
      columns={cols}
      dataSource={rows}
      pagination={{ defaultCurrent: 3, total: 20 }}
    />,
  );
  expect(screen.getByLabelText('Page 2')).toHaveAttribute(
    'aria-current',
    'page',
  );
  expect(screen.getByText('Remote row')).toBeTruthy();
});

test('controlled local pagination retains the page requested by its parent', () => {
  const cols = [{ dataIndex: 'name', title: 'Name' }];
  const rows = Array.from({ length: 11 }, (_, i) => ({
    key: i + 1,
    name: `Controlled ${i + 1}`,
  }));
  const { rerender } = render(
    <Table columns={cols} dataSource={rows} pagination={{ current: 2 }} />,
  );
  rerender(
    <Table
      columns={cols}
      dataSource={rows.slice(0, 10)}
      pagination={{ current: 2 }}
    />,
  );
  expect(screen.queryByText('Controlled 1')).toBeNull();
  rerender(
    <Table columns={cols} dataSource={rows} pagination={{ current: 2 }} />,
  );
  expect(screen.getByText('Controlled 11')).toBeTruthy();
});
