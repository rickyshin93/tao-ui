import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Textarea } from '../../src/components/textarea/textarea';
import { TaoProvider } from '../../src/provider/tao-provider';

test('renders textarea with value', () => {
  render(<Textarea value="hello" onChange={() => {}} />);
  expect(screen.getByRole('textbox')).toHaveValue('hello');
});

test('calls onChange on typing', async () => {
  let val = '';
  render(
    <Textarea
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
  render(<Textarea size="small" />);
  const wrapper = screen.getByRole('textbox').closest('[data-tao-textarea]')!;
  expect((wrapper as HTMLElement).dataset.taoSize).toBe('small');
});

test('inherits size from TaoProvider', () => {
  render(
    <TaoProvider size="large">
      <Textarea />
    </TaoProvider>,
  );
  const wrapper = screen.getByRole('textbox').closest('[data-tao-textarea]')!;
  expect((wrapper as HTMLElement).dataset.taoSize).toBe('large');
});

test('variant prop sets data-tao-variant', () => {
  render(<Textarea variant="filled" />);
  const wrapper = screen.getByRole('textbox').closest('[data-tao-textarea]')!;
  expect((wrapper as HTMLElement).dataset.taoVariant).toBe('filled');
});

test('inherits variant from TaoProvider', () => {
  render(
    <TaoProvider variant="borderless">
      <Textarea />
    </TaoProvider>,
  );
  const wrapper = screen.getByRole('textbox').closest('[data-tao-textarea]')!;
  expect((wrapper as HTMLElement).dataset.taoVariant).toBe('borderless');
});

test('error sets aria-invalid and data-tao-error', () => {
  render(<Textarea error />);
  const el = screen.getByRole('textbox');
  expect(el.getAttribute('aria-invalid')).toBe('true');
  expect(
    (el.closest('[data-tao-textarea]') as HTMLElement).dataset.taoError,
  ).toBe('true');
});

test('inherits disabled from TaoProvider', () => {
  render(
    <TaoProvider disabled>
      <Textarea />
    </TaoProvider>,
  );
  expect(screen.getByRole('textbox')).toBeDisabled();
});

test('autoSize marks the textarea element', () => {
  render(<Textarea autoSize />);
  expect(screen.getByRole('textbox').hasAttribute('data-tao-autosize')).toBe(
    true,
  );
});

test('semantic classNames merge onto parts', () => {
  render(
    <Textarea
      className="rootExtra"
      classNames={{ root: 'r', textarea: 't' }}
    />,
  );
  const el = screen.getByRole('textbox');
  expect(el.className).toContain('t');
  const wrapper = el.closest('[data-tao-textarea]') as HTMLElement;
  expect(wrapper.className).toContain('r');
  expect(wrapper.className).toContain('rootExtra');
});
