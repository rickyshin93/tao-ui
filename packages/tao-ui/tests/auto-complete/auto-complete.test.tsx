import { expect, rstest, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createRef, useState } from 'react';
import {
  AutoComplete,
  type AutoCompleteRef,
} from '../../src/components/auto-complete/auto-complete';
import { Input } from '../../src/components/input/input';
import { TaoProvider, zhCN } from '../../src/provider/tao-provider';

const options = [
  { value: 'alice@example.com', label: 'Alice' },
  { value: 'bob@example.com', label: 'Bob' },
];

test('typing emits change and search while selection emits change and select', async () => {
  const onChange = rstest.fn();
  const onSearch = rstest.fn();
  const onSelect = rstest.fn();
  render(
    <AutoComplete
      options={options}
      onChange={onChange}
      onSearch={onSearch}
      onSelect={onSelect}
    />,
  );
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } });
  expect(onChange.mock.calls[0][0]).toBe('a');
  expect(onSearch).toHaveBeenCalledWith('a');
  fireEvent.click(await screen.findByText('Alice'));
  expect(onChange.mock.calls[1][0]).toBe('alice@example.com');
  expect(onSelect.mock.calls[0]).toEqual(['alice@example.com', options[0]]);
  expect(onSearch).toHaveBeenCalledOnce();
  expect(screen.getByRole('combobox')).toHaveValue('alice@example.com');
});

test('controlled values stay owned by the caller and controlled open emits requests', async () => {
  const onChange = rstest.fn();
  const onOpenChange = rstest.fn();
  render(
    <AutoComplete
      options={options}
      value="fixed"
      open
      onChange={onChange}
      onOpenChange={onOpenChange}
    />,
  );
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'new' } });
  expect(onChange.mock.calls[0][0]).toBe('new');
  expect(screen.getByRole('combobox')).toHaveValue('fixed');
  fireEvent.click(await screen.findByText('Alice'));
  await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
});

test('an open AutoComplete can render a custom empty popup', () => {
  render(
    <AutoComplete
      open
      options={[]}
      popupRender={() => <button type="button">Create entry</button>}
    />,
  );

  expect(screen.getByRole('button', { name: 'Create entry' })).toBeVisible();
});

test('does not display an empty dropdown despite controlled open', () => {
  render(<AutoComplete options={[]} open />);
  expect(screen.getByRole('combobox')).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  expect(screen.queryByRole('listbox')).toBeNull();
});

test('an explicitly empty controlled value ignores the default and unaccepted edits', () => {
  const onChange = rstest.fn();
  render(
    <AutoComplete
      value={undefined}
      defaultValue="default"
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('combobox');
  expect(input).toHaveValue('');
  fireEvent.change(input, { target: { value: 'draft' } });
  expect(onChange.mock.calls[0][0]).toBe('draft');
  expect(input).toHaveValue('');
});

test('showSearch object filters options and supports grouped option data', async () => {
  render(
    <AutoComplete
      options={[{ label: 'People', options }]}
      showSearch={{
        filterOption: (search, option) =>
          String(option?.label).toLowerCase().includes(search.toLowerCase()),
      }}
    />,
  );
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ali' } });
  expect(await screen.findByText('Alice')).toBeVisible();
  expect(screen.queryByText('Bob')).toBeNull();
  expect(screen.getByText('People')).toBeInTheDocument();
});

test('keyboard backfill previews an option and Enter accepts it while skipping disabled choices', async () => {
  const onSelect = rstest.fn();
  render(
    <AutoComplete
      defaultOpen
      backfill
      options={[
        { value: 'locked', label: 'Locked', disabled: true },
        ...options,
      ]}
      onSelect={onSelect}
    />,
  );
  const input = screen.getByRole('combobox');
  await screen.findByText('Alice');
  fireEvent.keyDown(input, { key: 'ArrowDown', which: 40, keyCode: 40 });
  expect(input).toHaveValue('alice@example.com');
  fireEvent.keyDown(input, { key: 'Enter', which: 13, keyCode: 13 });
  expect(onSelect.mock.calls[0][0]).toBe('alice@example.com');
});

test('clear has a localized accessible name and preserves the public clear event', () => {
  const onClear = rstest.fn();
  render(
    <TaoProvider locale={zhCN}>
      <AutoComplete defaultValue="alice" allowClear onClear={onClear} />
    </TaoProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: '清除' }));
  expect(screen.getByRole('combobox')).toHaveValue('');
  expect(onClear).toHaveBeenCalledOnce();
});

test('forwards custom textarea props and composes its event handlers', async () => {
  const onInputChange = rstest.fn();
  const onChange = rstest.fn();
  render(
    <AutoComplete options={options} onChange={onChange}>
      <textarea aria-label="Custom message" rows={3} onChange={onInputChange} />
    </AutoComplete>,
  );
  const input = screen.getByRole('combobox', { name: 'Custom message' });
  expect(input.tagName).toBe('TEXTAREA');
  expect(input).toHaveAttribute('rows', '3');
  fireEvent.change(input, { target: { value: 'a' } });
  expect(onInputChange).toHaveBeenCalledOnce();
  expect(onChange.mock.calls[0][0]).toBe('a');
  fireEvent.click(await screen.findByText('Alice'));
  expect(input).toHaveValue('alice@example.com');
});

