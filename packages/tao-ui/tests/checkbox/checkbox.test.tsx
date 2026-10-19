import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, expect, rstest, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import {
  Checkbox,
  CheckboxGroup,
} from '../../src/components/checkbox/checkbox';
import { TaoProvider } from '../../src/provider/tao-provider';

const checkboxStyle = document.createElement('style');
beforeAll(() => {
  checkboxStyle.textContent = readFileSync(
    'src/components/checkbox/checkbox.css',
    'utf8',
  );
  document.head.appendChild(checkboxStyle);
});
afterAll(() => checkboxStyle.remove());

// ---- Checkbox ----

test('renders label text', () => {
  render(<Checkbox>Accept terms</Checkbox>);
  expect(screen.getByText('Accept terms')).toBeTruthy();
});

test('renders as role=checkbox', () => {
  render(<Checkbox>A</Checkbox>);
  expect(screen.getByRole('checkbox')).toBeTruthy();
});

test('checkbox input stays scoped to its control box', () => {
  const { container } = render(<Checkbox>A</Checkbox>);
  const control = container.querySelector(
    '[data-tao-checkbox-control]',
  ) as HTMLSpanElement | null;
  const input = screen.getByRole('checkbox');
  expect(control).toBeTruthy();
  expect(control?.contains(input)).toBe(true);
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

test('defaultChecked displays the check icon', () => {
  const { container } = render(<Checkbox defaultChecked>Choice</Checkbox>);
  expect(screen.getByRole('checkbox')).toBeChecked();
  expect(container.querySelector('[data-tao-checkbox-icon]')).toBeVisible();
});

test('uncontrolled checkbox keeps its icon in sync through clicks and native reset', async () => {
  const { container } = render(
    <form>
      <Checkbox defaultChecked>Choice</Checkbox>
      <button type="reset">Reset</button>
    </form>,
  );
  const checkbox = screen.getByRole('checkbox');
  await userEvent.click(checkbox);
  expect(checkbox).not.toBeChecked();
  expect(container.querySelector('[data-tao-checkbox-icon]')).not.toBeVisible();
  await userEvent.click(checkbox);
  expect(checkbox).toBeChecked();
  expect(container.querySelector('[data-tao-checkbox-icon]')).toBeVisible();
  await userEvent.click(checkbox);
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(checkbox).toBeChecked();
  expect(container.querySelector('[data-tao-checkbox-icon]')).toBeVisible();
});

test('controlled checkbox icon follows the accepted value', async () => {
  const onChange = rstest.fn();
  const { container, rerender } = render(
    <Checkbox checked={false} onChange={onChange}>
      Choice
    </Checkbox>,
  );
  await userEvent.click(screen.getByRole('checkbox'));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('checkbox')).not.toBeChecked();
  expect(container.querySelector('[data-tao-checkbox-icon]')).not.toBeVisible();
  rerender(
    <Checkbox checked onChange={onChange}>
      Choice
    </Checkbox>,
  );
  expect(container.querySelector('[data-tao-checkbox-icon]')).toBeVisible();
});

test('disabled uncontrolled checkbox preserves its checked icon', async () => {
  const onChange = rstest.fn();
  const { container } = render(
    <Checkbox defaultChecked disabled onChange={onChange}>
      Choice
    </Checkbox>,
  );
  await userEvent.click(screen.getByRole('checkbox'));
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole('checkbox')).toBeChecked();
  expect(container.querySelector('[data-tao-checkbox-icon]')).toBeVisible();
});

test('indeterminate icon remains visible independently of checked state', async () => {
  const { container, rerender } = render(
    <Checkbox indeterminate>Choice</Checkbox>,
  );
  expect(container.querySelector('[data-tao-checkbox-icon]')).toBeVisible();
  await userEvent.click(screen.getByRole('checkbox'));
  expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
  expect(container.querySelector('[data-tao-checkbox-icon]')).toBeVisible();
  rerender(<Checkbox>Choice</Checkbox>);
  expect(screen.getByRole('checkbox')).toBeChecked();
  expect(container.querySelector('[data-tao-checkbox-icon]')).toBeVisible();
});

test('uncontrolled CheckboxGroup seeds defaultValue and preserves selection order without duplicates', async () => {
  const onChange = rstest.fn();
  const { rerender } = render(
    <CheckboxGroup
      options={['A', 'B', 'C']}
      defaultValue={['B', 'B']}
      onChange={onChange}
    />,
  );
  expect(screen.getByRole('checkbox', { name: 'B' })).toBeChecked();
  await userEvent.click(screen.getByRole('checkbox', { name: 'A' }));
  expect(onChange).toHaveBeenLastCalledWith(['B', 'A']);
  await userEvent.click(screen.getByRole('checkbox', { name: 'C' }));
  expect(onChange).toHaveBeenLastCalledWith(['B', 'A', 'C']);
  await userEvent.click(screen.getByRole('checkbox', { name: 'B' }));
  expect(onChange).toHaveBeenLastCalledWith(['A', 'C']);
  rerender(
    <CheckboxGroup
      options={['A', 'B', 'C']}
      defaultValue={['B']}
      onChange={onChange}
    />,
  );
  expect(screen.getByRole('checkbox', { name: 'A' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'C' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'B' })).not.toBeChecked();
});

test('uncontrolled CheckboxGroup without a defaultValue retains clicked items', async () => {
  const onChange = rstest.fn();
  render(<CheckboxGroup options={['A', 'B']} onChange={onChange} />);
  await userEvent.click(screen.getByRole('checkbox', { name: 'A' }));
  await userEvent.click(screen.getByRole('checkbox', { name: 'B' }));
  expect(onChange).toHaveBeenLastCalledWith(['A', 'B']);
  expect(screen.getByRole('checkbox', { name: 'A' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'B' })).toBeChecked();
});

test('controlled CheckboxGroup rejects local selection and treats explicit undefined as empty', async () => {
  const onChange = rstest.fn();
  const { rerender } = render(
    <CheckboxGroup
      options={['A', 'B']}
      value={['B']}
      defaultValue={['A']}
      onChange={onChange}
    />,
  );
  await userEvent.click(screen.getByRole('checkbox', { name: 'A' }));
  expect(onChange).toHaveBeenLastCalledWith(['B', 'A']);
  expect(screen.getByRole('checkbox', { name: 'A' })).not.toBeChecked();
  rerender(
    <CheckboxGroup
      options={['A', 'B']}
      value={undefined}
      defaultValue={['A']}
      onChange={onChange}
    />,
  );
  expect(screen.getByRole('checkbox', { name: 'A' })).not.toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'B' })).not.toBeChecked();
});

test('disabled CheckboxGroup preserves defaults and does not emit changes', async () => {
  const onChange = rstest.fn();
  render(
    <CheckboxGroup
      options={['A', 'B']}
      defaultValue={['A']}
      disabled
      onChange={onChange}
    />,
  );
  await userEvent.click(screen.getByRole('checkbox', { name: 'A' }));
  await userEvent.click(screen.getByRole('checkbox', { name: 'B' }));
  expect(screen.getByRole('checkbox', { name: 'A' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'B' })).not.toBeChecked();
  expect(onChange).not.toHaveBeenCalled();
});

test('CheckboxGroup removal also deduplicates controlled values without changing order', async () => {
  const onChange = rstest.fn();
  render(
    <CheckboxGroup
      options={['A', 'B', 'C']}
      value={['B', 'A', 'B', 'C']}
      onChange={onChange}
    />,
  );
  await userEvent.click(screen.getByRole('checkbox', { name: 'C' }));
  expect(onChange).toHaveBeenLastCalledWith(['B', 'A']);
});
