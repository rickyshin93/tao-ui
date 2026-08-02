import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { FormField } from '../../src/components/form-field/form-field';

test('renders label text', () => {
  render(
    <FormField label="Email">
      <input />
    </FormField>,
  );
  expect(screen.getByText('Email')).toBeTruthy();
});

test('label htmlFor links to child input via id', () => {
  render(
    <FormField label="Email" htmlFor="email">
      <input id="email" />
    </FormField>,
  );
  const label = screen.getByText('Email');
  expect(label.getAttribute('for')).toBe('email');
});

test('automatically links label and help text to a single control', () => {
  const { rerender } = render(
    <FormField label="Email" description="Work address">
      <input />
    </FormField>,
  );

  const input = screen.getByRole('textbox');
  expect(screen.getByLabelText('Email')).toBe(input);
  expect(input.getAttribute('aria-describedby')).toBe(
    screen.getByText('Work address').id,
  );

  rerender(
    <FormField label="Email" error="Invalid address">
      <input />
    </FormField>,
  );
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.getAttribute('aria-errormessage')).toBe(
    screen.getByText('Invalid address').id,
  );
});

test('required shows asterisk', () => {
  render(
    <FormField label="Name" required>
      <input />
    </FormField>,
  );
  expect(screen.getByText('*')).toBeTruthy();
});

test('error string renders error message', () => {
  render(
    <FormField label="Name" error="Too short">
      <input />
    </FormField>,
  );
  expect(screen.getByText('Too short')).toBeTruthy();
});

test('description renders when provided', () => {
  render(
    <FormField label="Name" description="Your full name">
      <input />
    </FormField>,
  );
  expect(screen.getByText('Your full name')).toBeTruthy();
});
