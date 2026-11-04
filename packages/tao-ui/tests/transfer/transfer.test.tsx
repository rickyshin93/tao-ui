import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { createRef, useState } from 'react';
import {
  Transfer,
  type TransferKey,
  type TransferRef,
} from '../../src/components/transfer/transfer';
import { TaoProvider } from '../../src/provider/tao-provider';

const data = [
  { key: 'a', title: 'Alpha' },
  { key: 'b', title: 'Beta' },
  { key: 'c', title: 'Gamma', disabled: true },
  { key: 'd', title: 'Delta' },
];
const renderItem = (item: (typeof data)[number]) => item.title;
test('moves selected enabled records, preserves target order and clears source selection', () => {
  const change = rs.fn();
  const select = rs.fn();
  function Example() {
    const [keys, setKeys] = useState<TransferKey[]>(['d']);
    return (
      <Transfer
        dataSource={data}
        targetKeys={keys}
        render={renderItem}
        onSelectChange={select}
        onChange={(next, direction, move) => {
          setKeys(next);
          change(next, direction, move);
        }}
      />
    );
  }
  render(<Example />);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Alpha' }));
  fireEvent.click(screen.getByRole('button', { name: 'Move to target' }));
  expect(change).toHaveBeenCalledWith(['a', 'd'], 'right', ['a']);
  expect(select).toHaveBeenLastCalledWith([], []);
  const target = screen.getByRole('region', { name: 'Target' });
  expect(
    within(target)
      .getAllByRole('checkbox')
      .slice(1)
      .map((node) => node.getAttribute('aria-label')),
  ).toEqual(['Alpha', 'Delta']);
});
test('controlled selections and target keys stay authoritative', () => {
  const select = rs.fn();
  const change = rs.fn();
  render(
    <Transfer
      dataSource={data}
      selectedKeys={['a']}
      targetKeys={['d']}
      render={renderItem}
      onSelectChange={select}
      onChange={change}
    />,
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Beta' }));
  expect(select).toHaveBeenCalledWith(['a', 'b'], []);
  expect(
    (screen.getByRole('checkbox', { name: 'Beta' }) as HTMLInputElement)
      .checked,
  ).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Move to target' }));
  expect(change).toHaveBeenCalledWith(['a', 'd'], 'right', ['a']);
  expect(
    within(screen.getByRole('region', { name: 'Source' })).getByRole(
      'checkbox',
      { name: 'Alpha' },
    ),
  ).toBeTruthy();
});
test('search uses render.value and directional filter callbacks', () => {
  const search = rs.fn();
  const filter = rs.fn(
    (query: string, item: (typeof data)[number], _direction: string) =>
      item.title.includes(query),
  );
  const { rerender } = render(
    <Transfer
      dataSource={data}
      showSearch
      onSearch={search}
      render={(item) => ({
        label: <b>{item.title}</b>,
        value: `search-${item.key}`,
      })}
    />,
  );
  fireEvent.change(screen.getAllByRole('textbox')[0]!, {
    target: { value: 'search-b' },
  });
  expect(screen.getByText('Beta')).toBeTruthy();
  expect(screen.queryByText('Alpha')).toBeNull();
  expect(search).toHaveBeenCalledWith('left', 'search-b');
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(search).toHaveBeenLastCalledWith('left', '');
  rerender(
    <Transfer
      dataSource={data}
      showSearch
      filterOption={filter}
      render={renderItem}
    />,
  );
  fireEvent.change(screen.getAllByRole('textbox')[0]!, {
    target: { value: 'Beta' },
  });
  expect(filter).toHaveBeenCalledWith('Beta', data[0], 'left');
});
test('select all skips disabled records and shift selection uses visible records', () => {
  const select = rs.fn();
  render(
    <Transfer dataSource={data} render={renderItem} onSelectChange={select} />,
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all Source' }));
  expect(select).toHaveBeenLastCalledWith(['a', 'b', 'd'], []);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all Source' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Alpha' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Delta' }), {
    shiftKey: true,
  });
  expect(select).toHaveBeenLastCalledWith(['a', 'b', 'd'], []);
  expect(
    (screen.getByRole('checkbox', { name: 'Gamma' }) as HTMLInputElement)
      .disabled,
  ).toBe(true);
});
test('one-way target items remove through callback and custom actions preserve handlers', () => {
  const change = rs.fn();
  const action = rs.fn();
  render(
    <Transfer
      oneWay
      dataSource={data}
      targetKeys={['a', 'd']}
      selectedKeys={['b']}
      render={renderItem}
      onChange={change}
      actions={[
        <button key="add" type="button" onClick={action}>
          Add selected
        </button>,
        <span key="extra">After</span>,
      ]}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Remove Alpha' }));
  expect(change).toHaveBeenLastCalledWith(['d'], 'left', ['a']);
  fireEvent.click(screen.getByRole('button', { name: 'Add selected' }));
  expect(action).toHaveBeenCalledTimes(1);
  expect(change).toHaveBeenLastCalledWith(['b', 'a', 'd'], 'right', ['b']);
  expect(screen.queryByRole('button', { name: 'Move to source' })).toBeNull();
  expect(screen.getByText('After')).toBeTruthy();
});
test('pagination limits visible rows and custom body disables built-in pagination', () => {
  const { rerender } = render(
    <Transfer
      dataSource={data}
      render={renderItem}
      pagination={{ pageSize: 2, simple: false }}
    />,
  );
  expect(screen.queryByText('Delta')).toBeNull();
  fireEvent.click(
    within(screen.getByRole('region', { name: 'Source' })).getByRole('button', {
      name: 'Page 2',
    }),
  );
  expect(screen.getByText('Delta')).toBeTruthy();
  rerender(
    <Transfer
      dataSource={data}
      render={renderItem}
      pagination={{ pageSize: 1 }}
    >
      {({ direction, filteredItems, onItemSelect }) => (
        <div>
          {direction}
          {filteredItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onItemSelect(item.key!, true)}
            >
              {item.title}
            </button>
          ))}
        </div>
      )}
    </Transfer>,
  );
  expect(screen.getByRole('button', { name: 'Delta' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Page 2' })).toBeNull();
});
test('provider disabled, rowKey, root ref and side-specific semantics are honored', () => {
  const ref = createRef<TransferRef>();
  const change = rs.fn();
  const { container } = render(
    <TaoProvider disabled>
      <Transfer
        ref={ref}
        dataSource={[{ id: 1, title: 'One' }]}
        rowKey={(item) => item.id}
        selectedKeys={[1]}
        render={(item) => item.title}
        onChange={change}
        classNames={({ props }) => ({
          root: props.disabled ? 'disabled-transfer' : '',
          source: { header: 'source-header' },
        })}
        styles={{ target: { section: { width: 220 } } }}
      />
    </TaoProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Move to target' }));
  expect(change).not.toHaveBeenCalled();
  expect(ref.current?.nativeElement.className).toContain('disabled-transfer');
  expect(container.querySelector('.source-header')).toBeTruthy();
  expect(screen.getByRole('region', { name: 'Target' }).style.width).toBe(
    '220px',
  );
});
test('footer, custom select-all labels, empty content and scroll callbacks receive section contracts', () => {
  const onScroll = rs.fn();
  render(
    <Transfer
      dataSource={data}
      render={renderItem}
      targetKeys={['d']}
      showSearch={{ defaultValue: 'Missing' }}
      onScroll={onScroll}
      selectAllLabels={[
        (info) => `Selected ${info.selectedCount}/${info.totalCount}`,
      ]}
      locale={{ notFoundContent: ['No source matches', 'No target matches'] }}
      footer={(props, info) => (
        <span>{`${info?.direction}: ${props.dataSource.length}`}</span>
      )}
    />,
  );
  expect(screen.getByText('Selected 0/0')).toBeTruthy();
  expect(screen.getByText('No source matches')).toBeTruthy();
  expect(screen.getByText('No target matches')).toBeTruthy();
  expect(screen.getByText('left: 3')).toBeTruthy();
  expect(screen.getByText('right: 1')).toBeTruthy();
  fireEvent.scroll(screen.getAllByRole('list')[0]!);
  expect(onScroll.mock.calls[0]?.[0]).toBe('left');
});
