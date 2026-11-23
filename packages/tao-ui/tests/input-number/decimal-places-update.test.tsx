import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { InputNumber } from '../../src/components/input-number/input-number';

test('lowering decimalPlaces after mount is enforced when the edit commits', () => {
  const onChange = rstest.fn();
  const { rerender } = render(
    <InputNumber aria-label="Amount" value="12.5" onChange={onChange} />,
  );
  rerender(
    <InputNumber
      aria-label="Amount"
      value="12.5"
      decimalPlaces={0}
      onChange={onChange}
    />,
  );
  const input = screen.getByLabelText('Amount') as HTMLInputElement;
  fireEvent.focus(input);
  fireEvent.blur(input);
  expect(onChange).toHaveBeenLastCalledWith('12');
  expect(input.value).toBe('12');
});
