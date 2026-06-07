import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Input } from '../../src/components/input/input';
import { TaoProvider } from '../../src/provider/tao-provider';

test('renders input with value', () => {
  render(<Input value="hello" onChange={() => {}} />);
  expect(screen.getByRole('textbox')).toHaveValue('hello');
});

test('calls onChange on typing', async () => {
  let val = '';
  render(
    <Input
      value={val}
      onChange={(e) => {
        val = e.target.value;
      }}
    />,
  );
  await userEvent.type(screen.getByRole('textbox'), 'a');
  expect(val).toBe('a');
});

test('size prop sets data-tao-size on wrapper', () => {
  render(<Input size="small" />);
  const wrapper = screen.getByRole('textbox').closest('[data-tao-input]')!;
  expect((wrapper as HTMLElement).dataset.taoSize).toBe('small');
});

test('inherits size from TaoProvider', () => {
  render(
    <TaoProvider size="large">
      <Input />
    </TaoProvider>,
  );
  const wrapper = screen.getByRole('textbox').closest('[data-tao-input]')!;
  expect((wrapper as HTMLElement).dataset.taoSize).toBe('large');
});

test('variant prop sets data-tao-variant', () => {
  render(<Input variant="filled" />);
  const wrapper = screen.getByRole('textbox').closest('[data-tao-input]')!;
  expect((wrapper as HTMLElement).dataset.taoVariant).toBe('filled');
});

test('inherits variant from TaoProvider', () => {
  render(
    <TaoProvider variant="borderless">
      <Input />
    </TaoProvider>,
  );
  const wrapper = screen.getByRole('textbox').closest('[data-tao-input]')!;
  expect((wrapper as HTMLElement).dataset.taoVariant).toBe('borderless');
});

test('prefix renders before input', () => {
  render(<Input prefix={<span data-testid="pfx">$</span>} />);
  expect(screen.getByTestId('pfx').textContent).toBe('$');
});

test('suffix renders after input', () => {
  render(<Input suffix={<span data-testid="sfx">kg</span>} />);
  expect(screen.getByTestId('sfx').textContent).toBe('kg');
});

test('error sets aria-invalid on input', () => {
  render(<Input error />);
  expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
});

test('inherits disabled from TaoProvider', () => {
  render(
    <TaoProvider disabled>
      <Input />
    </TaoProvider>,
  );
  expect(screen.getByRole('textbox')).toBeDisabled();
});
