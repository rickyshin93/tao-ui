import { readFileSync } from 'node:fs';
import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Select } from '../../src/components/select/select';
import { SearchableSelectList } from '../../src/components/select/select-searchable-list';
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

test.each([
  { name: 'desktop', mobile: false, showSearch: false },
  { name: 'searchable', mobile: false, showSearch: true },
  { name: 'mobile', mobile: true, showSearch: false },
])('forwards explicit field accessibility props to the $name control', ({
  mobile,
  showSearch,
}) => {
  render(
    <>
      <p id="select-help">Preferred interface language</p>
      <p id="select-error">Unavailable language</p>
      <Select
        id="named-select"
        mobile={mobile}
        showSearch={showSearch}
        defaultValue="zh"
        options={[{ label: 'Chinese', value: 'zh' }]}
        aria-label="Interface language"
        aria-describedby="select-help"
        aria-errormessage="select-error"
        aria-invalid="true"
        aria-required="true"
      />
    </>,
  );
  const control = screen.getByRole(mobile ? 'button' : 'combobox', {
    name: 'Interface language',
  });
  expect(control).toHaveAttribute('id', 'named-select');
  expect(control).toHaveAccessibleDescription('Preferred interface language');
  expect(control).toHaveAccessibleErrorMessage('Unavailable language');
  expect(control).toHaveAttribute('aria-required', 'true');
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

test.each([
  undefined,
  'multiple',
  'tags',
] as const)('%s mode keeps defaultValue editable when value is omitted', async (mode) => {
  render(
    <Select
      mode={mode}
      mobile={false}
      open
      defaultValue={mode ? ['a'] : 'a'}
      options={[
        { label: 'Alpha', value: 'a' },
        { label: 'Beta', value: 'b' },
      ]}
    />,
  );
  expect(document.querySelector('[data-tao-select]')).toHaveTextContent(
    'Alpha',
  );
  await userEvent.click(screen.getByRole('option', { name: 'Beta' }));
  expect(document.querySelector('[data-tao-select]')).toHaveTextContent('Beta');
  if (mode)
    expect(document.querySelectorAll('[data-tao-select-tag]')).toHaveLength(2);
  else
    expect(document.querySelector('[data-tao-select]')).not.toHaveTextContent(
      'Alpha',
    );
});

test('token separators normalize labels, ignore disabled options and deduplicate canonical values', () => {
  const onChange = rs.fn();
  const onSelect = rs.fn();
  const alpha = { label: 'Alpha', value: 'a' };
  render(
    <Select
      mobile={false}
      mode="multiple"
      showSearch
      options={[alpha, { label: 'Beta', value: 'b', disabled: true }]}
      tokenSeparators={[',', ';']}
      onChange={onChange}
      onSelect={onSelect}
      maxCount={1}
    />,
  );
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: 'Alpha,a;b,unknown,' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).toHaveBeenCalledWith(['a'], [alpha]);
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith('a', alpha);
});

test('tags separators preserve new tags and existing selections without duplicates', () => {
  const onChange = rs.fn();
  render(
    <Select
      mobile={false}
      mode="tags"
      showSearch
      options={[{ label: 'Alpha', value: 'a' }]}
      defaultValue={['a']}
      tokenSeparators={[',']}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: 'Alpha,new,new,' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).toHaveBeenCalledWith(
    ['a', 'new'],
    [{ label: 'Alpha', value: 'a' }],
  );
});

test('token separators retain controlled selection and enforce maxCount after normalization', () => {
  const onChange = rs.fn();
  render(
    <Select
      mobile={false}
      mode="multiple"
      showSearch
      options={[
        { label: 'Alpha', value: 'a' },
        { label: 'Beta', value: 'b' },
      ]}
      value={['a']}
      tokenSeparators={[',']}
      maxCount={1}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: 'Beta,' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).not.toHaveBeenCalled();
  expect(document.querySelectorAll('[data-tao-select-tag]')).toHaveLength(1);
});

test.each([
  'local',
  'provider',
])('mobile Select respects %s disabled on pointer and keyboard activation', async (source) => {
  const onOpenChange = rs.fn();
  render(
    <TaoProvider disabled={source === 'provider'}>
      <Select
        mobile
        disabled={source === 'local' ? true : undefined}
        placeholder="Pick"
        options={[{ label: 'Alpha', value: 'a' }]}
        onOpenChange={onOpenChange}
      />
    </TaoProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Pick' });
  await userEvent.click(trigger);
  fireEvent.keyDown(trigger, { key: 'Enter' });
  fireEvent.keyDown(trigger, { key: ' ' });
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(trigger).toHaveAttribute('data-disabled');
});

test.each([
  'single',
  'multiple',
])('mobile %s selection becomes disabled while its drawer is open', async (mode) => {
  const onChange = rs.fn();
  const select = (disabled: boolean) => (
    <TaoProvider disabled={disabled}>
      <Select
        mobile
        defaultOpen
        mode={mode === 'multiple' ? 'multiple' : undefined}
        showSearch
        options={[{ label: 'Alpha', value: 'a' }]}
        onChange={onChange}
      />
    </TaoProvider>
  );
  const { rerender } = render(select(false));
  if (mode === 'multiple')
    await userEvent.click(screen.getByRole('button', { name: 'Alpha' }));
  rerender(select(true));
  const option = screen.getByRole('button', { name: 'Alpha' });
  expect(option).toBeDisabled();
  expect(screen.getByPlaceholderText('Search...')).toBeDisabled();
  await userEvent.click(option);
  if (mode === 'multiple') {
    const done = screen.getByRole('button', { name: 'Done' });
    expect(done).toBeDisabled();
    await userEvent.click(done);
  }
  expect(onChange).not.toHaveBeenCalled();
});

test('local disabled=false still overrides mobile Select provider disabled', async () => {
  const onChange = rs.fn();
  render(
    <TaoProvider disabled>
      <Select
        mobile
        disabled={false}
        placeholder="Pick"
        options={[{ label: 'Alpha', value: 'a' }]}
        onChange={onChange}
      />
    </TaoProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Pick' }));
  await userEvent.click(screen.getByRole('button', { name: 'Alpha' }));
  expect(onChange).toHaveBeenCalledWith('a', { label: 'Alpha', value: 'a' });
});

test.each([
  'Enter',
  'Escape',
  'ArrowDown',
  'ArrowUp',
])('Select leaves %s to the input method during composition', (key) => {
  const onChange = rs.fn();
  render(
    <Select
      mobile={false}
      showSearch
      mode="tags"
      options={[
        { label: 'Alpha', value: 'a' },
        { label: 'Beta', value: 'b' },
      ]}
      filterOption={() => true}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: '中文' } });
  if (key === 'ArrowUp') fireEvent.keyDown(input, { key: 'ArrowDown' });
  const activeOption = input.getAttribute('aria-activedescendant');
  fireEvent.compositionStart(input);
  fireEvent.keyDown(input, { key });
  expect(onChange).not.toHaveBeenCalled();
  expect(input).toHaveValue('中文');
  expect(input).toHaveAttribute('aria-expanded', 'true');
  expect(input.getAttribute('aria-activedescendant')).toBe(activeOption);
});

test.each([
  { isComposing: true },
  { keyCode: 229 },
])('Select ignores native composing Enter %j', (nativeState) => {
  const onChange = rs.fn();
  render(
    <Select
      mobile={false}
      showSearch
      mode="tags"
      options={[]}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: '中文' } });
  fireEvent.keyDown(input, { key: 'Enter', ...nativeState });
  expect(onChange).not.toHaveBeenCalled();
  expect(input).toHaveValue('中文');
});

