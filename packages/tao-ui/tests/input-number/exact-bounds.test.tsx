import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { InputNumber } from '../../src/components/input-number/input-number';

test.each([
  { input: '1.0000000000000001', max: 1, expected: '1' },
  { input: '0.99999999999999999', min: 1, expected: '1' },
  { input: '-1.0000000000000001', min: -1, expected: '-1' },
  {
    input: '9007199254740993',
    max: 9007199254740992,
    expected: '9007199254740992',
  },
  { input: '0.00000010000000001', max: 1e-7, expected: '0.0000001' },
])(
  'blur clamps $input exactly to $expected',
  ({ input: text, min, max, expected }) => {
    const onChange = rs.fn();
    const onBlur = rs.fn();
    render(
      <InputNumber
        min={min}
        max={max}
        allowNegative
        decimalPlaces={20}
        thousandsSeparator=""
        onChange={onChange}
        onBlur={onBlur}
      />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: text } });
    fireEvent.blur(input);
    expect(input).toHaveValue(expected);
    expect(onChange).toHaveBeenLastCalledWith(expected);
    expect(onBlur).toHaveBeenLastCalledWith(expected);
  },
);
