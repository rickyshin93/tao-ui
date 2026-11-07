import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { FormSection } from '../../src/components/form-section/form-section';

test('renders title and description', () => {
  render(
    <FormSection title="Personal" description="Your details">
      <div>child</div>
    </FormSection>,
  );
  expect(screen.getByText('Personal')).toBeTruthy();
  expect(screen.getByText('Your details')).toBeTruthy();
});

test('renders children', () => {
  render(
    <FormSection title="Info">
      <span data-testid="kid">hello</span>
    </FormSection>,
  );
  expect(screen.getByTestId('kid')).toBeTruthy();
});

test('a titled form section has the visible title as its accessible name', () => {
  render(
    <FormSection title="Contact details">
      <input />
    </FormSection>,
  );

  expect(
    screen.getByRole('region', { name: 'Contact details' }),
  ).toContainElement(screen.getByRole('textbox'));
});
