import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { List } from '../../src/components/list/list';

test('reordering keyed List.Item actions preserves an action draft', () => {
  const actions = [
    <input key="alpha" aria-label="Alpha action" defaultValue="" />,
    <input key="beta" aria-label="Beta action" defaultValue="" />,
  ];
  const view = render(
    <List>
      <List.Item actions={actions}>Row</List.Item>
    </List>,
  );
  const alpha = screen.getByRole('textbox', { name: 'Alpha action' });
  fireEvent.change(alpha, { target: { value: 'Action draft' } });
  view.rerender(
    <List>
      <List.Item actions={[...actions].reverse()}>Row</List.Item>
    </List>,
  );
  expect(screen.getByRole('textbox', { name: 'Alpha action' })).toBe(alpha);
  expect(alpha).toHaveValue('Action draft');
});

test('List uses renderer keys when the configured key field is absent', () => {
  const a = { id: undefined, label: 'Alpha' };
  const b = { id: undefined, label: 'Beta' };
  const renderItem = ({ label }: typeof a) => (
    <List.Item key={label}>
      <input aria-label={label} defaultValue="" />
    </List.Item>
  );
  const view = render(
    <List dataSource={[a, b]} rowKey="id" renderItem={renderItem} />,
  );
  const alpha = screen.getByRole('textbox', { name: 'Alpha' });
  fireEvent.change(alpha, { target: { value: 'Alpha draft' } });
  view.rerender(
    <List dataSource={[b, a]} rowKey="id" renderItem={renderItem} />,
  );
  expect(screen.getByRole('textbox', { name: 'Alpha' })).toHaveValue(
    'Alpha draft',
  );
  expect(screen.getByRole('textbox', { name: 'Beta' })).toHaveValue('');
});

test.each([0, ''] as const)(
  'List uses the valid rowKey %s to preserve item state on reorder',
  (rowKey) => {
    const a = { 0: 'a', '': 'a', label: 'Alpha' };
    const b = { 0: 'b', '': 'b', label: 'Beta' };
    const renderItem = (item: typeof a) => (
      <List.Item>
        <input aria-label={item.label} defaultValue="" />
      </List.Item>
    );
    const view = render(
      <List dataSource={[a, b]} rowKey={rowKey} renderItem={renderItem} />,
    );
    const alpha = screen.getByRole('textbox', { name: 'Alpha' });
    fireEvent.change(alpha, { target: { value: 'Alpha draft' } });
    view.rerender(
      <List dataSource={[b, a]} rowKey={rowKey} renderItem={renderItem} />,
    );
    expect(screen.getByRole('textbox', { name: 'Alpha' })).toBe(alpha);
    expect(alpha).toHaveValue('Alpha draft');
    expect(screen.getByRole('textbox', { name: 'Beta' })).toHaveValue('');
  },
);

test('List settles uncontrolled pagination when its data shrinks and later grows', () => {
  const data = Array.from({ length: 12 }, (_, i) => ({
    key: i,
    label: `Item ${i + 1}`,
  }));
  const onChange = rs.fn();
  const pagination = { defaultCurrent: 3, defaultPageSize: 5, onChange };
  const renderItem = (item: (typeof data)[number]) => (
    <List.Item>{item.label}</List.Item>
  );
  const view = render(
    <List dataSource={data} pagination={pagination} renderItem={renderItem} />,
  );
  expect(screen.getByText('Item 11')).toBeInTheDocument();
  view.rerender(
    <List
      dataSource={data.slice(0, 3)}
      pagination={pagination}
      renderItem={renderItem}
    />,
  );
  expect(screen.getByText('Item 1')).toBeInTheDocument();
  view.rerender(
    <List dataSource={data} pagination={pagination} renderItem={renderItem} />,
  );
  expect(screen.getByText('Item 1')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Page 1', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  expect(onChange).not.toHaveBeenCalled();
});

test('controlled List pagination preserves the requested page when data is restored', () => {
  const data = Array.from({ length: 12 }, (_, i) => `Item ${i + 1}`);
  const pagination = { current: 3, pageSize: 5 };
  const renderItem = (value: string) => <List.Item>{value}</List.Item>;
  const view = render(
    <List
      dataSource={data.slice(0, 3)}
      pagination={pagination}
      renderItem={renderItem}
    />,
  );
  view.rerender(
    <List dataSource={data} pagination={pagination} renderItem={renderItem} />,
  );
  expect(screen.getByText('Item 11')).toBeInTheDocument();
});
