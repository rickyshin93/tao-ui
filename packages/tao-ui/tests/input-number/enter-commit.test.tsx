import { expect, rstest, test } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Form } from '../../src/components/form';
import { InputNumber } from '../../src/components/input-number/input-number';

test('Enter commits the clamped value before the Form submits', async () => {
  const onFinish = rstest.fn();
  render(
    <Form onFinish={onFinish}>
      <Form.Item name="qty" label="Quantity">
        <InputNumber max={100} />
      </Form.Item>
      <button type="submit">Save</button>
    </Form>,
  );
  const input = screen.getByLabelText('Quantity') as HTMLInputElement;
  await userEvent.type(input, '500{Enter}');
  await waitFor(() => expect(onFinish).toHaveBeenCalled());
  expect(onFinish).toHaveBeenLastCalledWith({ qty: '100' });
  expect(input.value).toBe('100');
  expect(document.activeElement).toBe(input);
});

test('Enter does not emit a change when the value is already normalized', async () => {
  const onChange = rstest.fn();
  render(<InputNumber aria-label="Quantity" max={100} onChange={onChange} />);
  await userEvent.type(screen.getByLabelText('Quantity'), '50{Enter}');
  expect(onChange.mock.calls).toEqual([['5'], ['50']]);
});
