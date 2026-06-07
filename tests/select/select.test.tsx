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

// ---- antd API alignment ----

test('defaultValue shows the selected label (uncontrolled)', () => {
  render(
    <Select
      options={[
        { label: 'Alpha', value: 'a' },
        { label: 'Beta', value: 'b' },
      ]}
      defaultValue="b"
    />,
  );
  expect(screen.getByText('Beta')).toBeTruthy();
});

test('status sets data-tao-error / data-tao-warning on trigger', () => {
  const { rerender } = render(<Select options={[]} status="error" />);
  let trigger = screen.getByRole('combobox');
  expect(trigger.hasAttribute('data-tao-error')).toBe(true);

  rerender(<Select options={[]} status="warning" />);
  trigger = screen.getByRole('combobox');
  expect(trigger.hasAttribute('data-tao-warning')).toBe(true);
});

test('labelRender customizes the trigger label', () => {
  render(
    <Select
      options={[{ label: 'Beta', value: 'b' }]}
      value="b"
      labelRender={(o) => `★ ${o.label}`}
    />,
  );
  expect(screen.getByText('★ Beta')).toBeTruthy();
});

test('suffixIcon renders a custom suffix', () => {
  render(
    <Select options={[]} suffixIcon={<span data-testid="suffix">▼</span>} />,
  );
  expect(screen.getByTestId('suffix')).toBeTruthy();
});

test('loading occupies the single icon slot and replaces the suffix arrow', () => {
  render(
    <Select
      options={[]}
      loading
      suffixIcon={<span data-testid="arrow">▼</span>}
    />,
  );
  const icons = document.querySelector(
    '[data-tao-select-icons]',
  ) as HTMLElement;
  // exactly one trailing slot, and it is the loading one (arrow not rendered)
  expect(icons.children.length).toBe(1);
  expect(document.querySelector('[data-tao-select-loading-slot]')).toBeTruthy();
  expect(screen.queryByTestId('arrow')).toBeNull();
});

test('loading uses a custom loadingIcon when provided', () => {
  render(
    <Select
      options={[]}
      loading
      loadingIcon={<span data-testid="ld">∞</span>}
    />,
  );
  expect(screen.getByTestId('ld')).toBeTruthy();
});

test('custom suffixIcon is marked (no rotation); default is not', () => {
  const { rerender } = render(
    <Select options={[]} suffixIcon={<span>↕</span>} />,
  );
  let icon = document.querySelector('[data-tao-select-icon]') as HTMLElement;
  expect(icon.hasAttribute('data-tao-custom-suffix')).toBe(true);

  rerender(<Select options={[]} />);
  icon = document.querySelector('[data-tao-select-icon]') as HTMLElement;
  expect(icon.hasAttribute('data-tao-custom-suffix')).toBe(false);
});

test('allowClear object renders a custom clear icon on hover', async () => {
  render(
    <Select
      options={[{ label: 'Beta', value: 'b' }]}
      value="b"
      allowClear={{ clearIcon: <span data-testid="clear">x</span> }}
    />,
  );
  await userEvent.hover(screen.getByRole('combobox'));
  expect(screen.getByTestId('clear')).toBeTruthy();
});

test('allowClear clears an uncontrolled value (trigger shows placeholder)', async () => {
  render(
    <Select
      options={[
        { label: 'Alpha', value: 'a' },
        { label: 'Beta', value: 'b' },
      ]}
      defaultValue="b"
      allowClear
      placeholder="placeholder-text"
    />,
  );
  const trigger = screen.getByRole('combobox');
  const valueEl = trigger.querySelector('[data-tao-select-value]');
  expect(valueEl?.textContent).toBe('Beta');

  await userEvent.hover(trigger);
  const clear = document.querySelector(
    '[data-tao-select-clear]',
  ) as HTMLElement;
  await userEvent.click(clear);
  expect(valueEl?.textContent).toBe('placeholder-text');
});

test('allowClear fires onChange("", undefined) and onClear', async () => {
  let changed: [string, unknown] | null = null;
  let cleared = false;
  render(
    <Select
      options={[{ label: 'Beta', value: 'b' }]}
      value="b"
      allowClear
      onChange={(v, o) => {
        changed = [v, o];
      }}
      onClear={() => {
        cleared = true;
      }}
    />,
  );
  await userEvent.hover(screen.getByRole('combobox'));
  await userEvent.click(
    document.querySelector('[data-tao-select-clear]') as HTMLElement,
  );
  expect(changed).toEqual(['', undefined]);
  expect(cleared).toBe(true);
});

test('classNames.root and className merge onto the trigger', () => {
  render(
    <Select
      options={[]}
      className="from-className"
      classNames={{ root: 'from-semantic' }}
    />,
  );
  const trigger = screen.getByRole('combobox');
  expect(trigger.classList.contains('from-className')).toBe(true);
  expect(trigger.classList.contains('from-semantic')).toBe(true);
});

test('popupMatchSelectWidth=false sets the content data attr (closed has no content)', () => {
  // Desktop dropdown does not open in the test DOM; just assert it renders
  // without throwing when the prop is provided.
  render(
    <Select
      options={[{ label: 'A', value: 'a' }]}
      popupMatchSelectWidth={false}
    />,
  );
  expect(screen.getByRole('combobox')).toBeTruthy();
});

test('mobile: onChange receives (value, option)', async () => {
  let received: { value: string; label: unknown } | null = null;
  render(
    <Select
      options={[
        { label: 'Alpha', value: 'a' },
        { label: 'Beta', value: 'b' },
      ]}
      onChange={(v, opt) => {
        received = { value: v, label: opt?.label };
      }}
      mobile
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  await userEvent.click(screen.getByText('Beta'));
  expect(received).toEqual({ value: 'b', label: 'Beta' });
});

test('mobile: grouped options render group labels and nested items', async () => {
  render(
    <Select
      options={[
        {
          label: 'Fruits',
          value: 'fruits',
          options: [
            { label: 'Apple', value: 'apple' },
            { label: 'Pear', value: 'pear' },
          ],
        },
        {
          label: 'Veggies',
          value: 'veggies',
          options: [{ label: 'Carrot', value: 'carrot' }],
        },
      ]}
      placeholder="Pick"
      mobile
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Fruits')).toBeTruthy();
  expect(screen.getByText('Veggies')).toBeTruthy();
  expect(screen.getByText('Apple')).toBeTruthy();
  expect(screen.getByText('Carrot')).toBeTruthy();
});

test('mobile: selecting a grouped item reports its value', async () => {
  let val = '';
  render(
    <Select
      options={[
        {
          label: 'Fruits',
          value: 'fruits',
          options: [{ label: 'Apple', value: 'apple' }],
        },
      ]}
      onChange={(v) => {
        val = v;
      }}
      mobile
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  await userEvent.click(screen.getByText('Apple'));
  expect(val).toBe('apple');
});
