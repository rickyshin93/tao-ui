import { readFileSync } from 'node:fs';
import { expect, rstest, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from '../../src/components/button/button';
import { TaoProvider } from '../../src/provider/tao-provider';

test('renders children text', () => {
  render(<Button>Submit</Button>);
  expect(screen.getByRole('button', { name: 'Submit' })).toBeTruthy();
});

test('an undefined button type does not accidentally submit a form', async () => {
  const submit = rstest.fn((event) => event.preventDefault());
  render(
    <form onSubmit={submit}>
      <Button type={undefined}>Open details</Button>
      <Button type="submit">Save</Button>
    </form>,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Open details' }));
  expect(submit).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(submit).toHaveBeenCalledTimes(1);
});

test('keeps a typographic line box while flex-centering content', () => {
  const css = readFileSync('src/components/button/button.css', 'utf8');
  const rootRule = css.match(
    /:where\(button\[data-tao-button\]\) \{([^}]+)\}/,
  )?.[1];

  expect(rootRule).toContain('line-height: var(--tao-line-height);');
});

test('bare variant keeps behavior while leaving visual styling to the caller', () => {
  render(<Button variant="bare">Bare</Button>);
  expect(screen.getByRole('button')).toHaveAttribute(
    'data-tao-variant',
    'bare',
  );
});

test('component-layer zero-specificity rules let consumer classes override visuals', () => {
  const css = readFileSync('src/components/button/button.css', 'utf8');

  expect(css).toContain('@layer components');
  expect(css).toContain(':where(button[data-tao-button]) {');
  expect(css).toContain(
    ':where(button[data-tao-button][data-tao-variant="bare"]) {',
  );
  expect(css).not.toMatch(/^button\[data-tao-button\]/m);
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
  render(
    <Button
      disabled
      onClick={() => {
        clicked = true;
      }}
    >
      OK
    </Button>,
  );
  await userEvent.click(screen.getByRole('button'));
  expect(clicked).toBe(false);
});

test('loading sets aria-busy and disables', () => {
  render(<Button loading>Save</Button>);
  const btn = screen.getByRole('button');
  expect(btn.getAttribute('aria-busy')).toBe('true');
  expect(btn).toBeDisabled();
});

test('loading renders built-in spinner in a mounted icon slot', () => {
  render(<Button loading>Save</Button>);
  const slot = document.querySelector('[data-tao-button-icon]');
  expect(slot).toBeTruthy();
  expect(slot?.closest('button')?.dataset.taoHasIcon).toBe('true');
  expect(slot?.dataset.taoLoading).toBe('true');
  expect(slot?.querySelector('[data-tao-button-spinner]')).toBeTruthy();
});

test('icon prop renders an idle icon, hidden layer absent when no loading', () => {
  render(<Button icon={<svg data-testid="my-icon" />}>Save</Button>);
  const slot = document.querySelector('[data-tao-button-icon]');
  expect(slot?.dataset.taoLoading).toBeUndefined();
  expect(slot?.closest('button')?.dataset.taoHasIcon).toBe('true');
  expect(screen.getByTestId('my-icon')).toBeTruthy();
  expect(slot?.querySelector('[data-tao-button-spinner]')).toBeTruthy();
});

test('loading with icon keeps both layers mounted (no DOM add/remove)', () => {
  render(
    <Button loading icon={<svg data-testid="my-icon" />}>
      Save
    </Button>,
  );
  const slot = document.querySelector('[data-tao-button-icon]');
  expect(slot?.dataset.taoLoading).toBe('true');
  // idle icon layer still mounted (just opacity:0), spinner present
  expect(slot?.querySelector('[data-tao-button-icon-idle]')).toBeTruthy();
  expect(slot?.querySelector('[data-tao-button-spinner]')).toBeTruthy();
});

test('loadingIcon overrides the built-in spinner', () => {
  render(
    <Button loading loadingIcon={<svg data-testid="custom" />}>
      Save
    </Button>,
  );
  expect(screen.getByTestId('custom')).toBeTruthy();
  expect(document.querySelector('[data-tao-button-spinner]')).toBeNull();
});

test('decorative button icons do not change its accessible name', () => {
  const view = render(<Button icon={<span>Download icon</span>}>Save</Button>);
  expect(screen.getByRole('button')).toHaveAccessibleName('Save');
  view.rerender(
    <Button
      loading
      icon={<span>Download icon</span>}
      loadingIcon={<span>Loading icon</span>}
    >
      Save
    </Button>,
  );
  expect(screen.getByRole('button')).toHaveAccessibleName('Save');
});

test('Button preserves an explicit aria-busy outside its loading state', () => {
  const view = render(<Button aria-busy="true">Save</Button>);
  expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByRole('button')).toBeEnabled();
  view.rerender(
    <Button loading aria-busy="false">
      Save
    </Button>,
  );
  expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
});

test('conditional icons leave no empty icon slot while a zero icon renders', () => {
  const view = render(<Button icon={false}>Continue</Button>);
  expect(view.container.querySelector('[data-tao-button-icon]')).toBeNull();
  view.rerender(<Button icon={0}>Continue</Button>);
  expect(
    view.container.querySelector('[data-tao-button-icon-idle]'),
  ).toHaveTextContent('0');
});
