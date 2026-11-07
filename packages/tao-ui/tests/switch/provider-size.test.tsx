import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Switch } from '../../src/components/switch/switch';
import { TaoProvider } from '../../src/provider/tao-provider';

test('Switch inherits provider small size and follows provider updates', () => {
  const view = render(
    <TaoProvider size="small">
      <Switch />
    </TaoProvider>,
  );
  const control = screen.getByRole('switch');
  expect(control).toHaveAttribute('data-tao-size', 'small');
  view.rerender(
    <TaoProvider size="large">
      <Switch />
    </TaoProvider>,
  );
  expect(screen.getByRole('switch')).toBe(control);
  expect(control).toHaveAttribute('data-tao-size', 'medium');
});

test('Switch local size overrides provider size', () => {
  render(
    <TaoProvider size="small">
      <Switch size="medium" />
    </TaoProvider>,
  );
  expect(screen.getByRole('switch')).toHaveAttribute('data-tao-size', 'medium');
});
