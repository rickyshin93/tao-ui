import { readFileSync } from 'node:fs';
import { expect, rstest, test } from '@rstest/core';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Radio, RadioGroup } from '../../src/components/radio/radio';
import { TaoProvider } from '../../src/provider/tao-provider';

test('required radio groups participate in native form validation', async () => {
  const { container } = render(
    <form>
      <RadioGroup name="required-choice" aria-required options={['A', 'B']} />
    </form>,
  );
  const form = container.querySelector('form')!;
  expect(form.checkValidity()).toBe(false);
  await userEvent.click(screen.getByRole('radio', { name: 'B' }));
  expect(form.checkValidity()).toBe(true);
});

// ---- Radio ----

test('renders label text', () => {
  render(<Radio value="a">Option A</Radio>);
  expect(screen.getByText('Option A')).toBeTruthy();
});

test('renders as role=radio', () => {
  render(<Radio value="a">A</Radio>);
  expect(screen.getByRole('radio')).toBeTruthy();
});

test('radio input stays scoped to its control box', () => {
  const { container } = render(<Radio value="a">A</Radio>);
  const control = container.querySelector(
    '[data-tao-radio-control]',
  ) as HTMLSpanElement | null;
  const input = screen.getByRole('radio');
  expect(control).toBeTruthy();
  expect(control?.contains(input)).toBe(true);
});

test('checked prop controls state', () => {
  render(
    <Radio value="a" checked onChange={() => {}}>
      A
    </Radio>,
  );
  expect(screen.getByRole('radio')).toBeChecked();
});

test('click triggers onChange', async () => {
  let called = false;
  render(
    <Radio
      value="a"
      onChange={() => {
        called = true;
      }}
    >
      A
    </Radio>,
  );
  await userEvent.click(screen.getByRole('radio'));
  expect(called).toBe(true);
});

test('disabled prevents onChange', async () => {
  let called = false;
  render(
    <Radio
      value="a"
      onChange={() => {
        called = true;
      }}
      disabled
    >
      A
    </Radio>,
  );
  await userEvent.click(screen.getByRole('radio'));
  expect(called).toBe(false);
});

test('inherits disabled from TaoProvider', () => {
  render(
    <TaoProvider disabled>
      <Radio value="a">A</Radio>
    </TaoProvider>,
  );
  expect(screen.getByRole('radio')).toBeDisabled();
});

// ---- RadioGroup ----

test('RadioGroup renders options', () => {
  render(
    <RadioGroup
      options={[
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
      ]}
    />,
  );
  expect(screen.getByText('Apple')).toBeTruthy();
  expect(screen.getByText('Banana')).toBeTruthy();
});

test('RadioGroup value controls selected', () => {
  render(
    <RadioGroup
      options={[
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
      ]}
      value="banana"
    />,
  );
  const radios = screen.getAllByRole('radio');
  expect(radios[0]).not.toBeChecked();
  expect(radios[1]).toBeChecked();
});

test('RadioGroup onChange returns new value', async () => {
  let val = '';
  render(
    <RadioGroup
      options={[
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
      ]}
      value={val}
      onChange={(v) => {
        val = v;
      }}
    />,
  );
  await userEvent.click(screen.getAllByRole('radio')[1]);
  expect(val).toBe('banana');
});

test('RadioGroup string options', () => {
  render(<RadioGroup options={['A', 'B', 'C']} />);
  expect(screen.getByText('A')).toBeTruthy();
  expect(screen.getByText('B')).toBeTruthy();
  expect(screen.getByText('C')).toBeTruthy();
});

test('RadioGroup preserves default selection and updates native form data', async () => {
  const changes: string[] = [];
  const { container, rerender } = render(
    <form>
      <RadioGroup
        name="plan"
        options={['Free', 'Pro']}
        defaultValue="Free"
        onChange={(value) => changes.push(value)}
      />
    </form>,
  );
  expect(screen.getByRole('radio', { name: 'Free' })).toBeChecked();
  await userEvent.click(screen.getByText('Pro'));
  expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
  expect(screen.getByRole('radio', { name: 'Free' })).not.toBeChecked();
  expect(new FormData(container.querySelector('form')!).get('plan')).toBe(
    'Pro',
  );
  expect(changes).toEqual(['Pro']);
  rerender(
    <form>
      <RadioGroup name="plan" options={['Free', 'Pro']} defaultValue="Free" />
    </form>,
  );
  expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
});

test('native form reset restores an uncontrolled RadioGroup default', async () => {
  const onChange = rstest.fn();
  const tree = (label: string) => (
    <form>
      <RadioGroup
        aria-label={label}
        name="plan"
        options={['Free', 'Pro']}
        defaultValue="Free"
        onChange={onChange}
      />
    </form>
  );
  const { container, rerender } = render(tree('Plan'));
  const form = container.querySelector('form')!;
  await userEvent.click(screen.getByRole('radio', { name: 'Pro' }));
  expect(new FormData(form).get('plan')).toBe('Pro');
  await act(async () => form.reset());
  rerender(tree('Current plan'));
  expect(screen.getByRole('radio', { name: 'Free' })).toBeChecked();
  expect(new FormData(form).get('plan')).toBe('Free');
  expect(onChange).toHaveBeenCalledExactlyOnceWith('Pro');
});

test('native form reset leaves a controlled RadioGroup on its current value', () => {
  const tree = (value: string) => (
    <form>
      <RadioGroup options={['Free', 'Pro']} value={value} />
    </form>
  );
  const { container, rerender } = render(tree('Free'));
  rerender(tree('Pro'));
  act(() => container.querySelector('form')!.reset());
  expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
});

