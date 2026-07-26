import { readFileSync } from 'node:fs';
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
  const SearchIcon = () => <svg data-testid="pfx" />;
  render(<Input prefix={<SearchIcon />} />);
  expect(screen.getByTestId('pfx').closest('[data-tao-prefix]')).not.toBeNull();
});

test('prefix keeps standard input start padding', () => {
  const css = readFileSync('src/components/input/input.css', 'utf8');
  const rule = css.match(
    /\[data-tao-input\] \[data-tao-prefix\] \+ input \{([^}]+)\}/,
  )?.[1];

  expect(rule).toContain('padding-inline-start: var(--tao-padding-sm);');
});

test('React SVG prefix becomes an overlay and reserves input space', () => {
  const css = readFileSync('src/components/input/input.css', 'utf8');
  const rule = css.match(
    /\[data-tao-input\]:has\(\[data-tao-prefix\] svg\) input \{([^}]+)\}/,
  )?.[1];

  expect(rule).toMatch(
    /padding-inline-start:\s*calc\(\s*var\(--tao-padding-sm\)\s*\+\s*16px\s*\+\s*var\(--tao-padding-sm\)\s*\);/,
  );
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
