import { readFileSync } from 'node:fs';
import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { TaoProvider, useTaoConfig } from '../../src/provider/tao-provider';

test('renders children', () => {
  render(<TaoProvider>hello</TaoProvider>);
  expect(screen.getByText('hello')).toBeTruthy();
});

test('theme.token.colorPrimary sets --tao-color-primary CSS variable', () => {
  render(
    <TaoProvider theme={{ token: { colorPrimary: 'oklch(0.5 0.2 260)' } }}>
      <span data-testid="child">x</span>
    </TaoProvider>,
  );
  const provider = screen.getByTestId('child').parentElement!;
  expect(provider.style.getPropertyValue('--tao-color-primary')).toBe(
    'oklch(0.5 0.2 260)',
  );
});

test('default theme tokens are not scoped to data-tao-provider', () => {
  const css = readFileSync('src/theme/theme.css', 'utf8');
  expect(css).not.toContain(
    ':root,\n\t[data-tao-provider]',
  );
});

test('theme.token.borderRadius sets --tao-radius CSS variable', () => {
  render(
    <TaoProvider theme={{ token: { borderRadius: 8 } }}>
      <span data-testid="child">x</span>
    </TaoProvider>,
  );
  const provider = screen.getByTestId('child').parentElement!;
  expect(provider.style.getPropertyValue('--tao-radius')).toBe('8px');
});

test('size prop is accessible via useTaoConfig', () => {
  function ShowSize() {
    const { size } = useTaoConfig();
    return <span data-testid="size">{size}</span>;
  }
  render(
    <TaoProvider size="small">
      <ShowSize />
    </TaoProvider>,
  );
  expect(screen.getByTestId('size').textContent).toBe('small');
});

test('disabled prop is accessible via useTaoConfig', () => {
  function ShowDisabled() {
    const { disabled } = useTaoConfig();
    return <span data-testid="d">{String(disabled)}</span>;
  }
  render(
    <TaoProvider disabled>
      <ShowDisabled />
    </TaoProvider>,
  );
  expect(screen.getByTestId('d').textContent).toBe('true');
});

test('variant prop is accessible via useTaoConfig', () => {
  function ShowVariant() {
    const { variant } = useTaoConfig();
    return <span data-testid="v">{variant}</span>;
  }
  render(
    <TaoProvider variant="filled">
      <ShowVariant />
    </TaoProvider>,
  );
  expect(screen.getByTestId('v').textContent).toBe('filled');
});

test('nested provider: child overrides parent size', () => {
  function ShowSize() {
    const { size } = useTaoConfig();
    return <span data-testid="size">{size}</span>;
  }
  render(
    <TaoProvider size="large">
      <TaoProvider size="small">
        <ShowSize />
      </TaoProvider>
    </TaoProvider>,
  );
  expect(screen.getByTestId('size').textContent).toBe('small');
});

test('nested provider: child inherits parent when not specified', () => {
  function ShowSize() {
    const { size } = useTaoConfig();
    return <span data-testid="size">{size}</span>;
  }
  render(
    <TaoProvider size="large">
      <TaoProvider disabled>
        <ShowSize />
      </TaoProvider>
    </TaoProvider>,
  );
  expect(screen.getByTestId('size').textContent).toBe('large');
});
