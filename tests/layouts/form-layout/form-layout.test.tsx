import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { FormLayout } from '../../../src/layouts/form-layout/form-layout';

test('renders children inside container', () => {
  render(
    <FormLayout>
      <span data-testid="kid">hello</span>
    </FormLayout>,
  );
  expect(screen.getByTestId('kid')).toBeTruthy();
});

test('has data-tao-form-layout attribute', () => {
  const { container } = render(
    <FormLayout>
      <div>x</div>
    </FormLayout>,
  );
  expect(container.querySelector('[data-tao-form-layout]')).toBeTruthy();
});
