import { expect, test } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { Spinner } from '../../src/components/spinner/spinner';
import { TaoProvider } from '../../src/provider/tao-provider';

test('renders the spinner when spinning (default)', () => {
  render(<Spinner />);
  const el = screen.getByRole('status');
  expect(el.dataset.taoSize).toBe('medium');
  expect(el.querySelector('[data-tao-spinner-indicator]')).toBeTruthy();
});

test('renders nothing when spinning=false (standalone)', () => {
  render(<Spinner spinning={false} />);
  expect(screen.queryByRole('status')).toBeNull();
});

test('renders tip text', () => {
  render(<Spinner tip="Loading…" />);
  expect(screen.getByText('Loading…')).toBeTruthy();
});

test('size prop sets data-tao-size', () => {
  render(<Spinner size="large" />);
  expect(screen.getByRole('status').dataset.taoSize).toBe('large');
});

test('inherits size from TaoProvider', () => {
  render(
    <TaoProvider size="small">
      <Spinner />
    </TaoProvider>,
  );
  expect(screen.getByRole('status').dataset.taoSize).toBe('small');
});

test('custom indicator replaces the default svg', () => {
  render(<Spinner indicator={<span data-testid="custom">⏳</span>} />);
  expect(screen.getByTestId('custom')).toBeTruthy();
  expect(document.querySelector('[data-tao-spinner-svg]')).toBeNull();
});

test('wrapper mode renders children plus an overlay while spinning', () => {
  render(
    <Spinner spinning>
      <div data-testid="content">wrapped</div>
    </Spinner>,
  );
  expect(screen.getByTestId('content')).toBeTruthy();
  const container = document.querySelector('[data-tao-spinner-container]');
  expect(container?.hasAttribute('data-tao-spinning')).toBe(true);
  expect(document.querySelector('[data-tao-spinner-overlay]')).toBeTruthy();
});

test('wrapper mode keeps children but drops the overlay when not spinning', () => {
  render(
    <Spinner spinning={false}>
      <div data-testid="content">wrapped</div>
    </Spinner>,
  );
  expect(screen.getByTestId('content')).toBeTruthy();
  expect(document.querySelector('[data-tao-spinner-overlay]')).toBeNull();
});

test('fullscreen renders a backdrop when spinning, nothing when not', () => {
  const { rerender } = render(<Spinner fullscreen spinning />);
  expect(document.querySelector('[data-tao-spinner-fullscreen]')).toBeTruthy();

  rerender(<Spinner fullscreen spinning={false} />);
  expect(document.querySelector('[data-tao-spinner-fullscreen]')).toBeNull();
});

test('delay defers showing the spinner', async () => {
  render(<Spinner spinning delay={50} />);
  // Hidden immediately, shown only after the delay elapses.
  expect(screen.queryByRole('status')).toBeNull();
  await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
});

test('classNames and styles apply to semantic parts', () => {
  render(
    <Spinner
      tip="Loading"
      classNames={{ root: 'my-root', tip: 'my-tip' }}
      styles={{ tip: { color: 'rgb(1, 2, 3)' } }}
    />,
  );
  const root = screen.getByRole('status');
  expect(root.classList.contains('my-root')).toBe(true);
  const tip = document.querySelector('[data-tao-spinner-tip]') as HTMLElement;
  expect(tip.classList.contains('my-tip')).toBe(true);
  expect(tip.style.color).toBe('rgb(1, 2, 3)');
});
