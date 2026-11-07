import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { FormField } from '../../src/components/form-field/form-field';
import { Form } from '../../src/components/form/form';
import { Select } from '../../src/components/select/select';

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

test.each([
  { name: 'desktop', mobile: false, showSearch: false },
  { name: 'searchable', mobile: false, showSearch: true },
  { name: 'mobile', mobile: true, showSearch: false },
])(
  'links label and validation to the $name Select control',
  ({ mobile, showSearch }) => {
    const field = (error?: string) => (
      <>
        <p id="language-hint">Existing language hint</p>
        <FormField
          label="Language"
          required
          error={error}
          description="Choose your language"
        >
          <Select
            mobile={mobile}
            showSearch={showSearch}
            defaultValue="zh"
            options={[{ label: 'Chinese', value: 'zh' }]}
            aria-describedby="language-hint"
          />
        </FormField>
      </>
    );
    const { rerender } = render(field('Unsupported language'));
    const control = screen.getByRole(mobile ? 'button' : 'combobox');
    expect(control).toHaveAccessibleName('Language');
    expect(control).toHaveAccessibleDescription(
      'Existing language hint Unsupported language',
    );
    expect(control).toHaveAccessibleErrorMessage('Unsupported language');
    expect(control).toHaveAttribute('aria-required', 'true');

    rerender(field());
    expect(control).toHaveAccessibleName('Language');
    expect(control).toHaveAccessibleDescription(
      'Existing language hint Choose your language',
    );
    expect(control).not.toHaveAttribute('aria-invalid');
    expect(control).not.toHaveAttribute('aria-errormessage');
  },
);

test('preserves native control errors unless the field supplies its own error', () => {
  const field = (error?: string) => (
    <>
      <p id="external-error">Email is already in use</p>
      <p id="external-hint">Use your work email</p>
      <FormField label="Email" error={error} description="Required for sign in">
        <input
          aria-invalid="true"
          aria-errormessage="external-error"
          aria-describedby="external-hint"
        />
      </FormField>
    </>
  );
  const { rerender } = render(field());
  const input = screen.getByRole('textbox', { name: 'Email' });
  expect(input).toHaveAccessibleErrorMessage('Email is already in use');
  expect(input).toHaveAccessibleDescription(
    'Use your work email Required for sign in',
  );

  rerender(field('Invalid email format'));
  expect(input).toHaveAccessibleErrorMessage('Invalid email format');
  expect(input).toHaveAccessibleDescription(
    'Use your work email Invalid email format',
  );
  rerender(field());
  expect(input).toHaveAccessibleErrorMessage('Email is already in use');
});

test('keeps explicit accessible names on native controls', () => {
  render(
    <>
      <p id="custom-label">Custom field name</p>
      <FormField label="Visible label">
        <input aria-label="Custom input name" />
      </FormField>
      <FormField label="Another label">
        <input aria-labelledby="custom-label" />
      </FormField>
    </>,
  );
  expect(
    screen.getByRole('textbox', { name: 'Custom input name' }),
  ).toBeTruthy();
  expect(
    screen.getByRole('textbox', { name: 'Custom field name' }),
  ).toBeTruthy();
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

test('conditional Form.Item labels do not create an empty labelling element', () => {
  const { container } = render(
    <Form.Item label={false} required>
      <input placeholder="Email" />
    </Form.Item>,
  );
  expect(container.querySelector('[data-tao-form-label]')).toBeNull();
  expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-labelledby');
});

test('numeric zero is rendered and connected as a Form.Item error', () => {
  render(
    <Form.Item label="Code" validateStatus="error" help={0}>
      <input />
    </Form.Item>,
  );
  expect(screen.getByRole('alert')).toHaveTextContent('0');
  expect(
    screen.getByRole('textbox', { name: 'Code' }),
  ).toHaveAccessibleDescription('0');
});