test('disabled AutoComplete disables a custom input with a local false override', () => {
  const onChange = rstest.fn();
  render(
    <AutoComplete disabled options={options} onChange={onChange}>
      <Input aria-label="Custom input" disabled={false} />
    </AutoComplete>,
  );
  const input = screen.getByRole('combobox', { name: 'Custom input' });
  expect(input).toBeDisabled();
  expect(onChange).not.toHaveBeenCalled();
});

test('custom tao Input preserves its native control wrapper', () => {
  render(
    <AutoComplete options={options}>
      <Input aria-label="Custom input" prefix="@" />
    </AutoComplete>,
  );
  const input = screen.getByRole('combobox', { name: 'Custom input' });
  expect(input.closest('[data-tao-input]')).toBeInTheDocument();
  expect(input.closest('[data-tao-auto-complete]')).not.toHaveAttribute(
    'data-tao-control',
  );
});

test('legacy Option and dataSource use the same value contract', async () => {
  const onChange = rstest.fn();
  const { rerender } = render(
    <AutoComplete defaultOpen onChange={onChange}>
      <AutoComplete.Option value="a">Legacy A</AutoComplete.Option>
    </AutoComplete>,
  );
  fireEvent.click(await screen.findByText('Legacy A'));
  expect(onChange.mock.calls[0][0]).toBe('a');
  rerender(
    <AutoComplete
      open
      dataSource={[{ value: 'b', text: 'Legacy B' }]}
      onChange={onChange}
    />,
  );
  fireEvent.click(await screen.findByText('Legacy B'));
  expect(onChange.mock.calls[1][0]).toBe('b');
});

test('composition defers search until the committed text and controlled onChange keeps it', async () => {
  const onSearch = rstest.fn();
  function Controlled() {
    const [value, setValue] = useState('');
    return (
      <AutoComplete
        value={value}
        onChange={setValue}
        onSearch={onSearch}
        options={[{ value: '中文' }]}
      />
    );
  }
  render(<Controlled />);
  const input = screen.getByRole('combobox');
  fireEvent.compositionStart(input);
  fireEvent.change(input, { target: { value: '中' } });
  fireEvent.compositionEnd(input, { data: '中' });
  expect(input).toHaveValue('中');
  expect(onSearch.mock.calls.at(-1)?.[0]).toBe('中');
});

test('Enter confirms composition without accepting an AutoComplete suggestion', async () => {
  const onSelect = rstest.fn();
  render(
    <AutoComplete
      defaultOpen
      defaultActiveFirstOption
      options={[{ value: '中文' }]}
      onSelect={onSelect}
    />,
  );
  const input = screen.getByRole('combobox');
  await screen.findByText('中文', {
    selector: '.tao-select-engine-item-option-content',
  });
  fireEvent.compositionStart(input);
  expect(
    fireEvent.keyDown(input, {
      key: 'Enter',
      keyCode: 13,
      which: 13,
      isComposing: true,
    }),
  ).toBe(true);
  fireEvent.keyUp(input, { key: 'Enter', keyCode: 13, which: 13 });
  expect(onSelect).not.toHaveBeenCalled();
  fireEvent.compositionEnd(input);
  fireEvent.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
  expect(onSelect).toHaveBeenCalledTimes(1);
});

test('inherits disabled and supports refs, semantic callbacks and themed portals', async () => {
  const ref = createRef<AutoCompleteRef>();
  const { container, rerender } = render(
    <TaoProvider size="large" theme={{ mode: 'dark' }}>
      <AutoComplete
        ref={ref}
        options={options}
        defaultOpen
        classNames={({ props }) => ({
          root: props.size === 'large' ? 'large-root' : '',
          popup: { listItem: 'custom-option' },
        })}
        styles={{ popup: { listItem: { fontWeight: 700 } } }}
      />
    </TaoProvider>,
  );
  act(() => ref.current?.focus());
  expect(screen.getByRole('combobox')).toHaveFocus();
  expect(container.querySelector('[data-tao-auto-complete]')).toHaveClass(
    'large-root',
  );
  const option = await screen.findByText('Alice');
  expect(option.closest('[data-tao-theme]')).toHaveAttribute(
    'data-tao-theme',
    'dark',
  );
  expect(document.querySelector('.custom-option')).toHaveStyle({
    fontWeight: '700',
  });
  rerender(
    <TaoProvider disabled>
      <AutoComplete options={options} />
    </TaoProvider>,
  );
  expect(screen.getByRole('combobox')).toBeDisabled();
});

test('maps the public middle size alias to the shared medium control', () => {
  const { container } = render(<AutoComplete size="middle" />);
  expect(container.querySelector('[data-tao-auto-complete]')).toHaveAttribute(
    'data-tao-size',
    'medium',
  );
});