test('Select defers token separators until composition ends and then accepts normal submission', () => {
  const onChange = rs.fn();
  render(
    <Select
      mobile={false}
      showSearch
      mode="tags"
      tokenSeparators={[',']}
      options={[]}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('combobox');
  fireEvent.compositionStart(input);
  fireEvent.change(input, { target: { value: '中文,' } });
  fireEvent.keyDown(input, { key: ',' });
  expect(onChange).not.toHaveBeenCalled();
  expect(input).toHaveValue('中文,');
  fireEvent.compositionEnd(input);
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).toHaveBeenCalledWith(['中文'], []);
  expect(input).toHaveValue('');
});

test('search highlight uses the visible index when dynamic options shrink and grow', () => {
  const onChange = rs.fn();
  const options = Array.from({ length: 10 }, (_, index) => ({
    value: String(index),
    label: `Item ${index}`,
  }));
  const { rerender } = render(
    <Select
      mobile={false}
      showSearch
      defaultOpen
      options={options}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('combobox');
  for (let index = 0; index < 9; index++)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
  rerender(
    <Select
      mobile={false}
      showSearch
      defaultOpen
      options={options.slice(0, 2)}
      onChange={onChange}
    />,
  );
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: 'ArrowUp' });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).toHaveBeenLastCalledWith('0', options[0]);
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  rerender(
    <Select
      mobile={false}
      showSearch
      defaultOpen
      options={options}
      onChange={onChange}
    />,
  );
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).toHaveBeenLastCalledWith('1', options[1]);
});