test('canceling a grouped radio change keeps the selected value', async () => {
  const onChange = rstest.fn();
  render(
    <RadioGroup defaultValue="a" onChange={onChange}>
      <Radio value="a">Option A</Radio>
      <Radio value="b" onChange={(event) => event.preventDefault()}>
        Option B
      </Radio>
    </RadioGroup>,
  );
  await userEvent.click(screen.getByRole('radio', { name: 'Option B' }));
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole('radio', { name: 'Option A' })).toBeChecked();
});

test('a grouped radio reports its native event as well as the selected value', async () => {
  const onChange = rstest.fn();
  const onGroupChange = rstest.fn();
  render(
    <RadioGroup onChange={onGroupChange}>
      <Radio value="plan" onChange={onChange}>
        Plan
      </Radio>
    </RadioGroup>,
  );
  await userEvent.click(screen.getByRole('radio', { name: 'Plan' }));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onGroupChange).toHaveBeenCalledExactlyOnceWith('plan');
});

test('a valueless radio does not become a selected member of an empty group', () => {
  const { container } = render(
    <form>
      <RadioGroup name="plan">
        <Radio>No group value</Radio>
        <Radio value="free">Free</Radio>
      </RadioGroup>
    </form>,
  );
  expect(
    screen.getByRole('radio', { name: 'No group value' }),
  ).not.toBeChecked();
  expect(new FormData(container.querySelector('form')!).has('plan')).toBe(
    false,
  );
});

test('RadioGroup without a default value supports children and disabled options', async () => {
  render(
    <RadioGroup>
      <Radio value="a">A</Radio>
      <Radio value="b">B</Radio>
      <Radio value="c" disabled>
        C
      </Radio>
    </RadioGroup>,
  );
  expect(
    screen
      .getAllByRole('radio')
      .every((radio) => !(radio as HTMLInputElement).checked),
  ).toBe(true);
  await userEvent.click(screen.getByText('A'));
  expect(screen.getByRole('radio', { name: 'A' })).toBeChecked();
  await userEvent.click(screen.getByText('B'));
  expect(screen.getByRole('radio', { name: 'A' })).not.toBeChecked();
  expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
  await userEvent.click(screen.getByText('C'));
  expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
  expect(screen.getByRole('radio', { name: 'C' })).not.toBeChecked();
});

test('RadioGroup controlled value only changes when its owner updates it', async () => {
  const changes: string[] = [];
  const { rerender } = render(
    <RadioGroup
      options={['A', 'B']}
      value="A"
      defaultValue="B"
      onChange={(value) => changes.push(value)}
    />,
  );
  await userEvent.click(screen.getByText('B'));
  expect(changes).toEqual(['B']);
  expect(screen.getByRole('radio', { name: 'A' })).toBeChecked();
  expect(screen.getByRole('radio', { name: 'B' })).not.toBeChecked();
  rerender(<RadioGroup options={['A', 'B']} value="B" />);
  expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
});

test('RadioGroup direction sets data-tao-direction', () => {
  const { container } = render(
    <RadioGroup options={['A']} direction="vertical" />,
  );
  const group = container.querySelector(
    '[data-tao-radio-group]',
  )! as HTMLElement;
  expect(group.dataset.taoDirection).toBe('vertical');
});

test('RadioGroup disabled disables all radios', () => {
  render(
    <RadioGroup
      options={[
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ]}
      disabled
    />,
  );
  for (const radio of screen.getAllByRole('radio')) {
    expect(radio).toBeDisabled();
  }
});

test('radio indicator styling follows the native checked state', () => {
  const css = readFileSync('src/components/radio/radio.css', 'utf8');
  expect(css).toMatch(
    /\[data-tao-radio-input\]:checked\s*\+\s*\[data-tao-radio\]\s*\{/,
  );
  expect(css).toMatch(
    /\[data-tao-radio-input\]:checked\s*\+\s*\[data-tao-radio\]::after\s*\{/,
  );
});

test('uncontrolled radios preserve default selection and native same-name mutual exclusion', async () => {
  render(
    <>
      <Radio name="native-group" defaultChecked>
        Alpha
      </Radio>
      <Radio name="native-group">Beta</Radio>
    </>,
  );
  const alpha = screen.getByRole('radio', { name: 'Alpha' });
  const beta = screen.getByRole('radio', { name: 'Beta' });
  expect(alpha).toBeChecked();
  expect(beta).not.toBeChecked();
  await userEvent.click(beta);
  expect(alpha).not.toBeChecked();
  expect(beta).toBeChecked();
});

test('RadioGroup size overrides its provider and applies to options and children', () => {
  render(
    <TaoProvider size="large">
      <RadioGroup size="small" options={['Small']} />
      <RadioGroup size="medium">
        <Radio value="medium">Medium</Radio>
      </RadioGroup>
      <RadioGroup options={['Large']} />
    </TaoProvider>,
  );
  for (const [name, size] of [
    ['Small', 'small'],
    ['Medium', 'medium'],
    ['Large', 'large'],
  ]) {
    const label = screen.getByRole('radio', { name }).closest('label');
    expect(label).toHaveAttribute('data-tao-size', size);
  }
});

test('RadioGroup native reset preserves a selection matching an updated default', async () => {
  const tree = (defaultValue: string) => (
    <form>
      <RadioGroup
        name="radio-reset"
        options={['A', 'B']}
        defaultValue={defaultValue}
      />
    </form>
  );
  const view = render(tree('A'));
  await userEvent.click(screen.getByRole('radio', { name: 'B' }));
  view.rerender(tree('B'));
  await act(async () => view.container.querySelector('form')!.reset());
  expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
  expect(screen.getByRole('radio', { name: 'A' })).not.toBeChecked();
});
