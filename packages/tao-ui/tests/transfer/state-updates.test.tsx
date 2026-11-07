import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Transfer } from '../../src/components/transfer/transfer';

test('custom item selection ignores absent records and records from the other side', () => {
  const onSelectChange = rs.fn();
  render(
    <Transfer
      dataSource={[
        { key: 'a', title: 'Source' },
        { key: 'b', title: 'Target' },
      ]}
      targetKeys={['b']}
      onSelectChange={onSelectChange}
    >
      {({ direction, onItemSelect }) =>
        direction === 'left' && (
          <button
            type="button"
            onClick={() => {
              onItemSelect('missing', true);
              onItemSelect('b', true);
            }}
          >
            Select unavailable records
          </button>
        )
      }
    </Transfer>,
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Select unavailable records' }),
  );
  expect(onSelectChange).not.toHaveBeenCalled();
});

test('custom bulk selection cannot add disabled records or records on the other side', () => {
  const onSelectChange = rs.fn();
  render(
    <Transfer
      dataSource={[
        { key: 'a', title: 'Available' },
        { key: 'b', title: 'Disabled', disabled: true },
        { key: 'c', title: 'Target' },
      ]}
      targetKeys={['c']}
      onSelectChange={onSelectChange}
    >
      {({ direction, onItemSelectAll }) =>
        direction === 'left' && (
          <button type="button" onClick={() => onItemSelectAll(['a', 'b', 'c'], true)}>
            Select custom results
          </button>
        )
      }
    </Transfer>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Select custom results' }));
  expect(onSelectChange).toHaveBeenCalledExactlyOnceWith(['a'], []);
});

test('a custom remove request reports only records on the target side', () => {
  const onChange = rs.fn();
  render(
    <Transfer
      dataSource={[
        { key: 'a', title: 'Already in source' },
        { key: 'b', title: 'In target' },
      ]}
      targetKeys={['b']}
      onChange={onChange}
    >
      {({ direction, onItemRemove }) =>
        direction === 'right' && (
          <button type="button" onClick={() => onItemRemove?.(['a', 'b'])}>
            Remove supplied keys
          </button>
        )
      }
    </Transfer>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Remove supplied keys' }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith([], 'left', ['b']);
});

test('a custom list renderer may intentionally leave a section body empty', () => {
  render(
    <Transfer dataSource={[{ key: 'a', title: 'Alpha' }]} targetKeys={[]}>
      {({ direction }) => (direction === 'left' ? null : 'Custom target')}
    </Transfer>,
  );
  expect(
    screen.queryByRole('checkbox', { name: 'Alpha' }),
  ).not.toBeInTheDocument();
  expect(screen.getByText('Custom target')).toBeInTheDocument();
});

test.each(['Source', 'Target'] as const)(
  '%s pagination stays on its bounded page after records are restored',
  (side) => {
    const data = Array.from({ length: 12 }, (_, key) => ({
      key,
      title: `Item ${key + 1}`,
    }));
    const onChange = rs.fn();
    const props = {
      targetKeys: side === 'Target' ? data.map((item) => item.key) : [],
      pagination: { pageSize: 5, simple: false },
      onChange,
    };
    const view = render(<Transfer {...props} dataSource={data} />);
    const section = within(screen.getByRole('region', { name: side }));
    fireEvent.click(section.getByRole('button', { name: 'Page 3' }));
    expect(section.getByText('Item 11')).toBeInTheDocument();
    view.rerender(<Transfer {...props} dataSource={data.slice(0, 3)} />);
    expect(section.getByText('Item 1')).toBeInTheDocument();
    view.rerender(<Transfer {...props} dataSource={data} />);
    expect(section.getByText('Item 1')).toBeInTheDocument();
    expect(section.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(onChange).not.toHaveBeenCalled();
  },
);

test.each(['source', 'target'] as const)(
  'missing selected records cannot enable Move to %s',
  (destination) => {
    const data = [{ key: 'a', title: 'Alpha' }];
    const onChange = rs.fn();
    const onSelectChange = rs.fn();
    const props = {
      targetKeys: destination === 'source' ? ['a'] : [],
      selectedKeys: ['a'],
      onChange,
      onSelectChange,
    };
    const view = render(<Transfer {...props} dataSource={data} />);
    const button = screen.getByRole('button', {
      name: `Move to ${destination}`,
    });
    expect(button).not.toBeDisabled();
    view.rerender(<Transfer {...props} dataSource={[]} />);
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onChange).not.toHaveBeenCalled();
    expect(onSelectChange).not.toHaveBeenCalled();
    view.rerender(<Transfer {...props} dataSource={data} />);
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(
      destination === 'source' ? [] : ['a'],
      destination === 'source' ? 'left' : 'right',
      ['a'],
    );
  },
);

test.each(['left', 'right'] as const)(
  'custom %s action can cancel a transfer without clearing selection',
  (side) => {
    const onChange = rs.fn();
    const onSelectChange = rs.fn();
    const onClick = rs.fn((event: { preventDefault: () => void }) =>
      event.preventDefault(),
    );
    const customAction = (
      <button key="custom" type="button" onClick={onClick}>
        Custom move
      </button>
    );
    render(
      <Transfer
        dataSource={[{ key: 'a', title: 'Alpha' }]}
        targetKeys={side === 'left' ? ['a'] : []}
        selectedKeys={['a']}
        actions={side === 'right' ? [customAction] : ['Add', customAction]}
        onChange={onChange}
        onSelectChange={onSelectChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Custom move' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    expect(onSelectChange).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: 'Alpha' })).toBeChecked();
  },
);

test('one-way removal preserves selected target items that did not move', () => {
  const onChange = rs.fn();
  const onSelectChange = rs.fn();
  render(
    <Transfer
      oneWay
      dataSource={[
        { key: 'a', title: 'Alpha' },
        { key: 'b', title: 'Beta' },
      ]}
      targetKeys={['a', 'b']}
      selectedKeys={['a', 'b']}
      onChange={onChange}
      onSelectChange={onSelectChange}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Remove Alpha' }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith(['b'], 'left', ['a']);
  expect(onSelectChange).toHaveBeenCalledExactlyOnceWith([], ['b']);
});

test('one-way Remove current page is unavailable if every row on that page is disabled', async () => {
  const onChange = rs.fn();
  render(
    <Transfer
      oneWay
      dataSource={[
        { key: 'a', title: 'Alpha', disabled: true },
        { key: 'b', title: 'Beta' },
      ]}
      targetKeys={['a', 'b']}
      pagination={{ pageSize: 1 }}
      onChange={onChange}
    />,
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Selection actions Target' }),
  );
  const currentPage = screen.getByRole('menuitem', {
    name: 'Remove current page',
  });
  expect(currentPage).toHaveAttribute('aria-disabled', 'true');
  fireEvent.click(currentPage);
  expect(onChange).not.toHaveBeenCalled();
  expect(
    screen.getByRole('menuitem', { name: 'Remove all' }),
  ).not.toHaveAttribute('aria-disabled');
});
