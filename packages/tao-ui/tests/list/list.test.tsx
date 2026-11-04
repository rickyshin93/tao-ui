import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { List, type ListItemMetaRef } from '../../src/components/list/list';
import { TaoProvider } from '../../src/provider/tao-provider';

const items = ['One', 'Two', 'Three', 'Four', 'Five'];
const item = (value: string) => <List.Item>{value}</List.Item>;

test('renders item metadata, actions, extra and structural slots', () => {
  render(
    <List
      header="Header"
      footer="Footer"
      loadMore={<button type="button">More</button>}
      itemLayout="vertical"
      dataSource={['Record']}
      renderItem={(value) => (
        <List.Item
          actions={[
            <button key="edit" type="button">
              Edit
            </button>,
          ]}
          extra="Preview"
        >
          <List.Item.Meta avatar="A" title={value} description="Details" />
        </List.Item>
      )}
    />,
  );
  for (const text of ['Header', 'Footer', 'Record', 'Details', 'Preview', 'A'])
    expect(screen.getByText(text)).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Edit' })).toBeTruthy();
  expect(
    screen
      .getByText('Record')
      .closest('[data-tao-list-item]')
      ?.getAttribute('data-tao-layout'),
  ).toBe('vertical');
});

test('uncontrolled pagination slices items and reports navigation', () => {
  const onChange = rs.fn();
  render(
    <List
      dataSource={items}
      renderItem={item}
      pagination={{ defaultPageSize: 2, onChange }}
    />,
  );
  expect(screen.getByText('One')).toBeTruthy();
  expect(screen.queryByText('Three')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Page 2', exact: true }));
  expect(screen.getByText('Three')).toBeTruthy();
  expect(screen.queryByText('One')).toBeNull();
  expect(onChange).toHaveBeenCalledWith(2, 2);
});

test('controlled pagination and server-side page data remain authoritative', () => {
  const onChange = rs.fn();
  const { rerender } = render(
    <List
      dataSource={items}
      renderItem={item}
      pagination={{ current: 2, pageSize: 2, onChange, position: 'both' }}
    />,
  );
  expect(screen.getByText('Three')).toBeTruthy();
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Page 1', exact: true })[0]!,
  );
  expect(screen.getByText('Three')).toBeTruthy();
  expect(onChange).toHaveBeenCalledWith(1, 2);
  rerender(
    <List
      dataSource={['Server item']}
      renderItem={item}
      pagination={{ current: 4, pageSize: 10, total: 100 }}
    />,
  );
  expect(screen.getByText('Server item')).toBeTruthy();
});

test('empty, loading and direct children are separate states', () => {
  const { rerender } = render(<List locale={{ emptyText: 'Nothing here' }} />);
  expect(screen.getByText('Nothing here')).toBeTruthy();
  rerender(<List loading={{ spinning: true, tip: 'Fetching' }} />);
  expect(screen.getByRole('status')).toBeTruthy();
  expect(screen.queryByText('No data')).toBeNull();
  rerender(
    <List>
      <List.Item>Direct child</List.Item>
    </List>,
  );
  expect(screen.getByText('Direct child')).toBeTruthy();
  expect(screen.queryByText('No data')).toBeNull();
});

test('responsive grid, inherited size and semantic overrides are emitted', () => {
  const { container } = render(
    <TaoProvider size="small">
      <List
        dataSource={items}
        renderItem={item}
        grid={{ column: 3, xs: 1, md: 2, gutter: [12, 20] }}
        classNames={{ root: 'custom-list', items: 'custom-items' }}
        styles={{ root: { marginTop: 4 } }}
        style={{ marginTop: 8 }}
      />
    </TaoProvider>,
  );
  const root = container.querySelector('[data-tao-list]') as HTMLElement;
  expect(root.dataset.taoSize).toBe('small');
  expect(root.className).toContain('custom-list');
  expect(root.style.marginTop).toBe('8px');
  expect(root.style.getPropertyValue('--tao-list-columns-xs')).toBe('1');
  expect(root.style.getPropertyValue('--tao-list-columns-md')).toBe('2');
  expect(container.querySelector('.custom-items')).toBeTruthy();
});

test('root and metadata refs expose real elements and preserve numeric content', () => {
  const ref = createRef<HTMLDivElement>();
  const meta = createRef<ListItemMetaRef>();
  render(
    <List ref={ref}>
      <List.Item>
        <List.Item.Meta ref={meta} title={0} description={0} avatar={0} />
      </List.Item>
    </List>,
  );
  expect(ref.current?.hasAttribute('data-tao-list')).toBe(true);
  expect(meta.current?.nativeElement.hasAttribute('data-tao-list-meta')).toBe(
    true,
  );
  expect(screen.getAllByText('0').length).toBe(3);
});

test('pagination supports quick jumping, simple mode and custom size changer callbacks', () => {
  const onSize = rs.fn();
  const onChange = rs.fn();
  const rows = Array.from({ length: 30 }, (_, index) => `Row ${index + 1}`);
  const { rerender } = render(
    <List
      dataSource={rows}
      renderItem={item}
      pagination={{ defaultPageSize: 5, showQuickJumper: true, onChange }}
    />,
  );
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '3' } });
  fireEvent.keyUp(screen.getByRole('textbox'), { key: 'Enter', keyCode: 13 });
  expect(screen.getByText('Row 11')).toBeTruthy();
  expect(onChange).toHaveBeenLastCalledWith(3, 5);
  rerender(
    <List
      dataSource={rows}
      renderItem={item}
      pagination={{
        simple: { readOnly: true },
        showSizeChanger: true,
        onShowSizeChange: onSize,
        components: {
          sizeChanger: ({ onChange }) => (
            <button type="button" onClick={() => onChange(10)}>
              Ten per page
            </button>
          ),
        },
      }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Ten per page' }));
  expect(onSize).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Row 30')).toBeTruthy();
});
