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
  Mentions,
  type MentionsRef,
} from '../../src/components/mentions/mentions';
import { TaoProvider, zhCN } from '../../src/provider/tao-provider';

const options = [
  { value: 'alice', label: 'Alice' },
  { value: 'bob', label: 'Bob' },
];
function search(text: string) {
  const input = screen.getByRole('textbox') as HTMLTextAreaElement;
  fireEvent.change(input, { target: { value: text } });
  input.setSelectionRange(text.length, text.length);
  fireEvent.keyUp(input, {
    key: text.at(-1),
    keyCode: text.charCodeAt(text.length - 1),
    which: text.charCodeAt(text.length - 1),
  });
  return input;
}

test('searches after a prefix and inserts the selected mention with a split', async () => {
  const onSearch = rstest.fn();
  const onSelect = rstest.fn();
  const onChange = rstest.fn();
  render(
    <Mentions
      options={options}
      onSearch={onSearch}
      onSelect={onSelect}
      onChange={onChange}
    />,
  );
  const input = search('Hi @ali');
  expect(onSearch).toHaveBeenCalledWith('ali', '@');
  fireEvent.click(await screen.findByText('Alice'));
  expect(input).toHaveValue('Hi @alice ');
  expect(onSelect.mock.calls[0]).toEqual([
    expect.objectContaining({ value: 'alice' }),
    '@',
  ]);
  expect(onChange.mock.calls.at(-1)?.[0]).toBe('Hi @alice ');
});

test('supports multiple prefixes, a custom split and restores the caret', async () => {
  render(<Mentions options={options} prefix={['@', '#']} split="," />);
  const input = search('#bo');
  fireEvent.click(await screen.findByText('Bob'));
  expect(input).toHaveValue('#bob,');
  await waitFor(() => expect(input.selectionStart).toBe(5));
});

test('keyboard navigation skips disabled options and Enter chooses the active mention', async () => {
  render(
    <Mentions
      options={[
        { value: 'locked', label: 'Locked', disabled: true },
        ...options,
      ]}
    />,
  );
  const input = search('@');
  await screen.findByText('Alice');
  fireEvent.keyDown(input, { key: 'ArrowDown', which: 40, keyCode: 40 });
  fireEvent.keyDown(input, { key: 'Enter', which: 13, keyCode: 13 });
  expect(input).toHaveValue('@bob ');
});

test('Enter confirms composition without inserting a mention', async () => {
  const onSelect = rstest.fn();
  render(<Mentions options={options} onSelect={onSelect} />);
  const input = search('@');
  await screen.findByText('Alice');
  fireEvent.compositionStart(input);
  expect(
    fireEvent.keyDown(input, {
      key: 'Enter',
      keyCode: 13,
      which: 13,
      isComposing: true,
    }),
  ).toBe(true);
  expect(onSelect).not.toHaveBeenCalled();
  expect(input).toHaveValue('@');
  fireEvent.compositionEnd(input);
  fireEvent.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(input).toHaveValue('@alice ');
});

test('controlled values are only updated by the owner', () => {
  const onChange = rstest.fn();
  render(<Mentions value="fixed" onChange={onChange} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'edit' } });
  expect(onChange).toHaveBeenCalledWith('edit');
  expect(screen.getByRole('textbox')).toHaveValue('fixed');
});

test('an explicitly empty controlled value ignores the default and unaccepted edits', () => {
  const onChange = rstest.fn();
  render(
    <Mentions value={undefined} defaultValue="default" onChange={onChange} />,
  );
  const input = screen.getByRole('textbox');
  expect(input).toHaveValue('');
  fireEvent.change(input, { target: { value: 'draft' } });
  expect(onChange).toHaveBeenCalledExactlyOnceWith('draft');
  expect(input).toHaveValue('');
});

test('loading replaces suggestions with an unselectable spinner', async () => {
  const onSelect = rstest.fn();
  render(<Mentions options={options} loading onSelect={onSelect} />);
  const input = search('@');
  expect(await screen.findByRole('status')).toBeInTheDocument();
  expect(screen.queryByText('Alice')).toBeNull();
  fireEvent.keyDown(input, { key: 'Enter', which: 13, keyCode: 13 });
  expect(onSelect).not.toHaveBeenCalled();
});

