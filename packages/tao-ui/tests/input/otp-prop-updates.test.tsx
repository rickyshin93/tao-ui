import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Input } from '../../src/components/input/input';

const values = () =>
  screen
    .getAllByRole('textbox')
    .map((cell) => (cell as HTMLInputElement).value);

test('controlled OTP reveals the full value when length increases', () => {
  const onChange = rs.fn();
  const view = render(
    <Input.OTP value="123456" length={4} onChange={onChange} />,
  );
  expect(values()).toEqual(['1', '2', '3', '4']);
  view.rerender(<Input.OTP value="123456" length={6} onChange={onChange} />);
  expect(values()).toEqual(['1', '2', '3', '4', '5', '6']);
  expect(onChange).not.toHaveBeenCalled();
});

test('controlled OTP applies changed formatter output without a value change', () => {
  const onInput = rs.fn();
  const view = render(<Input.OTP value="ab" length={2} onInput={onInput} />);
  view.rerender(
    <Input.OTP
      value="ab"
      length={2}
      formatter={(text) => text.toUpperCase()}
      onInput={onInput}
    />,
  );
  expect(values()).toEqual(['A', 'B']);
  expect(onInput).not.toHaveBeenCalled();
});

test('equivalent inline formatters preserve incomplete controlled edits', () => {
  const view = render(
    <Input.OTP value="" length={4} formatter={(text) => text.toUpperCase()} />,
  );
  fireEvent.change(screen.getAllByRole('textbox')[0], {
    target: { value: 'a' },
  });
  view.rerender(
    <Input.OTP value="" length={4} formatter={(text) => text.toUpperCase()} />,
  );
  expect(values()).toEqual(['A', '', '', '']);
});

test('equivalent inline formatters preserve holes in a controlled code', () => {
  const view = render(
    <Input.OTP
      value="abcd"
      length={4}
      formatter={(text) => text.toUpperCase()}
    />,
  );
  fireEvent.keyDown(screen.getAllByRole('textbox')[1], { key: 'Delete' });
  view.rerender(
    <Input.OTP
      value="abcd"
      length={4}
      formatter={(text) => text.toUpperCase()}
    />,
  );
  expect(values()).toEqual(['A', '', 'C', 'D']);
});

test('changing the OTP onInput payload cannot change the edited code', () => {
  const onChange = rs.fn();
  render(
    <Input.OTP
      length={2}
      defaultValue="12"
      onInput={(cells) => cells.reverse()}
      onChange={onChange}
    />,
  );
  fireEvent.change(screen.getAllByRole('textbox')[1], {
    target: { value: '3' },
  });
  expect(onChange).toHaveBeenCalledWith('13');
  expect(values()).toEqual(['1', '3']);
});

test('removing a composing OTP cell does not block the remaining cells', () => {
  const onChange = rs.fn();
  const view = render(
    <Input.OTP length={3} defaultValue="123" onChange={onChange} />,
  );
  const cell = screen.getAllByRole('textbox')[2];
  fireEvent.compositionStart(cell);
  fireEvent.change(cell, { target: { value: 'あ' } });

  view.rerender(
    <Input.OTP length={2} defaultValue="123" onChange={onChange} />,
  );
  fireEvent.change(screen.getAllByRole('textbox')[1], {
    target: { value: '4' },
  });

  expect(onChange).toHaveBeenCalledExactlyOnceWith('14');
  expect(values()).toEqual(['1', '4']);
});
