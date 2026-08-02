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

test('applies semantic root class and style', () => {
  const { container } = render(
    <FormLayout
      className="consumer"
      style={{ width: 320 }}
      classNames={{ root: 'semantic-root' }}
      styles={{ root: { maxWidth: 640 } }}
    >
      content
    </FormLayout>,
  );
  const root = container.querySelector('[data-tao-form-layout]') as HTMLElement;
  expect(root).toHaveClass('consumer', 'semantic-root');
  expect(root).toHaveStyle({ width: '320px', maxWidth: '640px' });
});