test('custom filtering and validateSearch control visible suggestions', async () => {
  render(
    <Mentions
      options={options}
      filterOption={false}
      validateSearch={(value) => !value.includes('!')}
    />,
  );
  const input = search('@x');
  expect(await screen.findByText('Alice')).toBeVisible();
  search('@x!');
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  expect(input).toHaveValue('@x!');
});

test('clear has localized accessible text and emits an empty string', () => {
  const onClear = rstest.fn();
  const onChange = rstest.fn();
  render(
    <TaoProvider locale={zhCN}>
      <Mentions
        defaultValue="Hello @alice"
        allowClear
        onClear={onClear}
        onChange={onChange}
      />
    </TaoProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: '清除' }));
  expect(screen.getByRole('textbox')).toHaveValue('');
  expect(onClear).toHaveBeenCalledOnce();
  expect(onChange).toHaveBeenCalledWith('');
});

test('readonly Mentions does not expose a clear action', () => {
  const onChange = rstest.fn();
  render(
    <Mentions readOnly allowClear defaultValue="@alice" onChange={onChange} />,
  );
  expect(screen.getByRole('textbox')).toHaveValue('@alice');
  expect(
    screen.queryByRole('button', { name: 'Clear' }),
  ).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

test('supports asynchronously replaced suggestion data', async () => {
  function Async() {
    const [data, setData] = useState<typeof options>();
    return (
      <Mentions options={data} onSearch={() => setData(options)}>
        <Mentions.Option value="legacy">Legacy</Mentions.Option>
      </Mentions>
    );
  }
  render(<Async />);
  search('@');
  expect(await screen.findByText('Alice')).toBeVisible();
  expect(screen.queryByText('Legacy')).toBeNull();
});

test('getMentions matches prefixes and separators while ignoring empty values', () => {
  expect(Mentions.getMentions('Hello @alice @ #topic @bob')).toEqual([
    { prefix: '@', value: 'alice' },
    { prefix: '@', value: 'bob' },
  ]);
  expect(
    Mentions.getMentions('@alice,#topic,#', { prefix: ['@', '#'], split: ',' }),
  ).toEqual([
    { prefix: '@', value: 'alice' },
    { prefix: '#', value: 'topic' },
  ]);
  expect(Mentions.getMentions('')).toEqual([]);
});

test('getMentions extracts mentions from pasted multiline text', () => {
  expect(Mentions.getMentions('Hello\n@alice\r\n@bob\nThanks')).toEqual([
    { prefix: '@', value: 'alice' },
    { prefix: '@', value: 'bob' },
  ]);
});

test('legacy Option children remain selectable', async () => {
  render(
    <Mentions>
      <Mentions.Option value="legacy">Legacy</Mentions.Option>
    </Mentions>,
  );
  const input = search('@');
  fireEvent.click(await screen.findByText('Legacy'));
  expect(input).toHaveValue('@legacy ');
});

test('inherits defaults and exposes themed semantic DOM, focus and native textarea refs', async () => {
  const ref = createRef<MentionsRef>();
  const { container, rerender } = render(
    <TaoProvider size="large" theme={{ mode: 'dark' }}>
      <Mentions
        ref={ref}
        options={options}
        classNames={({ props }) => ({
          root: props.size === 'large' ? 'large-root' : '',
          textarea: 'custom-textarea',
        })}
        styles={{ textarea: { resize: 'none' } }}
        popupRender={(menu) => (
          <>
            {menu}
            <span>Footer</span>
          </>
        )}
      />
    </TaoProvider>,
  );
  act(() => ref.current?.focus());
  expect(screen.getByRole('textbox')).toHaveFocus();
  expect(ref.current?.textarea).toBe(screen.getByRole('textbox'));
  expect(container.querySelector('[data-tao-mentions]')).toHaveClass(
    'large-root',
  );
  expect(screen.getByRole('textbox')).toHaveClass('custom-textarea');
  expect(screen.getByRole('textbox')).toHaveStyle({ resize: 'none' });
  search('@');
  expect(
    (await screen.findByText('Footer')).closest('[data-tao-theme]'),
  ).toHaveAttribute('data-tao-theme', 'dark');
  rerender(
    <TaoProvider disabled>
      <Mentions />
    </TaoProvider>,
  );
  expect(screen.getByRole('textbox')).toBeDisabled();
});

test('maps the public middle size alias to the shared medium control', () => {
  const { container } = render(<Mentions size="middle" />);
  expect(container.querySelector('[data-tao-mentions]')).toHaveAttribute(
    'data-tao-size',
    'medium',
  );
});
