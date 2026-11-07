import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Transfer } from '../../src/components/transfer/transfer';

test('the size changer can override a configured Transfer page size', async () => {
  const records = Array.from({ length: 22 }, (_, index) => ({
    key: index,
    title: `Item ${index + 1}`,
  }));
  const view = render(
    <Transfer
      dataSource={records}
      pagination={{ pageSize: 5, simple: false, showSizeChanger: true }}
    />,
  );
  const source = within(screen.getByRole('region', { name: 'Source' }));
  expect(source.getAllByRole('checkbox')).toHaveLength(5);
  fireEvent.keyDown(source.getByRole('combobox'), { key: 'ArrowDown' });
  fireEvent.click(await screen.findByRole('option', { name: /20/ }));
  expect(source.getAllByRole('checkbox')).toHaveLength(20);
  view.rerender(
    <Transfer
      dataSource={records}
      pagination={{ pageSize: 8, simple: false, showSizeChanger: true }}
    />,
  );
  expect(source.getAllByRole('checkbox')).toHaveLength(8);
});

test('Transfer keeps its bounded page after records shrink and grow', () => {
  const data = Array.from({ length: 12 }, (_, i) => ({
    key: String(i),
    title: `Item ${i + 1}`,
  }));
  const onChange = rs.fn();
  const pagination = { pageSize: 5, simple: false };
  const view = render(
    <Transfer dataSource={data} pagination={pagination} onChange={onChange} />,
  );
  const source = within(screen.getByRole('region', { name: 'Source' }));
  fireEvent.click(source.getByRole('button', { name: 'Page 3', exact: true }));
  expect(source.getByRole('checkbox', { name: 'Item 11' })).toBeInTheDocument();
  view.rerender(
    <Transfer
      dataSource={data.slice(0, 3)}
      pagination={pagination}
      onChange={onChange}
    />,
  );
  expect(source.getByRole('checkbox', { name: 'Item 1' })).toBeInTheDocument();
  view.rerender(
    <Transfer dataSource={data} pagination={pagination} onChange={onChange} />,
  );
  expect(source.getByRole('checkbox', { name: 'Item 1' })).toBeInTheDocument();
  expect(
    source.getByRole('button', { name: 'Page 1', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  expect(onChange).not.toHaveBeenCalled();
});
