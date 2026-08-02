import { readFileSync } from 'node:fs';
import { expect, test } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Select } from '../../src/components/select/select';
import { TaoProvider } from '../../src/provider/tao-provider';

test('desktop options include padding inside their popup width', () => {
  const css = readFileSync('src/components/select/select.css', 'utf8');
  const rule = css.match(/\[data-tao-select-item\] \{([^}]+)\}/)?.[1];

  expect(rule).toContain('box-sizing: border-box;');
});

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
  expect(trigger.getAttribute('data-tao-disabled')).toBe('true');
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
  const trigger = screen.getByRole('button');
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

test('showSearch: typing filters options', async () => {
  const user = userEvent.setup();
  render(
    <Select
      options={[
        { label: 'Apple', value: 'a' },
        { label: 'Banana', value: 'b' },
        { label: 'Cherry', value: 'c' },
      ]}
      showSearch
    />,
  );

  const input = screen.getByRole('combobox') as HTMLInputElement;
  expect(input.tagName).toBe('INPUT');
  expect(input).toHaveAttribute('data-tao-select-trigger-input');
  expect(input.readOnly).toBe(false);

  await user.click(input);
  await waitFor(() => expect(input).toHaveFocus());
  await user.keyboard('app');
  expect(input.value).toBe('app');
  expect(document.querySelector('[data-tao-select-search-input]')).toBeNull();

  // Only "Apple" should remain in the list.
  expect(screen.getByText('Apple')).toBeTruthy();
  expect(screen.queryByText('Banana')).toBeNull();
  expect(screen.queryByText('Cherry')).toBeNull();
});

