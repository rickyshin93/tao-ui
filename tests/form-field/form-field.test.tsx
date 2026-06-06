import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { FormField } from '../../src/components/form-field/form-field';

test('renders label text', () => {
  render(<FormField label="Email"><input /></FormField>);
  expect(screen.getByText('Email')).toBeTruthy();
});

test('label htmlFor links to child input via id', () => {
  render(<FormField label="Email" htmlFor="email"><input id="email" /></FormField>);
  const label = screen.getByText('Email');
  expect(label.getAttribute('for')).toBe('email');
});

test('required shows asterisk', () => {
  render(<FormField label="Name" required><input /></FormField>);
  expect(screen.getByText('*')).toBeTruthy();
});

test('error string renders error message', () => {
  render(<FormField label="Name" error="Too short"><input /></FormField>);
  expect(screen.getByText('Too short')).toBeTruthy();
});

test('description renders when provided', () => {
  render(<FormField label="Name" description="Your full name"><input /></FormField>);
  expect(screen.getByText('Your full name')).toBeTruthy();
});
