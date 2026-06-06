import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from '../../src/components/button/button';
import { TaoProvider } from '../../src/provider/tao-provider';

test('renders children text', () => {
  render(<Button>Submit</Button>);
  expect(screen.getByRole('button', { name: 'Submit' })).toBeTruthy();
});

test('variant prop sets data-tao-variant', () => {
  render(<Button variant="destructive">Del</Button>);
  expect(screen.getByRole('button').dataset.taoVariant).toBe('destructive');
});

test('defaults to variant=primary', () => {
  render(<Button>OK</Button>);
  expect(screen.getByRole('button').dataset.taoVariant).toBe('primary');
});

test('size prop sets data-tao-size', () => {
  render(<Button size="large">Big</Button>);
  expect(screen.getByRole('button').dataset.taoSize).toBe('large');
});

test('defaults to size=medium', () => {
  render(<Button>OK</Button>);
  expect(screen.getByRole('button').dataset.taoSize).toBe('medium');
});

test('inherits size from TaoProvider', () => {
  render(
    <TaoProvider size="small">
      <Button>OK</Button>
    </TaoProvider>,
  );
  expect(screen.getByRole('button').dataset.taoSize).toBe('small');
});

test('own size prop overrides provider', () => {
  render(
    <TaoProvider size="small">
      <Button size="large">OK</Button>
    </TaoProvider>,
  );
  expect(screen.getByRole('button').dataset.taoSize).toBe('large');
});

test('inherits disabled from TaoProvider', () => {
  render(
    <TaoProvider disabled>
      <Button>OK</Button>
    </TaoProvider>,
  );
  expect(screen.getByRole('button')).toBeDisabled();
});

test('disabled prop prevents onClick', async () => {
  let clicked = false;
  render(<Button disabled onClick={() => { clicked = true; }}>OK</Button>);
  await userEvent.click(screen.getByRole('button'));
  expect(clicked).toBe(false);
});

test('loading sets aria-busy and disables', () => {
  render(<Button loading>Save</Button>);
  const btn = screen.getByRole('button');
  expect(btn.getAttribute('aria-busy')).toBe('true');
  expect(btn).toBeDisabled();
});