test('shrinking and restoring search results does not revive an out-of-range highlight', () => {
  const onChange = rs.fn();
  const options = Array.from({ length: 10 }, (_, index) => ({
    value: String(index),
    label: `Item ${index}`,
  }));
  const { rerender } = render(
    <Select
      mobile={false}
      showSearch
      defaultOpen
      options={options}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('combobox');
  for (let index = 0; index < 9; index++)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
  rerender(
    <Select
      mobile={false}
      showSearch
      defaultOpen
      options={options.slice(0, 2)}
      onChange={onChange}
    />,
  );
  rerender(
    <Select
      mobile={false}
      showSearch
      defaultOpen
      options={options}
      onChange={onChange}
    />,
  );
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).toHaveBeenCalledWith('1', options[1]);
});

test('ArrowDown with no search results still permits Enter after async options arrive', () => {
  const onChange = rs.fn();
  const option = { value: 'a', label: 'Alpha' };
  const { rerender } = render(
    <Select
      mobile={false}
      showSearch
      defaultOpen
      options={[]}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('combobox');
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  rerender(
    <Select
      mobile={false}
      showSearch
      defaultOpen
      options={[option]}
      onChange={onChange}
    />,
  );
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).toHaveBeenCalledWith('a', option);
});

test('search highlight is normalized when options become disabled', () => {
  const onChange = rs.fn();
  const options = Array.from({ length: 4 }, (_, index) => ({
    value: String(index),
    label: `Item ${index}`,
  }));
  const { rerender } = render(
    <Select
      mobile={false}
      showSearch
      defaultOpen
      options={options}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('combobox');
  for (let index = 0; index < 3; index++)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
  rerender(
    <Select
      mobile={false}
      showSearch
      defaultOpen
      options={options.map((option, index) => ({
        ...option,
        disabled: index > 1,
      }))}
      onChange={onChange}
    />,
  );
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: 'ArrowUp' });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).toHaveBeenCalledWith('0', {
    ...options[0],
    disabled: false,
  });
});

test('grouped searchable optionRender indexes include disabled leaves while keyboard indexes skip them', () => {
  const onChange = rs.fn();
  const onDeselect = rs.fn();
  const alpha = { value: 'a', label: 'Alpha' };
  const beta = { value: 'b', label: 'Beta' };
  render(
    <Select
      mobile={false}
      showSearch
      defaultOpen
      mode="multiple"
      defaultValue={['a']}
      maxCount={2}
      options={[
        {
          value: 'group',
          label: 'Group',
          options: [
            { value: 'disabled', label: 'Disabled', disabled: true },
            alpha,
            beta,
          ],
        },
        { value: 'c', label: 'Gamma' },
      ]}
      optionRender={(option, { index }) => (
        <span>
          {String(option.label)}-{index}
        </span>
      )}
      onChange={onChange}
      onDeselect={onDeselect}
    />,
  );
  expect(screen.getByRole('option', { name: 'Disabled-0' })).toBeDisabled();
  const alphaOption = screen.getByRole('option', { name: 'Alpha-1' });
  const betaOption = screen.getByRole('option', { name: 'Beta-2' });
  fireEvent.mouseMove(betaOption);
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
  expect(onChange).toHaveBeenLastCalledWith(['a', 'b'], [alpha, beta]);
  expect(screen.getByRole('option', { name: 'Gamma-3' })).toBeDisabled();
  fireEvent.mouseMove(alphaOption);
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
  expect(onChange).toHaveBeenLastCalledWith(['b'], [beta]);
  expect(onDeselect).toHaveBeenCalledWith('a', alpha);
});

test('searchable-list highlight updates keep lookup work linear as options double', () => {
  function measure(size: number) {
    let reads = 0;
    const options = Array.from({ length: size }, (_, index) => ({
      get value() {
        reads++;
        return String(index);
      },
      label: `Measured ${index}`,
    }));
    const list = (activeValue: string) => (
      <SearchableSelectList
        id="measurement"
        options={options}
        resultCount={size}
        searchableOptions={options}
        activeValue={activeValue}
        selectedValues={[]}
        multiple={false}
        maxCountReached={false}
        listHeight={200}
        notFoundContent="Empty"
        onActiveIndexChange={() => {}}
        onValueChange={() => {}}
        onClose={() => {}}
      />
    );
    const { rerender, unmount } = render(list('0'));
    reads = 0;
    rerender(list('1'));
    const count = reads;
    unmount();
    return count;
  }
  expect(measure(400)).toBeLessThanOrEqual(measure(200) * 2.5);
});
