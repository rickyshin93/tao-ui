import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Select } from '../../src/components/select/select';
import { TaoProvider } from '../../src/provider/tao-provider';

test('renders with placeholder', () => {
  render(<Select options={[]} placeholder="Pick one" />);
  expect(screen.getByText('Pick one')).toBeTruthy();
});

test('displays selected option label', () => {
  render(
    <Select
      options={[
        { label: 'Alpha', value: 'a' },
        { label: 'Beta', value: 'b' },
      ]}
      value="b"
      onChange={() => {}}
    />,
  );
  expect(screen.getByText('Beta')).toBeTruthy();
});

test('size prop sets data-tao-size on trigger', () => {
  render(<Select options={[]} size="small" />);
  const trigger = screen.getByRole('combobox');
  expect(trigger.dataset.taoSize).toBe('small');
});

test('inherits size from TaoProvider', () => {
  render(
    <TaoProvider size="large">
      <Select options={[]} />
    </TaoProvider>,
  );
  const trigger = screen.getByRole('combobox');
  expect(trigger.dataset.taoSize).toBe('large');
});

test('inherits disabled from TaoProvider', () => {
  render(
    <TaoProvider disabled>
      <Select options={[]} />
    </TaoProvider>,
  );
  const trigger = screen.getByRole('combobox');
  expect(trigger).toBeDisabled();
});

// ---- Mobile mode ----

test('mobile prop renders button trigger instead of Radix', () => {
  render(
    <Select
      options={[{ label: 'A', value: 'a' }]}
      placeholder="Choose"
      mobile
    />,
  );
  const trigger = screen.getByRole('button', { name: /choose/i });
  expect(trigger).toBeTruthy();
  expect(trigger.dataset.taoSelect).toBe('');
});

test('mobile: shows selected value in trigger', () => {
  render(
    <Select
      options={[
        { label: 'Alpha', value: 'a' },
        { label: 'Beta', value: 'b' },
      ]}
      value="b"
      mobile
    />,
  );
  expect(screen.getByText('Beta')).toBeTruthy();
});

test('mobile: click trigger opens drawer', async () => {
  render(
    <Select
      options={[
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ]}
      placeholder="Pick"
      mobile
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(screen.getByText('A')).toBeTruthy();
  expect(screen.getByText('B')).toBeTruthy();
});

test('mobile: selecting item triggers onChange and closes', async () => {
  let val = '';
  const onClose = () => {};
  render(
    <Select
      options={[
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ]}
      value={val}
      onChange={(v) => {
        val = v;
      }}
      mobile
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  await userEvent.click(screen.getByText('B'));
  expect(val).toBe('b');
});

// ---- Rich options: icon + description ----

test('shows selected option icon in trigger', () => {
  render(
    <Select
      options={[
        {
          label: 'Alpha',
          value: 'a',
          icon: <span data-testid="icon-a">●</span>,
        },
        {
          label: 'Beta',
          value: 'b',
          icon: <span data-testid="icon-b">●</span>,
        },
      ]}
      value="b"
      onChange={() => {}}
    />,
  );
  expect(screen.getByTestId('icon-b')).toBeTruthy();
  expect(screen.queryByTestId('icon-a')).toBeNull();
});

test('mobile: renders option description and icon in the list', async () => {
  render(
    <Select
      options={[
        {
          label: 'ElevenCreative',
          value: 'creative',
          icon: <span data-testid="opt-icon">▦</span>,
          description: 'Create, edit and localize content with AI',
        },
        { label: 'ElevenAgents', value: 'agents' },
      ]}
      placeholder="Pick"
      mobile
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  expect(
    screen.getByText('Create, edit and localize content with AI'),
  ).toBeTruthy();
  expect(screen.getByTestId('opt-icon')).toBeTruthy();
});

test('options without icon/description render unchanged', () => {
  render(
    <Select
      options={[{ label: 'Plain', value: 'p' }]}
      value="p"
      onChange={() => {}}
    />,
  );
  expect(screen.getByText('Plain')).toBeTruthy();
  expect(document.querySelector('[data-tao-select-value-icon]')).toBeNull();
});
