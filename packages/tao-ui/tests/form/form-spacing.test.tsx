import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, expect, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Form } from '../../src/components/form';
import { FormField } from '../../src/components/form-field/form-field';
import { FormSection } from '../../src/components/form-section/form-section';
import { Stack } from '../../src/layouts/stack/stack';

const stylesheet = document.createElement('style');
beforeAll(() => {
  stylesheet.textContent = [
    'src/components/form/form.css',
    'src/components/form-field/form.css',
    'src/layouts/stack/layout.css',
  ]
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
  document.head.append(stylesheet);
  document.documentElement.style.setProperty('--tao-padding-md', '20px');
  document.documentElement.style.setProperty('--tao-size-unit', '4px');
  document.documentElement.style.setProperty('--tao-padding', '16px');
});
afterAll(() => {
  stylesheet.remove();
  document.documentElement.style.removeProperty('--tao-padding-md');
  document.documentElement.style.removeProperty('--tao-size-unit');
  document.documentElement.style.removeProperty('--tao-padding');
});

function fieldMargin(label: string | RegExp) {
  const field = screen.getByLabelText(label).closest('[data-tao-form-field]');
  if (!field) throw new Error(`Missing field: ${label}`);
  return getComputedStyle(field).marginBlockEnd;
}

test('validation feedback uses compact spacing before and after validation', async () => {
  render(
    <Form>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, message: 'Required' }]}
      >
        <input />
      </Form.Item>
      <button type="submit">Submit</button>
    </Form>,
  );
  const item = screen.getByLabelText(/^Email/).closest('[data-tao-form-item]')!;
  const slot = item.querySelector('[data-tao-form-message]');
  expect(slot).not.toBeNull();
  expect(slot?.textContent).toBe('');
  expect(fieldMargin(/^Email/)).toBe('4px');
  fireEvent.submit(screen.getByRole('button').closest('form')!);
  expect(await screen.findByText('Required')).toBeTruthy();
  expect(item.querySelector('[data-tao-form-message]')).toBe(slot);
  expect(fieldMargin(/^Email/)).toBe('4px');
});

test('fields without validation or messages do not reserve feedback space', () => {
  const { container } = render(
    <Form>
      <Form.Item name="note" label="Note" rules={[]}>
        <input />
      </Form.Item>
      <Form.Item name="remember" valuePropName="checked">
        <input type="checkbox" aria-label="Remember" />
      </Form.Item>
    </Form>,
  );
  expect(container.querySelector('[data-tao-form-message]')).toBeNull();
  expect(fieldMargin('Note')).toBe('20px');
  expect(fieldMargin('Remember')).toBe('20px');
});

test('manual feedback keeps its slot while empty and honors custom spacing', () => {
  const field = (help: string) => (
    <Form>
      <Form.Item
        label="Manual"
        help={help}
        validateStatus="error"
        style={{ '--tao-form-field-item-gap': '12px' } as React.CSSProperties}
      >
        <input />
      </Form.Item>
    </Form>
  );
  const { container, rerender } = render(field(''));
  const slot = container.querySelector('[data-tao-form-message]');
  expect(slot).not.toBeNull();
  expect(fieldMargin('Manual')).toBe('12px');
  rerender(field('Server error'));
  expect(screen.getByRole('alert').textContent).toBe('Server error');
  expect(container.querySelector('[data-tao-form-message]')).toBe(slot);
  expect(fieldMargin('Manual')).toBe('12px');
});

test('server errors can create and clear feedback without validation rules', async () => {
  function Demo() {
    const [form] = Form.useForm();
    return (
      <Form form={form}>
        <Form.Item name="account" label="Account">
          <input />
        </Form.Item>
        <button
          type="button"
          onClick={() =>
            form.setFields([
              { name: 'account', errors: ['Account unavailable'] },
            ])
          }
        >
          Show error
        </button>
        <button
          type="button"
          onClick={() => form.setFields([{ name: 'account', errors: [] }])}
        >
          Clear error
        </button>
      </Form>
    );
  }
  const { container } = render(<Demo />);
  expect(container.querySelector('[data-tao-form-message]')).toBeNull();
  fireEvent.click(screen.getByText('Show error'));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Account unavailable',
  );
  expect(fieldMargin('Account')).toBe('4px');
  fireEvent.click(screen.getByText('Clear error'));
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  expect(container.querySelector('[data-tao-form-message]')).toBeNull();
  expect(fieldMargin('Account')).toBe('20px');
});

test.each(['vertical', 'horizontal'] as const)(
  '%s Form separates fields and the submit action',
  (layout) => {
    render(
      <Form layout={layout}>
        <Form.Item label="First">
          <input />
        </Form.Item>
        <Form.Item label="Second">
          <input />
        </Form.Item>
        <button type="submit">Save</button>
      </Form>,
    );
    expect(fieldMargin('First')).toBe('20px');
    expect(fieldMargin('Second')).toBe('20px');
  },
);

test('Stack and FormSection keep ownership of their field spacing', () => {
  const { container } = render(
    <Form>
      <Stack gap="md">
        <Form.Item label="Stack first" help="Stack hint">
          <input />
        </Form.Item>
        <Form.Item label="Stack second">
          <input />
        </Form.Item>
      </Stack>
      <FormSection>
        <Form.Item label="Section first" help="Section hint">
          <input />
        </Form.Item>
        <Form.Item label="Section second">
          <input />
        </Form.Item>
      </FormSection>
      <FormField label="Standalone">
        <input />
      </FormField>
    </Form>,
  );
  for (const label of [
    'Stack first',
    'Stack second',
    'Section first',
    'Section second',
    'Standalone',
  ]) {
    expect(Number.parseFloat(fieldMargin(label)) || 0).toBe(0);
  }
  expect(
    getComputedStyle(container.querySelector('[data-tao-stack]')!).gap,
  ).toBe('16px');
  expect(
    getComputedStyle(container.querySelector('[data-tao-form-section-body]')!)
      .gap,
  ).toBe('20px');
});

test('item spacing respects theme and explicit item overrides', () => {
  render(
    <div style={{ '--tao-form-field-item-gap': '28px' } as React.CSSProperties}>
      <Form>
        <Form.Item label="Themed">
          <input />
        </Form.Item>
        <Form.Item label="Custom" style={{ marginBlockEnd: 8 }}>
          <input />
        </Form.Item>
      </Form>
    </div>,
  );
  expect(fieldMargin('Themed')).toBe('28px');
  expect(fieldMargin('Custom')).toBe('8px');
});

test('noStyle adds neither a field shell nor spacing to the control', () => {
  const { container } = render(
    <Form>
      <Form.Item name="raw" noStyle>
        <input aria-label="Raw" />
      </Form.Item>
    </Form>,
  );
  expect(container.querySelector('[data-tao-form-field]')).toBeNull();
  expect(
    Number.parseFloat(
      getComputedStyle(screen.getByLabelText('Raw')).marginBlockEnd,
    ) || 0,
  ).toBe(0);
});
