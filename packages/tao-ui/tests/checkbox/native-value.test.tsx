import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ChangeEvent } from 'react';
import { Checkbox } from '../../src/components/checkbox/checkbox';

test('Checkbox exposes its value through the native input and change event', () => {
  const values: string[] = [];
  const onChange = rs.fn((event: ChangeEvent<HTMLInputElement>) =>
    values.push(event.target.value),
  );
  const view = render(<Checkbox value="accepted" onChange={onChange} />);
  const input = screen.getByRole('checkbox');
  expect(input).toHaveAttribute('value', 'accepted');
  fireEvent.click(input);
  expect(values).toEqual(['accepted']);
  view.rerender(<Checkbox value="updated" onChange={onChange} />);
  expect(screen.getByRole('checkbox')).toBe(input);
  fireEvent.click(input);
  expect(values).toEqual(['accepted', 'updated']);
});