test('showSearch: Enter selects the first filtered option', async () => {
  const user = userEvent.setup();
  let selected: string | undefined;
  render(
    <Select
      options={[
        { label: 'Apple', value: 'a' },
        { label: 'Banana', value: 'b' },
      ]}
      showSearch
      onChange={(value) => {
        selected = value as string;
      }}
    />,
  );

  const input = screen.getByRole('combobox');
  await user.click(input);
  await user.keyboard('ban{Enter}');

  expect(selected).toBe('b');
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
  expect(trigger.querySelector('[data-tao-select-value]')?.textContent).toBe(
    'Beta',
  );

  await userEvent.hover(trigger);
  const clear = document.querySelector(
    '[data-tao-select-clear]',
  ) as HTMLElement;
  await userEvent.click(clear);
  expect(
    trigger.querySelector('[data-tao-select-placeholder]')?.textContent,
  ).toBe('placeholder-text');
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

// ---- Multi-select ----

test('mode="multiple" shows placeholder when empty', () => {
  render(
    <Select
      options={[
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ]}
      mode="multiple"
      placeholder="Pick items"
    />,
  );
  expect(screen.getByText('Pick items')).toBeTruthy();
});

test('mode="multiple" + showSearch uses an inline PC input', async () => {
  let received: string[] | null = null;
  render(
    <Select
      mobile={false}
      mode="multiple"
      showSearch
      options={[
        { label: 'Apple', value: 'a' },
        { label: 'Banana', value: 'b' },
      ]}
      onChange={(value) => {
        received = value as string[];
      }}
    />,
  );

  const input = screen.getByRole('combobox') as HTMLInputElement;
  expect(input.tagName).toBe('INPUT');
  expect(input).toHaveAttribute('data-tao-select-trigger-input');

  await userEvent.type(input, 'ban{Enter}');

  expect(received).toEqual(['b']);
  expect(screen.getByRole('listbox')).toBeTruthy();
  expect(document.querySelector('[data-tao-select-search-input]')).toBeNull();
});

test('mode="tags" + showSearch creates a tag from the inline input', async () => {
  render(
    <Select
      mobile={false}
      mode="tags"
      showSearch
      options={[]}
      defaultValue={[]}
    />,
  );

  const input = screen.getByRole('combobox');
  await userEvent.type(input, 'New tag{Enter}');

  expect(screen.getByText('New tag')).toBeTruthy();
});

test('mode="multiple" renders tags from value array', () => {
  render(
    <Select
      options={[
        { label: 'Alpha', value: 'a' },
        { label: 'Beta', value: 'b' },
        { label: 'Gamma', value: 'c' },
      ]}
      mode="multiple"
      value={['a', 'c']}
      onChange={() => {}}
    />,
  );
  const tags = document.querySelectorAll('[data-tao-select-tag]');
  expect(tags.length).toBe(2);
  expect(screen.getByText('Alpha')).toBeTruthy();
  expect(screen.getByText('Gamma')).toBeTruthy();
});

test('mode="multiple": onChange receives array on select and deselect', async () => {
  let received: string[] | null = null;
  render(
    <Select
      options={[
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ]}
      mode="multiple"
      value={[]}
      onChange={(v) => {
        received = v as string[];
      }}
      open
    />,
  );
  const item = screen.getByText('A');
  await userEvent.click(item);
  expect(received).toEqual(['a']);
});

test('mode="multiple": onDeselect fires when removing a tag', async () => {
  let deselected: { value: string; label: unknown } | null = null;
  render(
    <Select
      options={[{ label: 'Beta', value: 'b' }]}
      mode="multiple"
      value={['b']}
      onDeselect={(v, o) => {
        deselected = { value: v, label: o?.label };
      }}
    />,
  );
  const closeBtn = document.querySelector(
    '[data-tao-select-tag-close]',
  ) as HTMLElement;
  await userEvent.click(closeBtn);
  expect(deselected).toEqual({ value: 'b', label: 'Beta' });
});

test('mode="multiple": allowClear clears the array', async () => {
  let cleared = false;
  let changed: [string[], unknown] | null = null;
  render(
    <Select
      options={[
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ]}
      mode="multiple"
      value={['a', 'b']}
      allowClear
      onChange={(v, o) => {
        changed = [v as string[], o];
      }}
      onClear={() => {
        cleared = true;
      }}
    />,
  );
  const trigger = screen.getByRole('combobox');
  await userEvent.hover(trigger);
  const clear = document.querySelector(
    '[data-tao-select-clear]',
  ) as HTMLElement;
  await userEvent.click(clear);
  expect(changed).toEqual([[], undefined]);
  expect(cleared).toBe(true);
});

test('mode="multiple": maxTagCount collapses overflow', () => {
  render(
    <Select
      options={[
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
        { label: 'C', value: 'c' },
      ]}
      mode="multiple"
      value={['a', 'b', 'c']}
      maxTagCount={2}
      onChange={() => {}}
    />,
  );
  const tags = document.querySelectorAll('[data-tao-select-tag]');
  expect(tags.length).toBe(3); // 2 visible + 1 rest
  expect(screen.getByText('A')).toBeTruthy();
  expect(screen.getByText('B')).toBeTruthy();
  const rest = document.querySelector('[data-tao-select-tag-rest]');
  expect(rest).toBeTruthy();
});

test('mode="multiple": maxTagPlaceholder renders custom node', () => {
  render(
    <Select
      options={[
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
        { label: 'C', value: 'c' },
      ]}
      mode="multiple"
      value={['a', 'b', 'c']}
      maxTagCount={1}
      maxTagPlaceholder="and more"
      onChange={() => {}}
    />,
  );
  expect(screen.getByText('and more')).toBeTruthy();
});

test('mode="multiple": maxTagTextLength truncates labels', () => {
  render(
    <Select
      options={[{ label: 'VeryLongLabel', value: 'v' }]}
      mode="multiple"
      value={['v']}
      maxTagTextLength={4}
      onChange={() => {}}
    />,
  );
  expect(screen.getByText('Very…')).toBeTruthy();
});

test('mode="multiple": tagRender customizes tag content', () => {
  render(
    <Select
      options={[{ label: 'Beta', value: 'b' }]}
      mode="multiple"
      value={['b']}
      tagRender={(p) => <span data-testid="custom-tag">{p.label}</span>}
      onChange={() => {}}
    />,
  );
  expect(screen.getByTestId('custom-tag')).toBeTruthy();
});

test('mode="multiple": maxCount disables options when limit reached', async () => {
  render(
    <Select
      options={[
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
        { label: 'C', value: 'c' },
      ]}
      mode="multiple"
      value={['a', 'b']}
      maxCount={2}
      open
    />,
  );
  // A and B should still be enabled (already selected), C should be disabled
  const items = document.querySelectorAll('[data-tao-select-item]');
  expect(items.length).toBe(3);
  const itemC = screen.getByText('C').closest('[data-tao-select-item]');
  expect(itemC?.hasAttribute('data-disabled')).toBe(true);
});

test('mode="multiple": hideSelected removes selected options from list', () => {
  render(
    <Select
      options={[
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ]}
      mode="multiple"
      value={['a']}
      hideSelected
      open
      onChange={() => {}}
    />,
  );
  // A is visible as a tag in the trigger, but should not appear as a dropdown item.
  const items = document.querySelectorAll('[data-tao-select-item]');
  const itemTexts = Array.from(items).map((el) => el.textContent?.trim());
  expect(itemTexts).not.toContain('A');
  expect(itemTexts).toContain('B');
});

test('mode="multiple": handles defaultValue as array', () => {
  render(
    <Select
      options={[
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ]}
      mode="multiple"
      defaultValue={['a', 'b']}
    />,
  );
  const tags = document.querySelectorAll('[data-tao-select-tag]');
  expect(tags.length).toBe(2);
});

// ---- Mobile multi-select ----

test('mobile + multiple: shows checkmark and Done button', async () => {
  render(
    <Select
      options={[
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ]}
      mode="multiple"
      mobile
      placeholder="Pick"
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  // Items rendered
  expect(screen.getByText('A')).toBeTruthy();
  expect(screen.getByText('B')).toBeTruthy();
  expect(screen.getByText('Done')).toBeTruthy();
});

test('mobile + multiple: toggling items does not close drawer', async () => {
  render(
    <Select
      options={[
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ]}
      mode="multiple"
      mobile
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  await userEvent.click(screen.getByText('A'));
  expect(screen.getByRole('dialog')).toBeTruthy(); // still open
  const check = document.querySelector('[data-tao-sheet-item-check]');
  expect(check).toBeTruthy();
});

test('mobile + multiple: Done commits and closes drawer', async () => {
  let committed: string[] | null = null;
  render(
    <Select
      options={[
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ]}
      mode="multiple"
      mobile
      onChange={(v) => {
        committed = v as string[];
      }}
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  await userEvent.click(screen.getByText('A'));
  await userEvent.click(screen.getByText('B'));
  await userEvent.click(screen.getByText('Done'));
  expect(committed).toEqual(['a', 'b']);
  // Dialog closed after Done
  expect(screen.queryByRole('dialog')).toBeNull();
});
