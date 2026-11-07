import { expect, rs, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { Button } from '../../src/components/button/button';
import { Input, type InputRef } from '../../src/components/input/input';
import { Textarea } from '../../src/components/textarea/textarea';
import { zhCN } from '../../src/provider/locale';
import { TaoProvider } from '../../src/provider/tao-provider';

for (const Control of [Input, Textarea]) {
  test(`${Control === Input ? 'Input' : 'Textarea'} clears, counts and preserves focus`, async () => {
    const changes: string[] = [];
    let cleared = 0;
    render(
      <Control
        aria-label="field"
        defaultValue="hello"
        allowClear
        showCount
        maxLength={10}
        onChange={(e) => changes.push(e.target.value)}
        onClear={() => cleared++}
      />,
    );
    expect(screen.getByText('5 / 10')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.getByText('0 / 10')).toBeInTheDocument();
    expect(changes).toEqual(['']);
    expect(cleared).toBe(1);
  });
  test('controlled value remains authoritative when clear is rejected', async () => {
    let next = 'initial';
    render(
      <Control
        value="fixed"
        allowClear
        onChange={(e) => {
          next = e.target.value;
        }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(next).toBe('');
    expect(screen.getByRole('textbox')).toHaveValue('fixed');
  });
  test('readonly and disabled fields cannot be cleared', () => {
    render(
      <>
        <Control defaultValue="value" allowClear readOnly />
        <Control defaultValue="value" allowClear disabled />
      </>,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
  test('count.max warns without truncating; custom strategy and clipping apply after composition', () => {
    const { rerender } = render(
      <Control defaultValue="abcd" count={{ max: 2, show: true }} />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('abcd');
    expect(screen.getByText('4 / 2')).toHaveAttribute('data-tao-exceeded');
    rerender(
      <Control
        count={{
          max: 2,
          show: true,
          strategy: (v) => Array.from(v).length,
          exceedFormatter: (v, { max }) => Array.from(v).slice(0, max).join(''),
        }}
      />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '😊😊😊' } });
    expect(input).toHaveValue('😊😊');
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: '中文输入' } });
    expect(input).toHaveValue('中文输入');
    fireEvent.compositionEnd(input);
    expect(input).toHaveValue('中文');
  });
  test('enter ignores IME and prevents user-cancelled submission', () => {
    let presses = 0;
    const { rerender } = render(<Control onPressEnter={() => presses++} />);
    const input = screen.getByRole('textbox');
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(presses).toBe(0);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(presses).toBe(1);
    rerender(
      <Control
        onPressEnter={() => presses++}
        onKeyDown={(e) => e.preventDefault()}
      />,
    );
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(presses).toBe(1);
  });
  test('form reset restores default value and count', async () => {
    render(
      <form>
        <Control defaultValue="start" showCount />
        <button type="reset">Reset</button>
      </form>,
    );
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'changed' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('textbox')).toHaveValue('start');
    expect(screen.getByText('5')).toBeInTheDocument();
  });
  test('blur ends an interrupted composition for the next Enter', () => {
    const onBlur = rs.fn();
    const onPressEnter = rs.fn();
    render(<Control onBlur={onBlur} onPressEnter={onPressEnter} />);
    const input = screen.getByRole('textbox');
    fireEvent.compositionStart(input);
    fireEvent.blur(input);
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onPressEnter).toHaveBeenCalledTimes(1);
  });

  test('native reset ends a stale composition for the next Enter', async () => {
    const onPressEnter = rs.fn();
    render(
      <form aria-label="Editor">
        <Control defaultValue="start" onPressEnter={onPressEnter} />
      </form>,
    );
    const input = screen.getByRole('textbox');
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'draft' } });
    const form = screen.getByRole<HTMLFormElement>('form', { name: 'Editor' });
    await act(async () => form.reset());
    expect(input).toHaveValue('start');

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onPressEnter).toHaveBeenCalledTimes(1);
  });
  test(`${Control === Input ? 'Input' : 'Textarea'} follows its current native form on reset`, async () => {
    const form = (formId: string) => (
      <>
        <form id="first">
          <button type="reset">Reset first</button>
        </form>
        <form id="second">
          <button type="reset">Reset second</button>
        </form>
        <Control form={formId} defaultValue="start" />
      </>
    );
    const { rerender } = render(form('first'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'changed' } });
    rerender(form('second'));
    await userEvent.click(screen.getByRole('button', { name: 'Reset first' }));
    expect(input).toHaveValue('changed');
    await userEvent.click(screen.getByRole('button', { name: 'Reset second' }));
    expect(input).toHaveValue('start');
  });
}

