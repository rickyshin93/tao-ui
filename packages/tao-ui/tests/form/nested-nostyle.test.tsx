import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Form } from '../../src/components/form';
import { Input } from '../../src/components/input/input';

test('a labelled Form.Item names and describes its nested noStyle control', () => {
  render(
    <Form>
      <Form.Item label="Price" extra="Tax included">
        <Form.Item name="amount" noStyle>
          <Input />
        </Form.Item>
      </Form.Item>
    </Form>,
  );
  const input = screen.getByRole('textbox', { name: 'Price' });
  expect(screen.getByLabelText('Price')).toBe(input);
  expect(
    document.getElementById(input.getAttribute('aria-describedby') ?? '')
      ?.textContent,
  ).toBe('Tax included');
});

test('a nested noStyle control keeps its own id and aria attributes', () => {
  render(
    <Form>
      <Form.Item label="Price">
        <Form.Item name="amount" noStyle>
          <Input id="amount-input" aria-label="Amount" />
        </Form.Item>
      </Form.Item>
    </Form>,
  );
  const input = screen.getByRole('textbox', { name: 'Amount' });
  expect(input.id).toBe('amount-input');
});

test('a parent Form.Item displays and associates the errors of its noStyle fields', async () => {
  render(
    <Form>
      <Form.Item label="Price">
        <Form.Item
          name="amount"
          noStyle
          rules={[{ required: true, message: 'Enter an amount' }]}
        >
          <Input aria-label="Amount" />
        </Form.Item>
        <Form.Item
          name="currency"
          noStyle
          rules={[{ required: true, message: 'Enter a currency' }]}
        >
          <Input aria-label="Currency" />
        </Form.Item>
      </Form.Item>
      <button type="submit">Save</button>
    </Form>,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByText('Enter an amount');
  const amount = screen.getByRole('textbox', { name: 'Amount' });
  const currency = screen.getByRole('textbox', { name: 'Currency' });
  expect(amount).toHaveAccessibleDescription('Enter an amount');
  expect(currency).toHaveAccessibleDescription('Enter a currency');
  expect(amount).toHaveAttribute('aria-invalid', 'true');
  expect(currency).toHaveAttribute('aria-invalid', 'true');

  await user.type(amount, '2');
  expect(screen.queryByText('Enter an amount')).not.toBeInTheDocument();
  expect(currency).toHaveAccessibleDescription('Enter a currency');
});

test('explicit parent help takes precedence over a noStyle field error', async () => {
  render(
    <Form>
      <Form.Item label="Price" help="Enter the amount including tax">
        <Form.Item
          name="amount"
          noStyle
          rules={[{ required: true, message: 'Enter an amount' }]}
        >
          <Input />
        </Form.Item>
      </Form.Item>
      <button type="submit">Save</button>
    </Form>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  const amount = screen.getByRole('textbox', { name: 'Price' });
  expect(amount).toHaveAccessibleDescription('Enter the amount including tax');
  expect(screen.queryByText('Enter an amount')).not.toBeInTheDocument();
});
