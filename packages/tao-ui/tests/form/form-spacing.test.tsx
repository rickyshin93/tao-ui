import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
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
  document.documentElement.style.setProperty('--tao-padding', '16px');
});
afterAll(() => {
  stylesheet.remove();
  document.documentElement.style.removeProperty('--tao-padding-md');
  document.documentElement.style.removeProperty('--tao-padding');
});

function fieldMargin(label: string) {
  const field = screen.getByLabelText(label).closest('[data-tao-form-field]');
  if (!field) throw new Error(`Missing field: ${label}`);
  return getComputedStyle(field).marginBlockEnd;
}

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
        <Form.Item label="Stack first">
          <input />
        </Form.Item>
        <Form.Item label="Stack second">
          <input />
        </Form.Item>
      </Stack>
      <FormSection>
        <Form.Item label="Section first">
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
