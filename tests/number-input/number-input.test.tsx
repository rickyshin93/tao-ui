import { expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { NumberInput } from '../../src/number-input/number-input';

test('6.1 — renders single <input> inside <span> container', () => {
  const { container } = render(<NumberInput value="" />);
  const root = container.firstChild as HTMLElement;
  expect(root.tagName).toBe('SPAN');
  expect(root.querySelectorAll('input')).toHaveLength(1);
});

test('6.2 — prefix renders before input with data-tao-prefix and is NOT in input value', () => {
  const { container } = render(<NumberInput value="100" prefix="$" />);
  const root = container.firstChild as HTMLElement;
  const children = Array.from(root.children);
  expect(children[0].getAttribute('data-tao-prefix')).toBe('');
  expect(children[0].textContent).toBe('$');
  expect(children[1].tagName).toBe('INPUT');
  expect((children[1] as HTMLInputElement).value).toBe('100');
});

test('6.3 — suffix renders after input with data-tao-suffix', () => {
  const { container } = render(<NumberInput value="100" suffix="USD" />);
  const root = container.firstChild as HTMLElement;
  const children = Array.from(root.children);
  expect(children[0].tagName).toBe('INPUT');
  expect(children[1].getAttribute('data-tao-suffix')).toBe('');
  expect(children[1].textContent).toBe('USD');
});

test('6.4 — passes through native input attrs (id, name, placeholder, disabled, aria-label)', () => {
  const { container } = render(
    <NumberInput
      value=""
      id="amount"
      name="amount-field"
      placeholder="Enter amount"
      disabled
      aria-label="Amount"
    />,
  );
  const input = container.querySelector('input') as HTMLInputElement;
  expect(input.id).toBe('amount');
  expect(input.name).toBe('amount-field');
  expect(input.placeholder).toBe('Enter amount');
  expect(input.disabled).toBe(true);
  expect(input.getAttribute('aria-label')).toBe('Amount');
});

test('6.5 — containerClassName goes to container, className goes to input', () => {
  const { container } = render(
    <NumberInput value="" containerClassName="outer" className="inner" />,
  );
  const root = container.firstChild as HTMLElement;
  expect(root.className).toBe('outer');
  const input = container.querySelector('input') as HTMLInputElement;
  expect(input.className).toBe('inner');
});
