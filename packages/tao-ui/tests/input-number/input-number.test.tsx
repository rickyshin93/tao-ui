import { expect, rstest, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Form } from '../../src/components/form';
import { InputNumber } from '../../src/components/input-number/input-number';
import { TaoProvider } from '../../src/provider/tao-provider';

test('native form reset restores an uncontrolled InputNumber default', async () => {
  const onChange = rstest.fn();
  render(
    <form aria-label="Payment">
      <InputNumber defaultValue="1234" onChange={onChange} />
    </form>,
  );
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: '5678' } });
  expect(input).toHaveValue('5,678');
  onChange.mockClear();

  const form = screen.getByRole<HTMLFormElement>('form', { name: 'Payment' });
  await act(async () => form.reset());

  expect(input).toHaveValue('1,234');
  expect(onChange).not.toHaveBeenCalled();
});

test.each(['typing', 'programmatic'] as const)(
  'Form clears a numeric field with undefined after %s entry without remounting',
  async (entry) => {
    function Demo() {
      const [form] = Form.useForm();
      return (
        <>
          <Form form={form}>
            <Form.Item name="amount">
              <InputNumber />
            </Form.Item>
          </Form>
          <button
            type="button"
            onClick={() => form.setFieldsValue({ amount: '1234' })}
          >
            Fill field
          </button>
          <button
            type="button"
            onClick={() => form.setFieldsValue({ amount: undefined })}
          >
            Clear field
          </button>
        </>
      );
    }
    render(<Demo />);
    const input = screen.getByRole('textbox');
    if (entry === 'typing') await userEvent.type(input, '1234');
    else
      await userEvent.click(screen.getByRole('button', { name: 'Fill field' }));
    expect(input).toHaveValue('1,234');
    await userEvent.click(screen.getByRole('button', { name: 'Clear field' }));
    expect(screen.getByRole('textbox')).toBe(input);
    expect(input).toHaveValue('');
  },
);

test('defaultValue remains editable when value is omitted', async () => {
  const { rerender } = render(<InputNumber defaultValue="12" />);
  const input = screen.getByRole('textbox');
  await userEvent.type(input, '3');
  expect(input).toHaveValue('123');
  rerender(<InputNumber defaultValue="99" />);
  expect(input).toHaveValue('123');
});

test('IN.1 — renders the Input surface (data-tao-control / input / size / variant)', () => {
  const { container } = render(<InputNumber value="" />);
  const root = container.firstChild as HTMLElement;
  expect(root.tagName).toBe('DIV');
  expect(root.getAttribute('data-tao-control')).toBe('');
  expect(root.getAttribute('data-tao-input')).toBe('');
  expect(root.getAttribute('data-tao-size')).toBe('medium');
  expect(root.getAttribute('data-tao-variant')).toBe('outlined');
  expect(root.querySelectorAll('input')).toHaveLength(1);
});

test('IN.2 — prefix renders with data-tao-prefix, not inside input value', () => {
  const { container } = render(<InputNumber value="100" prefix="$" />);
  const root = container.firstChild as HTMLElement;
  const children = Array.from(root.children);
  expect(children[0].getAttribute('data-tao-prefix')).toBe('');
  expect(children[0].textContent).toBe('$');
  expect(children[1].tagName).toBe('INPUT');
  expect((children[1] as HTMLInputElement).value).toBe('100');
});

test('IN.3 — groups the integer part with the thousands separator', () => {
  const { container } = render(
    <InputNumber value="1234567" thousandsSeparator="," decimalSeparator="." />,
  );
  const input = container.querySelector('input') as HTMLInputElement;
  expect(input.value).toBe('1,234,567');
});

test('IN.4 — onChange emits the canonical (ungrouped) value', () => {
  const onChange = rstest.fn();
  const { container } = render(
    <InputNumber value="" thousandsSeparator="," onChange={onChange} />,
  );
  const input = container.querySelector('input') as HTMLInputElement;
  fireEvent.change(input, { target: { value: '1234' } });
  expect(onChange).toHaveBeenCalledWith('1234');
});

test('IN.5 — size / variant / error props reach the surface', () => {
  const { container } = render(
    <InputNumber value="" size="small" variant="filled" error />,
  );
  const root = container.firstChild as HTMLElement;
  expect(root.getAttribute('data-tao-size')).toBe('small');
  expect(root.getAttribute('data-tao-variant')).toBe('filled');
  expect(root.getAttribute('data-tao-error')).toBe('true');
  const input = container.querySelector('input') as HTMLInputElement;
  expect(input.getAttribute('aria-invalid')).toBe('true');
});

test('IN.6 — inherits size / variant from TaoProvider', () => {
  const { container } = render(
    <TaoProvider size="large" variant="filled">
      <InputNumber value="" />
    </TaoProvider>,
  );
  // TaoProvider wraps children in a display:contents div, so query the control.
  const root = container.querySelector('[data-tao-input]') as HTMLElement;
  expect(root.getAttribute('data-tao-size')).toBe('large');
  expect(root.getAttribute('data-tao-variant')).toBe('filled');
});

test('IN.7 — passes native attrs (id / name / placeholder / disabled / aria-label)', () => {
  const { container } = render(
    <InputNumber
      value=""
      id="amount"
      name="amount-field"
      placeholder="Enter amount"
      disabled
      aria-label="Amount"
    />,
  );
  const input = container.querySelector('input') as HTMLInputElement;
  expect(input.id).toBe('amount');
  expect(input.name).toBe('amount-field');
  expect(input.placeholder).toBe('Enter amount');
  expect(input.disabled).toBe(true);
  expect(input.getAttribute('aria-label')).toBe('Amount');
});
