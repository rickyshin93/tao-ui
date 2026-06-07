import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import {
  Checkbox,
  CheckboxGroup,
} from '../../src/components/checkbox/checkbox';
import { TaoProvider } from '../../src/provider/tao-provider';

// ---- Checkbox ----

test('renders label text', () => {
  render(<Checkbox>Accept terms</Checkbox>);
  expect(screen.getByText('Accept terms')).toBeTruthy();
});

test('renders as role=checkbox', () => {
  render(<Checkbox>A</Checkbox>);
  expect(screen.getByRole('checkbox')).toBeTruthy();
});

test('checked prop controls checked state', () => {
  render(
    <Checkbox checked onChange={() => {}}>
      A
    </Checkbox>,
  );
  expect(screen.getByRole('checkbox')).toBeChecked();
});

test('click triggers onChange', async () => {
  let checked = false;
  render(
    <Checkbox
      checked={checked}
      onChange={() => {
        checked = true;
      }}
    >
      A
    </Checkbox>,
  );
  await userEvent.click(screen.getByRole('checkbox'));
  expect(checked).toBe(true);
});

test('disabled prevents onChange', async () => {
  let checked = false;
  render(
    <Checkbox
      checked={checked}
      onChange={() => {
        checked = true;
      }}
      disabled
    >
      A
    </Checkbox>,
  );
  await userEvent.click(screen.getByRole('checkbox'));
  expect(checked).toBe(false);
});

test('indeterminate sets aria-checked=mixed', () => {
  render(<Checkbox indeterminate>A</Checkbox>);
  expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe(
    'mixed',
  );
});

test('inherits disabled from TaoProvider', () => {
  render(
    <TaoProvider disabled>
      <Checkbox>A</Checkbox>
    </TaoProvider>,
  );
  expect(screen.getByRole('checkbox')).toBeDisabled();
});

// ---- CheckboxGroup ----

test('CheckboxGroup renders options', () => {
  render(
    <CheckboxGroup
      options={[
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
      ]}
    />,
  );
  expect(screen.getByText('Apple')).toBeTruthy();
  expect(screen.getByText('Banana')).toBeTruthy();
});

test('CheckboxGroup value controls checked items', () => {
  render(
    <CheckboxGroup
      options={[
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
      ]}
      value={['banana']}
    />,
  );
  const checkboxes = screen.getAllByRole('checkbox');
  expect(checkboxes[0]).not.toBeChecked();
  expect(checkboxes[1]).toBeChecked();
});

test('CheckboxGroup onChange returns updated values', async () => {
  let vals: string[] = [];
  render(
    <CheckboxGroup
      options={[
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
      ]}
      value={vals}
      onChange={(v) => {
        vals = v;
      }}
    />,
  );
  await userEvent.click(screen.getAllByRole('checkbox')[0]);
  expect(vals).toEqual(['apple']);
});

test('CheckboxGroup string options', () => {
  render(<CheckboxGroup options={['A', 'B', 'C']} />);
  expect(screen.getByText('A')).toBeTruthy();
  expect(screen.getByText('B')).toBeTruthy();
  expect(screen.getByText('C')).toBeTruthy();
});

test('CheckboxGroup direction sets data-tao-direction', () => {
  const { container } = render(
    <CheckboxGroup options={['A']} direction="vertical" />,
  );
  const group = container.querySelector(
    '[data-tao-checkbox-group]',
  )! as HTMLElement;
  expect(group.dataset.taoDirection).toBe('vertical');
});
