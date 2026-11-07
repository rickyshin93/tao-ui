import { expect, rs, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { InputNumber } from '../../src/components/input-number/input-number';

test('Backspace during composition does not move the numeric input caret', () => {
  render(<InputNumber defaultValue="1234" />);
  const input = screen.getByRole<HTMLInputElement>('textbox');
  input.setSelectionRange(2, 2);
  fireEvent.keyDown(input, { key: 'Backspace', isComposing: true });

  expect(input.selectionStart).toBe(2);
  expect(input.selectionEnd).toBe(2);
});

test('Backspace keeps a selected range starting after a grouping separator', () => {
  render(<InputNumber defaultValue="1234" thousandsSeparator="," />);
  const input = screen.getByRole<HTMLInputElement>('textbox');
  expect(input).toHaveValue('1,234');
  act(() => input.focus());
  input.setSelectionRange(2, 4);
  fireEvent.keyDown(input, { key: 'Backspace' });
  expect([input.selectionStart, input.selectionEnd]).toEqual([2, 4]);
});

test('a clamped number keeps the requested decimal padding without crossing the bound', () => {
  const onChange = rs.fn();
  const view = render(
    <InputNumber
      value="12"
      max={10}
      decimalPlaces={2}
      padDecimalsOnBlur="always"
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('textbox');
  fireEvent.blur(input);
  expect(input).toHaveValue('10.00');
  expect(onChange).toHaveBeenLastCalledWith('10.00');

  view.rerender(
    <InputNumber
      value="0"
      min={1.5}
      decimalPlaces={0}
      padDecimalsOnBlur="always"
      onChange={onChange}
    />,
  );
  fireEvent.blur(input);
  expect(input).toHaveValue('1.5');
  expect(onChange).toHaveBeenLastCalledWith('1.5');
});