test('Input skips conditional affixes and preserves numeric zero', () => {
  const { container, rerender } = render(
    <Input prefix={false} suffix="" addonBefore={false} addonAfter={true} />,
  );
  expect(container.querySelector('[data-tao-prefix]')).toBeNull();
  expect(container.querySelector('[data-tao-suffix]')).toBeNull();
  expect(container.querySelector('[data-tao-input-addon]')).toBeNull();
  rerender(<Input prefix={0} addonAfter={0} />);
  expect(container.querySelector('[data-tao-prefix]')).toHaveTextContent('0');
  expect(container.querySelector('[data-tao-input-addon]')).toHaveTextContent(
    '0',
  );
});

test('native ref supports extended cursor focus without replacing the node', () => {
  const ref = createRef<InputRef>();
  const { rerender } = render(<Input ref={ref} defaultValue="hello" />);
  const node = screen.getByRole('textbox');
  act(() => ref.current?.focus({ cursor: 'end', preventScroll: true }));
  expect(ref.current).toBe(node);
  expect(ref.current?.input).toBe(node);
  expect(ref.current?.selectionStart).toBe(5);
  rerender(
    <Input ref={ref} defaultValue="hello" prefix="$" allowClear showCount />,
  );
  expect(screen.getByRole('textbox')).toBe(node);
  expect(node).toHaveFocus();
  act(() => ref.current?.focus({ cursor: 'all' }));
  expect(ref.current?.selectionStart).toBe(0);
  expect(ref.current?.selectionEnd).toBe(5);
});

test('semantic callbacks receive props and decorate clear/count/addons', () => {
  render(
    <Input
      defaultValue="ab"
      allowClear
      showCount
      addonBefore="https://"
      addonAfter=".com"
      classNames={({ props }) => ({
        count: props.showCount ? 'counter' : '',
        clear: 'clear',
        addonBefore: 'addon',
      })}
    />,
  );
  expect(screen.getByText('2')).toHaveClass('counter');
  expect(screen.getByText('https://')).toHaveClass('addon');
  expect(screen.getByRole('button', { name: 'Clear' })).toHaveClass('clear');
});

test('Password supports controlled visibility and localized keyboard toggle', async () => {
  const changes: boolean[] = [];
  const { rerender } = render(
    <TaoProvider locale={zhCN}>
      <Input.Password
        aria-label="password"
        defaultValue="secret"
        visibilityToggle={{
          visible: false,
          onVisibleChange: (v) => changes.push(v),
        }}
      />
    </TaoProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: '显示密码' }));
  expect(changes).toEqual([true]);
  expect(screen.getByLabelText('password')).toHaveAttribute('type', 'password');
  rerender(<Input.Password aria-label="password" defaultValue="secret" />);
  screen.getByRole('button', { name: 'Show password' }).focus();
  await userEvent.keyboard('{Enter}');
  expect(screen.getByLabelText('password')).toHaveAttribute('type', 'text');
  expect(screen.getByLabelText('password')).toHaveValue('secret');
});

