import { expect, rs, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Table } from '../../src/components/table/table';

test.each([0, '', 'name'] as const)(
  'Table reads the valid field key %s and passes it to render',
  (dataIndex) => {
    const record = { id: 'row', 0: 'Zero', '': 'Empty key', name: 'Name' };
    const renderCell = rs.fn((value: unknown) => `Cell: ${value}`);
    render(
      <Table
        rowKey="id"
        pagination={false}
        columns={[{ dataIndex, title: 'Field', render: renderCell }]}
        dataSource={[record]}
      />,
    );
    expect(screen.getByText(`Cell: ${record[dataIndex]}`)).toBeInTheDocument();
    expect(renderCell).toHaveBeenCalledWith(record[dataIndex], record, 0);
  },
);

test('omitted dataIndex still supplies undefined to a custom cell renderer', () => {
  const record = { id: 'row' };
  const renderCell = rs.fn(() => 'Actions');
  render(
    <Table
      rowKey="id"
      pagination={false}
      columns={[{ title: 'Field', render: renderCell }]}
      dataSource={[record]}
    />,
  );
  expect(screen.getByText('Actions')).toBeInTheDocument();
  expect(renderCell).toHaveBeenCalledWith(undefined, record, 0);
});
