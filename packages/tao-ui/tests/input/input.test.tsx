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

  expect(rule).toContain(
    'padding-inline-start: var(--tao-input-affix-padding);',
  );
});

test('inner input geometrically centers its native line box', () => {
  const css = readFileSync('src/components/input/input.css', 'utf8');
  const rule = css.match(/\[data-tao-input\] input \{([^}]+)\}/)?.[1];

  expect(rule).toContain('box-sizing: border-box;');
  expect(rule).toContain('height: auto;');
  expect(rule).toContain('padding-block-start:');
  expect(rule).toContain('padding-block-end:');
  expect(
    rule?.match(
      /calc\(\(var\(--tao-input-control-height\) - 1lh\) \/ 2 - var\(--tao-line-width\)\)/g,
    ),
  ).toHaveLength(2);
  expect(rule).not.toContain('optical-offset');
  expect(rule).toContain('line-height: var(--tao-input-line-height);');
});

test('password input centers its mask glyph once a value is present', () => {
  const css = readFileSync('src/components/input/input.css', 'utf8');
  const rule = css.match(
    /\[data-tao-input\] input\[type="password"\][^{]*\{([^}]+)\}/,
  )?.[1];

  expect(rule).toBeDefined();
  expect(rule).not.toContain('optical-offset');
  expect(rule).toContain('font-family: Arial, sans-serif;');
  expect(
    css.match(/\[data-tao-input\] input\[type="password"\][^{]*\{/)?.[0],
  ).toContain(':not(:placeholder-shown)');
  expect(css.indexOf('input[type="password"]')).toBeGreaterThan(
    css.indexOf('input:-webkit-autofill'),
  );
});

test('each size derives input padding from its control height', () => {
  const css = readFileSync('src/components/input/input.css', 'utf8');

  expect(css).toContain(
    '--tao-input-control-height: var(--tao-control-height-sm);',
  );
  expect(css).toContain(
    '--tao-input-control-height: var(--tao-control-height);',
  );
  expect(css).toContain(
    '--tao-input-control-height: var(--tao-control-height-lg);',
  );
});

test('autofill paint stays inside the rounded control', () => {
  const css = readFileSync('src/components/input/input.css', 'utf8');
  const rootRule = css.match(/\[data-tao-input\] \{([^}]+)\}/)?.[1];
  const autofillRule = css.match(
    /\[data-tao-input\] input:-webkit-autofill \{([^}]+)\}/,
  )?.[1];

  expect(rootRule).toContain('overflow: hidden;');
  expect(autofillRule).toContain('appearance: none;');
  expect(autofillRule).toContain('font-family: inherit;');
  expect(autofillRule).toContain('line-height: var(--tao-input-line-height);');
});

test('React SVG prefix becomes an overlay and reserves input space', () => {
  const css = readFileSync('src/components/input/input.css', 'utf8');
  const rule = css.match(
    /\[data-tao-input\]:has\(\[data-tao-prefix\] svg\) input \{([^}]+)\}/,
  )?.[1];

  expect(rule).toMatch(
    /padding-inline-start:\s*calc\(\s*var\(--tao-input-affix-padding\)\s*\+\s*16px\s*\+\s*var\(--tao-input-affix-padding\)\s*\);/,
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