test('Search reports click, enter and clear sources; loading suppresses searches', async () => {
  const events: Array<[string, string | undefined]> = [];
  const handler = (
    value: string,
    _event: unknown,
    info?: { source: 'input' | 'clear' },
  ) => events.push([value, info?.source]);
  const { rerender } = render(
    <Input.Search defaultValue="hello" allowClear onSearch={handler} />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Search' }));
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
  await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(events).toEqual([
    ['hello', 'input'],
    ['hello', 'input'],
    ['', 'clear'],
  ]);
  rerender(<Input.Search value="wait" loading onSearch={handler} />);
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
  expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
  expect(events).toHaveLength(3);
});

test('a Search clear event can cancel the follow-up search', async () => {
  const onSearch = rs.fn();
  const prevented = rs.fn();
  render(
    <Input.Search
      defaultValue="hello"
      allowClear
      onSearch={onSearch}
      onChange={(event) => {
        if (typeof event.preventDefault === 'function') {
          event.preventDefault();
          prevented(event.defaultPrevented);
        }
      }}
    />,
  );

  await userEvent.click(screen.getByRole('button', { name: 'Clear' }));

  expect(prevented).toHaveBeenCalledExactlyOnceWith(true);
  expect(onSearch).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox')).toHaveValue('');
});

test('OTP distributes paste, supports holes and only emits complete values', async () => {
  const partial: string[][] = [];
  const complete: string[] = [];
  render(
    <Input.OTP
      length={4}
      formatter={(v) => v.toUpperCase()}
      onInput={(v) => partial.push(v)}
      onChange={(v) => complete.push(v)}
      separator={(i) => (i === 1 ? '-' : null)}
    />,
  );
  const cells = screen.getAllByRole('textbox');
  fireEvent.paste(cells[0], { clipboardData: { getData: () => 'abcdextra' } });
  expect(cells.map((node) => (node as HTMLInputElement).value)).toEqual([
    'A',
    'B',
    'C',
    'D',
  ]);
  expect(complete).toEqual(['ABCD']);
  fireEvent.keyDown(cells[1], { key: 'Delete' });
  expect(partial.at(-1)).toEqual(['A', '', 'C', 'D']);
  expect(complete).toHaveLength(1);
  fireEvent.keyDown(cells[1], { key: 'Backspace' });
  expect(cells[0]).toHaveFocus();
  expect(partial.at(-1)).toEqual(['', '', 'C', 'D']);
});

test('OTP controlled updates and masking preserve the real value', () => {
  function Demo() {
    const [value, setValue] = useState('12');
    return (
      <Input.OTP
        length={2}
        value={value}
        mask="●"
        onInput={(values) => setValue(values.join(''))}
      />
    );
  }
  render(<Demo />);
  const cells = screen.getAllByRole('textbox');
  expect(cells[0]).toHaveValue('1');
  fireEvent.change(cells[0], { target: { value: '3' } });
  expect(cells[0]).toHaveValue('3');
});

test('TextArea alias retains standalone component identity', () => {
  expect(Input.TextArea).toBe(Textarea);
});

test('OTP commits IME text only after composition finishes', () => {
  const complete: string[] = [];
  render(<Input.OTP length={2} onChange={(value) => complete.push(value)} />);
  const cells = screen.getAllByRole('textbox');
  fireEvent.compositionStart(cells[0]);
  fireEvent.change(cells[0], { target: { value: '中文' } });
  expect(cells[0]).toHaveValue('中文');
  expect(complete).toEqual([]);
  fireEvent.compositionEnd(cells[0]);
  expect(cells[0]).toHaveValue('中');
  expect(cells[1]).toHaveValue('文');
  expect(complete).toEqual(['中文']);
});

test('Search preserves custom button styles and lets its handler cancel search', async () => {
  let searches = 0;
  render(
    <Input.Search
      onSearch={() => searches++}
      classNames={{ button: 'semantic' }}
      styles={{ button: { color: 'red' } }}
      enterButton={
        <button
          type="button"
          className="custom"
          style={{ padding: 8 }}
          aria-label="Find record"
          onClick={(event) => event.preventDefault()}
        >
          Find
        </button>
      }
    />,
  );
  const button = screen.getByRole('button', { name: 'Find record' });
  expect(button).toHaveClass('custom', 'semantic');
  expect(button).toHaveStyle({ padding: '8px', color: 'red' });
  await userEvent.click(button);
  expect(searches).toBe(0);
});

test('disabling the password visibility toggle masks an exposed value', async () => {
  const view = render(
    <Input.Password aria-label="Password" defaultValue="secret" />,
  );
  const input = screen.getByLabelText('Password');
  await userEvent.click(screen.getByRole('button', { name: 'Show password' }));
  expect(input).toHaveAttribute('type', 'text');
  view.rerender(
    <Input.Password
      aria-label="Password"
      defaultValue="secret"
      visibilityToggle={false}
    />,
  );
  expect(input).toHaveAttribute('type', 'password');
  expect(screen.queryByRole('button', { name: 'Hide password' })).toBeNull();
  view.rerender(<Input.Password aria-label="Password" defaultValue="secret" />);
  expect(input).toHaveAttribute('type', 'password');
});

test('a custom loading Search button blocks pointer and Enter searches', async () => {
  const searches: string[] = [];
  const control = (loading: boolean) => (
    <Input.Search
      defaultValue="record"
      enterButton={<Button loading={loading}>Go</Button>}
      onSearch={(value) => searches.push(value)}
    />
  );
  const view = render(control(true));
  const button = screen.getByRole('button', { name: 'Search' });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
  await userEvent.click(button);
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
  expect(searches).toEqual([]);
  view.rerender(control(false));
  await userEvent.click(button);
  expect(searches).toEqual(['record']);
});
