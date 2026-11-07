import { afterEach, expect, rstest, test } from '@rstest/core';
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

test('sticky selection offsets include a pixel string column width', () => {
  render(
    <Table
      columns={[{ ...columns[0], fixed: 'left', width: 90 }]}
      dataSource={data}
      rowKey="id"
      scroll={{ x: 400 }}
      pagination={false}
      rowSelection={{ fixed: true, columnWidth: '48px' }}
    />,
  );
  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveStyle({
    position: 'sticky',
    left: '48px',
  });
});

test('a user column key cannot overwrite the sticky selection offset', () => {
  render(
    <Table
      columns={[
        {
          key: '__selection__',
          dataIndex: 'name',
          title: 'Name',
          fixed: 'left',
          width: 90,
        },
      ]}
      dataSource={data}
      rowKey="id"
      scroll={{ x: 400 }}
      pagination={false}
      rowSelection={{ fixed: true, columnWidth: 48 }}
    />,
  );
  expect(
    screen.getByRole('checkbox', { name: 'Select all rows' }).closest('th'),
  ).toHaveStyle({ position: 'sticky', left: '0px' });
  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveStyle({
    position: 'sticky',
    left: '48px',
  });
});

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

test('reports the sorter for an empty-string column key', () => {
  const column: TableColumn<User> = {
    key: '',
    dataIndex: 'age',
    title: 'Age',
    sorter: (a, b) => a.age - b.age,
  };
  const onChange = rstest.fn();
  render(
    <Table
      columns={[column]}
      dataSource={data}
      rowKey="id"
      pagination={false}
      onChange={onChange}
    />,
  );

  fireEvent.click(screen.getByText('Age'));

  expect(screen.getAllByRole('row')[1]).toHaveTextContent('22');
  expect(onChange).toHaveBeenCalledExactlyOnceWith(
    { current: 1, pageSize: 10 },
    {},
    { column, order: 'ascend', field: 'age' },
  );
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

test('editing the filter callback payload cannot change the table filter', async () => {
  render(
    <Table
      columns={[
        columns[0],
        {
          ...columns[2],
          filters: [{ text: 'Admin', value: 'admin' }],
          onFilter: (value, record) => record.role === value,
        },
      ]}
      dataSource={data}
      rowKey="id"
      pagination={false}
      onChange={(_, filters) => filters.role?.splice(0)}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Filter' }));
  await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Admin' }));
  expect(screen.queryByText('Bob')).not.toBeInTheDocument();
});

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

test('column sorter methods retain their column receiver', () => {
  const sortColumns: TableColumn<User>[] = [
    columns[0],
    {
      ...columns[1],
      defaultSortOrder: 'ascend',
      sorter(a, b) {
        return Number(a[this.dataIndex!]) - Number(b[this.dataIndex!]);
      },
    },
  ];
  render(<Table columns={sortColumns} dataSource={data} rowKey="id" />);
  expect(screen.getAllByRole('row')[1]).toHaveTextContent('Eve');
});

test('built-in table actions inherit the provider disabled state', () => {
  const onSelect = rstest.fn();
  const onExpand = rstest.fn();
  const onChange = rstest.fn();
  const table = (
    <Table
      columns={[
        { ...columns[0], sorter: true },
        { ...columns[2], filters: [{ text: 'Admin', value: 'admin' }] },
      ]}
      dataSource={data}
      rowKey="id"
      rowSelection={{ onChange: onSelect }}
      expandable={{
        expandRowByClick: true,
        expandedRowRender: () => 'Details',
        onExpand,
      }}
      onChange={onChange}
    />
  );
  const view = render(<TaoProvider disabled>{table}</TaoProvider>);
  const getBuiltInControls = () => [
    screen.getByRole('checkbox', { name: 'Select all rows' }),
    screen.getByRole('checkbox', { name: 'Select row 1' }),
    screen.getByRole('button', { name: 'Name' }),
    screen.getByRole('button', { name: 'Filter' }),
    screen.getAllByRole('button', { name: 'Expand row' })[0],
  ];
  for (const control of getBuiltInControls()) expect(control).toBeDisabled();
  fireEvent.click(screen.getByText('Alice'));
  expect(onSelect).not.toHaveBeenCalled();
  expect(onChange).not.toHaveBeenCalled();
  expect(onExpand).not.toHaveBeenCalled();
  view.rerender(<TaoProvider disabled={false}>{table}</TaoProvider>);
  for (const control of getBuiltInControls()) expect(control).toBeEnabled();
});

test('column filter methods retain their column receiver', () => {
  const filterColumns: TableColumn<User>[] = [
    columns[0],
    {
      ...columns[2],
      filters: [{ text: 'Admin', value: 'admin' }],
      filteredValue: ['admin'],
      onFilter(value, record) {
        return record[this.dataIndex!] === value;
      },
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
  expect(screen.getByText('Alice')).toBeTruthy();
  expect(screen.getByText('Diana')).toBeTruthy();
  expect(screen.queryByText('Bob')).toBeNull();
});

test('adding filters to a column with an Object-prototype key still renders', async () => {
  const base: TableColumn<User> = {
    key: 'constructor',
    title: 'Role',
    dataIndex: 'role',
  };
  const view = render(
    <Table columns={[columns[0], base]} dataSource={data} rowKey="id" />,
  );
  view.rerender(
    <Table
      columns={[
        columns[0],
        {
          ...base,
          filters: [{ text: 'Admin', value: 'admin' }],
          onFilter: (value, row) => row.role === value,
        },
      ]}
      dataSource={data}
      rowKey="id"
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Filter' }));
  await userEvent.click(
    screen.getByRole('menuitemcheckbox', { name: 'Admin' }),
  );
  expect(screen.getByText('Alice')).toBeInTheDocument();
  expect(screen.queryByText('Bob')).toBeNull();
});

test('filter callbacks include an own property for a __proto__ data field', async () => {
  const onChange = rstest.fn();
  const rows = [{ id: 1, ['__proto__']: 'A' }];
  render(
    <Table
      dataSource={rows}
      rowKey="id"
      columns={[
        {
          dataIndex: '__proto__',
          title: 'Field',
          filters: [{ text: 'Filter A', value: 'A' }],
        },
      ]}
      onChange={onChange}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Filter' }));
  await userEvent.click(
    screen.getByRole('menuitemcheckbox', { name: 'Filter A' }),
  );
  const filterValues = onChange.mock.calls.at(-1)?.[1];
  expect(
    Object.getOwnPropertyDescriptor(filterValues, '__proto__')?.value,
  ).toEqual(['A']);
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

test('a proposed local sort cannot replace a still-active controlled sort', () => {
  const onChange = rstest.fn();
  render(
    <Table
      columns={[
        { ...columns[0], sorter: (a, b) => a.name.localeCompare(b.name) },
        { ...columns[1], sorter: (a, b) => a.age - b.age, sortOrder: 'descend' },
      ]}
      dataSource={data}
      rowKey="id"
      onChange={onChange}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Name' }));
  expect(onChange.mock.calls[0][2]).toMatchObject({ field: 'name', order: 'ascend' });
  expect(screen.getByRole('columnheader', { name: 'Age' })).toHaveAttribute('aria-sort', 'descending');
  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'none');
  expect(screen.getAllByRole('row')[1]).toHaveTextContent('Charlie');
});

test('removing a column sorter clears its metadata from subsequent pagination', () => {
  const onChange = rstest.fn();
  const view = render(
    <Table columns={[{ ...columns[1], sorter: true, defaultSortOrder: 'ascend' }]} dataSource={data} rowKey="id" pagination={{ pageSize: 2 }} onChange={onChange} />,
  );
  view.rerender(
    <Table columns={[columns[1]]} dataSource={data} rowKey="id" pagination={{ pageSize: 2 }} onChange={onChange} />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  expect(onChange.mock.calls[0][2]).toEqual({ order: null });
});

test('sort, filter and page interactions report the same data view', async () => {
  const changes: Parameters<NonNullable<TableProps<User>['onChange']>>[] = [];
  render(
    <Table
      columns={[
        columns[0],
        { ...columns[1], sorter: (a, b) => a.age - b.age },
        {
          ...columns[2],
          filters: [{ text: 'Admin', value: 'admin' }],
          onFilter: (role, record) => record.role === role,
        },
      ]}
      dataSource={data}
      rowKey="id"
      pagination={{ defaultCurrent: 3, pageSize: 1 }}
      onChange={(...change) => changes.push(change)}
    />,
  );
  expect(screen.getByText('Charlie')).toBeTruthy();
  fireEvent.click(screen.getByText('Age'));
  expect(screen.getByText('Diana')).toBeTruthy();
  expect(changes[0]).toMatchObject([
    { current: 3, pageSize: 1 },
    { role: null },
    { field: 'age', order: 'ascend' },
  ]);

  await userEvent.click(screen.getByLabelText('Filter'));
  await userEvent.click(
    screen.getByRole('menuitemcheckbox', { name: 'Admin' }),
  );
  fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
  expect(screen.getByLabelText('Page 1')).toHaveAttribute(
    'aria-current',
    'page',
  );
  expect(screen.getByText('Diana')).toBeTruthy();
  expect(changes[1]).toMatchObject([
    { current: 1, pageSize: 1 },
    { role: ['admin'] },
    { field: 'age', order: 'ascend' },
  ]);

  fireEvent.click(screen.getByLabelText('Page 2'));
  expect(screen.getByText('Alice')).toBeTruthy();
  expect(changes[2]).toMatchObject([
    { current: 2, pageSize: 1 },
    { role: ['admin'] },
    { field: 'age', order: 'ascend' },
  ]);
  expect(changes).toHaveLength(3);
  expect(data.map((record) => record.name)).toEqual([
    'Alice',
    'Bob',
    'Charlie',
    'Diana',
    'Eve',
  ]);
});

test('a rejected controlled filter does not overwrite its local fallback', async () => {
  const renderTable = (filteredValue?: string[]) => (
    <Table
      columns={[
        columns[0],
        {
          ...columns[2],
          filters: [{ text: 'Admin', value: 'admin' }],
          filteredValue,
          onFilter: (value, record) => record.role === value,
        },
      ]}
      dataSource={data}
      rowKey="id"
      pagination={false}
    />
  );
  const view = render(renderTable(['admin']));
  await userEvent.click(screen.getByRole('button', { name: 'Filter' }));
  await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Admin' }));
  expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  view.rerender(renderTable());
  expect(screen.queryByText('Bob')).not.toBeInTheDocument();
});

test('controlled data view rejects edits until its parent supplies new conditions', async () => {
  const changes: Parameters<NonNullable<TableProps<User>['onChange']>>[] = [];
  const controlledColumns = (
    order: 'ascend' | 'descend',
    role: string,
  ): TableColumn<User>[] => [
    columns[0],
    { ...columns[1], sorter: (a, b) => a.age - b.age, sortOrder: order },
    {
      ...columns[2],
      filters: [{ text: 'Admin', value: 'admin' }],
      filteredValue: [role],
      onFilter: (value, record) => record.role === value,
    },
  ];
  const table = (order: 'ascend' | 'descend', role: string) => (
    <Table
      columns={controlledColumns(order, role)}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 1 }}
      onChange={(...change) => changes.push(change)}
    />
  );
  const { rerender } = render(table('descend', 'admin'));
  fireEvent.click(screen.getByText('Age'));
  expect(changes[0][2]).toEqual({ order: null });
  expect(screen.getByText('Alice')).toBeTruthy();

  await userEvent.click(screen.getByLabelText('Filter'));
  await userEvent.click(
    screen.getByRole('menuitemcheckbox', { name: 'Admin' }),
  );
  expect(changes[1]).toMatchObject([
    { current: 1, pageSize: 1 },
    { role: null },
    { field: 'age', order: 'descend' },
  ]);
  expect(
    screen.getByRole('menuitemcheckbox', { name: 'Admin' }),
  ).toHaveAttribute('aria-checked', 'true');
  fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
  expect(screen.getByText('Alice')).toBeTruthy();

  rerender(table('ascend', 'user'));
  expect(screen.getByText('Eve')).toBeTruthy();
  fireEvent.click(screen.getByLabelText('Page 2'));
  expect(changes[2]).toMatchObject([
    { current: 2, pageSize: 1 },
    { role: ['user'] },
    { field: 'age', order: 'ascend' },
  ]);
  expect(screen.getByText('Eve')).toBeTruthy();
  expect(changes).toHaveLength(3);
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

test('editing selected keys in the callback cannot clear table selection', async () => {
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      rowSelection={{ onChange: (keys) => keys.splice(0) }}
    />,
  );
  const row = screen.getByRole('checkbox', { name: 'Select row 1' });
  await userEvent.click(row);
  expect(row).toBeChecked();
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
  expect(first).toHaveAttribute('data-tao-checkbox-input');
  expect(all).toHaveAttribute('data-tao-checkbox-input');
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

test('row selection radios support arrow navigation without entering another table', async () => {
  render(
    <>
      <Table
        columns={columns}
        dataSource={data.slice(0, 2)}
        rowKey="id"
        rowSelection={{ type: 'radio' }}
      />
      <Table
        columns={columns}
        dataSource={data.slice(2, 3)}
        rowKey="id"
        rowSelection={{ type: 'radio' }}
      />
    </>,
  );
  const first = screen.getByRole('radio', { name: 'Select row 1' });
  const second = screen.getByRole('radio', { name: 'Select row 2' });
  await userEvent.click(first);
  await userEvent.keyboard('{ArrowRight}');
  expect(second).toHaveFocus();
  expect(second).toBeChecked();
  await userEvent.keyboard('{ArrowRight}');
  expect(first).toHaveFocus();
  expect(first).toBeChecked();
});

test('an explicitly empty selectedRowKeys rejects local edits', async () => {
  const onChange = rstest.fn();
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      rowSelection={{ selectedRowKeys: undefined, onChange }}
    />,
  );
  const row = screen.getByRole('checkbox', { name: 'Select row 1' });
  await userEvent.click(row);
  expect(onChange).toHaveBeenCalledExactlyOnceWith([1], [data[0]]);
  expect(row).not.toBeChecked();
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

test('select all follows current disabled rows when the selection callback is stable', async () => {
  let locked = 0;
  const onChange = rstest.fn();
  const rowSelection = {
    getCheckboxProps: (record: User) => ({ disabled: record.id === locked }),
    onChange,
  };
  const table = () => (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      rowSelection={rowSelection}
      pagination={false}
    />
  );
  const view = render(table());
  locked = 1;
  view.rerender(table());
  expect(screen.getByRole('checkbox', { name: 'Select row 1' })).toBeDisabled();
  await userEvent.click(
    screen.getByRole('checkbox', { name: 'Select all rows' }),
  );
  expect(onChange.mock.calls.at(-1)?.[0]).toEqual([2, 3, 4, 5]);
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

test('a responsive column applies its default sort when it becomes visible', async () => {
  setViewportWidth(1200);
  render(
    <Table
      columns={[
        columns[0],
        {
          ...columns[1],
          responsive: ['lg'],
          sorter: (a, b) => a.age - b.age,
          defaultSortOrder: 'ascend',
        },
      ]}
      dataSource={data}
      rowKey="id"
      pagination={false}
    />,
  );
  expect(await screen.findByRole('columnheader', { name: 'Age' })).toHaveAttribute(
    'aria-sort',
    'ascending',
  );
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

test('fixed offsets follow the measured width of a relative-width header', async () => {
  const callbacks: ResizeObserverCallback[] = [];
  const Original = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class {
    constructor(callback: ResizeObserverCallback) {
      callbacks.push(callback);
    }
    observe() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;

  try {
    render(
      <Table
        columns={[
          { ...columns[0], fixed: 'left', width: '25%' },
          { ...columns[1], fixed: 'left', width: 80 },
        ]}
        dataSource={data}
        rowKey="id"
        scroll={{ x: 400 }}
        pagination={false}
      />,
    );
    const name = screen.getByRole('columnheader', { name: 'Name' });
    Object.defineProperty(name, 'offsetWidth', { value: 117 });
    for (const callback of callbacks) callback([], {} as ResizeObserver);
    await waitFor(() =>
      expect(screen.getByRole('columnheader', { name: 'Age' })).toHaveStyle({
        left: '117px',
      }),
    );
  } finally {
    globalThis.ResizeObserver = Original;
  }
});

test('recomputes fixed-column scroll state when the scroll container resizes', async () => {
  const callbacks: ResizeObserverCallback[] = [];
  const Original = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class {
    constructor(cb: ResizeObserverCallback) {
      callbacks.push(cb);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;

  try {
    const { container } = render(
      <Table
        columns={[
          { ...columns[0], fixed: 'left', width: 100 },
          ...columns.slice(1),
        ]}
        dataSource={data}
        rowKey="id"
        scroll={{ x: 800 }}
      />,
    );
    const wrapper = container.querySelector('[data-tao-table-wrapper]');
    const scrollEl = container.querySelector('[data-tao-table-scroll]');
    if (!(scrollEl instanceof HTMLElement)) throw new Error('missing scroll');
    expect(wrapper?.getAttribute('data-tao-scroll-state')).toBe('both');

    Object.defineProperty(scrollEl, 'clientWidth', {
      configurable: true,
      value: 300,
    });
    Object.defineProperty(scrollEl, 'scrollWidth', {
      configurable: true,
      value: 800,
    });
    for (const cb of callbacks) cb([], {} as ResizeObserver);

    await waitFor(() =>
      expect(wrapper?.getAttribute('data-tao-scroll-state')).toBe('left'),
    );
  } finally {
    globalThis.ResizeObserver = Original;
  }
});

// ---- scroll.y ----

test('scroll.y caps the scroll container height and marks it for sticky header', () => {
  const { container } = render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      scroll={{ y: 240 }}
    />,
  );
  const scrollEl = container.querySelector('[data-tao-table-scroll]');
  expect(scrollEl?.hasAttribute('data-tao-scroll-y')).toBe(true);
  expect((scrollEl as HTMLElement).style.maxHeight).toBe('240px');
});

// ---- Expandable ----

test('expand icon toggles the expanded row and reports changes', async () => {
  const user = userEvent.setup();
  const onExpand = rstest.fn();
  const onExpandedRowsChange = rstest.fn();
  const { container } = render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      rowSelection={{}}
      expandable={{
        expandedRowRender: (record) => `Detail of ${record.name}`,
        rowExpandable: (record) => record.name !== 'Bob',
        onExpand,
        onExpandedRowsChange,
      }}
    />,
  );

  expect(screen.getAllByRole('button', { name: 'Expand row' })).toHaveLength(4);
  await user.click(screen.getAllByRole('button', { name: 'Expand row' })[0]);

  expect(screen.getByText('Detail of Alice')).toBeTruthy();
  const expandedCell = container.querySelector(
    '[data-tao-table-expanded-row] > td',
  );
  // expand + selection + 3 data columns
  expect(expandedCell?.getAttribute('colspan')).toBe('5');
  expect(onExpand).toHaveBeenCalledWith(true, data[0]);
  expect(onExpandedRowsChange).toHaveBeenCalledWith([1]);

  await user.click(screen.getByRole('button', { name: 'Collapse row' }));
  expect(screen.queryByText('Detail of Alice')).toBeNull();
  expect(onExpandedRowsChange).toHaveBeenLastCalledWith([]);
});

test('expandRowByClick toggles on row click but not on the selection checkbox', async () => {
  const user = userEvent.setup();
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      rowSelection={{}}
      expandable={{
        expandedRowRender: (record) => `Detail of ${record.name}`,
        expandRowByClick: true,
      }}
    />,
  );

  await user.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
  expect(screen.queryByText('Detail of Alice')).toBeNull();

  await user.click(
    screen.getByRole('checkbox', { name: 'Select row 1' }).closest('label')!,
  );
  expect(screen.queryByText('Detail of Alice')).toBeNull();

  await user.click(screen.getByText('Alice'));
  expect(screen.getByText('Detail of Alice')).toBeTruthy();

  // Icon click toggles once, not twice via the row handler.
  await user.click(screen.getByRole('button', { name: 'Collapse row' }));
  expect(screen.queryByText('Detail of Alice')).toBeNull();
});

test('controlled expandedRowKeys and defaultExpandedRowKeys', async () => {
  const user = userEvent.setup();
  const { rerender } = render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      expandable={{
        expandedRowRender: (record) => `Detail of ${record.name}`,
        defaultExpandedRowKeys: [2],
      }}
    />,
  );
  expect(screen.getByText('Detail of Bob')).toBeTruthy();

  rerender(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      expandable={{
        expandedRowRender: (record) => `Detail of ${record.name}`,
        expandedRowKeys: [3],
      }}
    />,
  );
  expect(screen.getByText('Detail of Charlie')).toBeTruthy();
  expect(screen.queryByText('Detail of Bob')).toBeNull();

  await user.click(screen.getAllByRole('button', { name: 'Expand row' })[0]);
  // Controlled: stays as the parent says.
  expect(screen.queryByText('Detail of Alice')).toBeNull();
});

test('preventing the row click default cancels expansion', () => {
  const onExpand = rstest.fn();
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      onRow={() => ({ onClick: (event) => event.preventDefault() })}
      expandable={{
        expandedRowRender: (record) => `Detail of ${record.name}`,
        expandRowByClick: true,
        onExpand,
      }}
    />,
  );
  fireEvent.click(screen.getByText('Alice'));
  expect(screen.queryByText('Detail of Alice')).toBeNull();
  expect(onExpand).not.toHaveBeenCalled();
});

test('an explicitly empty expandedRowKeys ignores default expansion', () => {
  render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      expandable={{
        expandedRowRender: (record) => `Detail of ${record.name}`,
        defaultExpandedRowKeys: [1],
        expandedRowKeys: undefined,
      }}
    />,
  );
  expect(screen.queryByText('Detail of Alice')).toBeNull();
});

// ---- Summary ----

test('editing the summary input array cannot reorder the table rows', () => {
  const { container } = render(
    <Table
      columns={[columns[0]]}
      dataSource={data}
      rowKey="id"
      pagination={false}
      summary={(rows) => {
        rows.reverse();
        return null;
      }}
    />,
  );
  const names = [...container.querySelectorAll('[data-tao-table-row]')].map(
    (row) => row.textContent,
  );
  expect(names).toEqual(data.map((record) => record.name));
});

test('summary renders footer rows and syncs fixed columns by index', () => {
  const { container } = render(
    <Table
      columns={[
        { ...columns[0], fixed: 'left', width: 120 },
        { ...columns[1], width: 100 },
        { ...columns[2], fixed: 'right', width: 100 },
      ]}
      dataSource={data}
      rowKey="id"
      scroll={{ x: 800, y: 200 }}
      summary={(pageData) => (
        <Table.Summary fixed>
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
            <Table.Summary.Cell index={1}>
              {pageData.reduce((sum, r) => sum + r.age, 0)}
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2}>-</Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      )}
    />,
  );

  const tfoot = container.querySelector('tfoot[data-tao-table-summary]');
  expect(tfoot?.hasAttribute('data-tao-summary-fixed')).toBe(true);
  const cells = tfoot?.querySelectorAll('td') ?? [];
  expect(cells[1]?.textContent).toBe('140');
  expect(cells[0]?.getAttribute('data-tao-fixed')).toBe('left');
  expect((cells[0] as HTMLElement).style.left).toBe('0px');
  expect(cells[1]?.hasAttribute('data-tao-fixed')).toBe(false);
  expect(cells[2]?.getAttribute('data-tao-fixed')).toBe('right');
  expect((cells[2] as HTMLElement).style.right).toBe('0px');
});

test('summary without Table.Summary fixed is not pinned', () => {
  const { container } = render(
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      summary={() => (
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={3}>
            Footer
          </Table.Summary.Cell>
        </Table.Summary.Row>
      )}
    />,
  );
  const tfoot = container.querySelector('tfoot[data-tao-table-summary]');
  expect(tfoot?.hasAttribute('data-tao-summary-fixed')).toBe(false);
  expect(tfoot?.querySelector('td')?.getAttribute('colspan')).toBe('3');
});
