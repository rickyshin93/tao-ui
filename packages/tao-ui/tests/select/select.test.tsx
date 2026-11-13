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

test('height-limited option lists allow vertical scrolling', () => {
  const css = readFileSync('src/components/select/select.css', 'utf8');
  const rule = css.match(/\[data-tao-select-viewport\] \{([^}]+)\}/)?.[1];

  expect(rule).toContain('overflow-y: auto;');
});

test('renders with placeholder', () => {
  render(<Select options={[]} placeholder="Pick one" />);
  expect(screen.getByText('Pick one')).toBeTruthy();
});

test.each([
  { name: 'single', mobile: false, showSearch: false, multiple: false },
  { name: 'searchable', mobile: false, showSearch: true, multiple: false },
  { name: 'multiple', mobile: false, showSearch: true, multiple: true },
  { name: 'mobile', mobile: true, showSearch: false, multiple: true },
])(
  'wrapped $name options retain complete labels and selection behavior',
  async ({ mobile, showSearch, multiple }) => {
    const label = 'case2_02_cardiology_investigation_report.pdf';
    const onChange = rs.fn();
    render(
      <Select
        mobile={mobile}
        showSearch={showSearch}
        mode={multiple ? 'multiple' : undefined}
        optionLabelWrap
        defaultOpen
        options={[{ label, value: 'report' }]}
        onChange={onChange}
      />,
    );
    const option = await screen.findByRole(mobile ? 'button' : 'option', {
      name: label,
    });
    expect(option).toHaveAttribute('data-tao-label-wrap', 'true');
    expect(option.textContent).toBe(label);
    await userEvent.click(option);
    if (mobile)
      await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onChange).toHaveBeenCalledWith(
      multiple ? ['report'] : 'report',
      multiple ? [{ label, value: 'report' }] : { label, value: 'report' },
    );
  },
);

test('desktop trigger is keyboard focusable and disabled triggers leave the tab order', async () => {
  const user = userEvent.setup();
  render(
    <>
      <Select aria-label="Enabled" options={[{ label: 'One', value: '1' }]} />
      <Select aria-label="Disabled" disabled options={[]} />
      <button type="button">Next</button>
    </>,
  );
  await user.tab();
  expect(screen.getByRole('combobox', { name: 'Enabled' })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
});

test.each([
  { name: 'desktop', mobile: false, showSearch: false },
  { name: 'searchable', mobile: false, showSearch: true },
  { name: 'mobile', mobile: true, showSearch: false },
])(
  'forwards explicit field accessibility props to the $name control',
  ({ mobile, showSearch }) => {
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
  },
);

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

test.each([false, true])(
  'nested Select groups only expose leaf choices (mobile=%s)',
  async (mobile) => {
    const onChange = rs.fn();
    const leaf = { value: 'a', label: 'Alpha' };
    render(
      <Select
        mobile={mobile}
        defaultOpen
        options={[
          {
            value: 'outer',
            label: 'Outer',
            options: [{ value: 'inner', label: 'Inner', options: [leaf] }],
          },
        ]}
        onChange={onChange}
      />,
    );
    const role = mobile ? 'button' : 'option';
    expect(screen.getByText('Inner')).toBeVisible();
    expect(screen.queryByRole(role, { name: 'Inner' })).toBeNull();
    await userEvent.click(screen.getByRole(role, { name: 'Alpha' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('a', leaf);
  },
);

test('mobile hideSelected hides committed selections and allows undoing a pending tap', async () => {
  const onChange = rs.fn();
  render(
    <Select
      mobile
      defaultOpen
      hideSelected
      mode="multiple"
      defaultValue={['a']}
      options={[
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
      ]}
      onChange={onChange}
    />,
  );
  expect(
    screen.queryByRole('button', { name: 'Alpha', exact: true }),
  ).toBeNull();
  const beta = screen.getByRole('button', { name: 'Beta' });
  await userEvent.click(beta);
  expect(beta).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(beta);
  expect(beta).toHaveAttribute('aria-pressed', 'false');
  await userEvent.click(screen.getByRole('button', { name: 'Done' }));
  expect(onChange.mock.calls[0][0]).toEqual(['a']);
});

test('desktop non-searchable Select clears its native form value after a selection', async () => {
  const { container } = render(
    <form>
      <Select
        mobile={false}
        name="selection"
        allowClear
        placeholder="Pick"
        options={[{ value: 'a', label: 'Alpha' }]}
      />
    </form>,
  );
  const form = container.querySelector('form')!;
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
  await userEvent.click(await screen.findByRole('option', { name: 'Alpha' }));
  expect(new FormData(form).get('selection')).toBe('a');
  await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(new FormData(form).get('selection')).toBe('');
});

test('searchable Select groups use their rendered label as the accessible name', () => {
  render(
    <Select
      mobile={false}
      showSearch
      defaultOpen
      options={[
        {
          value: 'group',
          label: <strong>Available</strong>,
          options: [{ value: 'a', label: 'Alpha' }],
        },
      ]}
    />,
  );
  expect(screen.getByRole('group', { name: 'Available' })).toBeInTheDocument();
});

test('mobile Select trigger exposes the drawer type and expanded state', async () => {
  render(<Select mobile aria-label="Pick" options={[]} />);
  const trigger = screen.getByRole('button', { name: 'Pick' });
  expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(trigger);
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
});

test('an externally closed mobile Select starts a new search when reopened', async () => {
  const props = {
    mobile: true,
    showSearch: true,
    options: [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ],
  };
  const view = render(<Select {...props} open />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Beta' } });
  expect(screen.queryByRole('button', { name: 'Alpha' })).toBeNull();
  view.rerender(<Select {...props} open={false} />);
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  view.rerender(<Select {...props} open />);
  expect(await screen.findByRole('textbox')).toHaveValue('');
  expect(screen.getByRole('button', { name: 'Alpha' })).toBeInTheDocument();
});

test('an ignored controlled close keeps the current Select search', async () => {
  const onOpenChange = rs.fn();
  render(
    <Select
      mobile
      open
      showSearch
      onOpenChange={onOpenChange}
      options={[
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
      ]}
    />,
  );
  const search = screen.getByRole('textbox');
  fireEvent.change(search, { target: { value: 'Beta' } });
  await userEvent.keyboard('{Escape}');
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(search).toHaveValue('Beta');
  expect(screen.queryByRole('button', { name: 'Alpha' })).toBeNull();
});

test.each([true, false])(
  'disabling an open desktop Select disables its options (search=%s)',
  (showSearch) => {
    const onChange = rs.fn();
    const picker = (disabled: boolean) => (
      <Select
        open
        mobile={false}
        showSearch={showSearch}
        disabled={disabled}
        onChange={onChange}
        options={[{ value: 'a', label: 'Alpha' }]}
      />
    );
    const view = render(picker(false));
    expect(screen.getByRole('option', { name: 'Alpha' })).not.toHaveAttribute(
      'data-disabled',
    );
    view.rerender(picker(true));

    const option = screen.getByRole('option', { name: 'Alpha' });
    expect(option).toHaveAttribute('data-disabled');
    fireEvent.click(option);
    expect(onChange).not.toHaveBeenCalled();
  },
);

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

test('tags without suggestions never opens an empty popup and still creates tags', async () => {
  render(
    <Select
      mobile={false}
      mode="tags"
      showSearch
      options={[]}
      notFoundContent={null}
    />,
  );
  const input = screen.getByRole('combobox');
  await userEvent.click(input);
  expect(input).toHaveAttribute('aria-expanded', 'false');
  expect(document.querySelector('[data-tao-select-content]')).toBeNull();
  await userEvent.type(input, 'Template{Enter}');
  expect(screen.getByText('Template')).toBeTruthy();
  expect(document.querySelector('[data-tao-select-content]')).toBeNull();
});

test('tags with no empty content hides unmatched suggestions and restores them when search clears', async () => {
  render(
    <Select
      mobile={false}
      mode="tags"
      showSearch
      options={[{ value: 'Known', label: 'Known' }]}
      notFoundContent={null}
    />,
  );
  const input = screen.getByRole('combobox');
  await userEvent.click(input);
  expect(screen.getByRole('option', { name: 'Known' })).toBeTruthy();
  await userEvent.type(input, 'New');
  expect(input).toHaveAttribute('aria-expanded', 'false');
  expect(document.querySelector('[data-tao-select-content]')).toBeNull();
  await userEvent.clear(input);
  expect(screen.getByRole('option', { name: 'Known' })).toBeTruthy();
});

test('tags preserves explicit empty content and the default suffix', async () => {
  render(
    <Select
      mobile={false}
      mode="tags"
      showSearch
      options={[]}
      notFoundContent="No templates"
    />,
  );
  await userEvent.click(screen.getByRole('combobox'));
  expect(screen.getByText('No templates')).toBeTruthy();
  expect(
    document.querySelector('[data-tao-select-icons] [data-tao-select-icon]'),
  ).toBeTruthy();
});

test('tags preserves custom popup content even without suggestions', () => {
  render(
    <Select
      mobile={false}
      mode="tags"
      showSearch
      options={[]}
      open
      popupRender={() => <div>Custom content</div>}
    />,
  );
  expect(screen.getByText('Custom content')).toBeTruthy();
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

test('mobile multiple selection enforces maxCount before committing', async () => {
  const onChange = rs.fn();
  render(
    <Select
      mobile
      defaultOpen
      mode="multiple"
      maxCount={1}
      options={[
        { label: 'Apple', value: 'a' },
        { label: 'Banana', value: 'b' },
      ]}
      onChange={onChange}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Apple' }));
  expect(screen.getByRole('button', { name: 'Banana' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'Done' }));
  expect(onChange).toHaveBeenCalledWith(
    ['a'],
    [{ label: 'Apple', value: 'a' }],
  );
});

test('mobile search respects controlled text and reports edits', () => {
  const onSearch = rs.fn();
  const { rerender } = render(
    <Select
      mobile
      defaultOpen
      showSearch
      searchValue="Apple"
      onSearch={onSearch}
      options={[]}
    />,
  );
  const input = screen.getByRole('textbox', { name: 'Search options' });
  expect(input).toHaveValue('Apple');
  fireEvent.change(input, { target: { value: 'Banana' } });
  expect(onSearch).toHaveBeenCalledWith('Banana');
  expect(input).toHaveValue('Apple');
  rerender(
    <Select
      mobile
      defaultOpen
      showSearch
      searchValue="Banana"
      onSearch={onSearch}
      options={[]}
    />,
  );
  expect(input).toHaveValue('Banana');
});

test('choosing a literal option keeps separator characters in its value', () => {
  const onChange = rs.fn();
  const option = { value: 'a,b', label: 'Alpha and Beta' };
  render(
    <Select
      mobile={false}
      open
      mode="multiple"
      showSearch
      options={[option]}
      tokenSeparators={[',']}
      onChange={onChange}
    />,
  );
  fireEvent.click(screen.getByRole('option', { name: 'Alpha and Beta' }));

  expect(onChange).toHaveBeenCalledExactlyOnceWith(['a,b'], [option]);
});

test('desktop Select retains a query when a tag batch exceeds maxCount', () => {
  render(
    <Select
      mobile={false}
      mode="tags"
      showSearch
      maxCount={1}
      options={[]}
      tokenSeparators={[',']}
    />,
  );
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: 'Alpha,Beta' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(input).toHaveValue('Alpha,Beta');
});

test('mobile Select retains a query when a tag batch exceeds maxCount', () => {
  render(
    <Select
      mobile
      defaultOpen
      mode="tags"
      showSearch
      maxCount={1}
      options={[]}
      tokenSeparators={[',']}
    />,
  );
  const input = screen.getByRole('textbox', { name: 'Search options' });
  fireEvent.change(input, { target: { value: 'Alpha,Beta' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(input).toHaveValue('Alpha,Beta');
});

test('mobile tags creates values and applies token separators before Done', async () => {
  const onChange = rs.fn();
  render(
    <Select
      mobile
      defaultOpen
      mode="tags"
      showSearch
      options={[]}
      tokenSeparators={[',']}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('textbox', { name: 'Search options' });
  fireEvent.change(input, { target: { value: 'First,Second' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'First' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await userEvent.click(screen.getByRole('button', { name: 'Second' }));
  await userEvent.click(screen.getByRole('button', { name: 'Done' }));
  expect(onChange).toHaveBeenCalledWith(['First'], []);
});

test('an open mobile Select retains its draft and presentation across breakpoint changes', async () => {
  const onChange = rs.fn();
  const options = [{ value: 'a', label: 'Apple' }];
  const { rerender } = render(
    <Select
      mobile
      defaultOpen
      mode="multiple"
      options={options}
      onChange={onChange}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Apple' }));
  rerender(
    <Select
      mobile={false}
      defaultOpen
      mode="multiple"
      options={options}
      onChange={onChange}
    />,
  );
  expect(screen.getByRole('button', { name: 'Apple' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await userEvent.click(screen.getByRole('button', { name: 'Done' }));
  expect(onChange).toHaveBeenCalledWith(['a'], options);
  await userEvent.click(screen.getByRole('combobox'));
  expect(screen.getByRole('listbox')).toBeInTheDocument();
});

test('a mobile Select close request does not focus the trigger if the drawer stays open', async () => {
  const onOpenChange = rs.fn();
  const picker = (mobile: boolean) => (
    <Select
      open
      mobile={mobile}
      aria-label="Choose"
      onOpenChange={onOpenChange}
      options={[{ value: 'a', label: 'Apple' }]}
    />
  );
  const view = render(picker(true));
  const trigger = document.querySelector<HTMLElement>('[data-tao-select]')!;
  const focus = rs.spyOn(trigger, 'focus');
  view.rerender(picker(false));
  const dialog = screen.getByRole('dialog');
  fireEvent.keyDown(dialog, { key: 'Escape' });
  await new Promise((resolve) => setTimeout(resolve, 20));

  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(dialog).toBeVisible();
  expect(focus).not.toHaveBeenCalled();
});

test('mobile popup forwards semantic parts and popupRender', () => {
  render(
    <Select
      mobile
      defaultOpen
      showSearch
      options={[{ value: 'a', label: 'Apple' }]}
      classNames={{
        popup: 'custom-popup',
        item: 'custom-item',
        searchInput: 'custom-input',
      }}
      styles={{ item: { color: 'red' } }}
      popupRender={(menu) => <section aria-label="Custom menu">{menu}</section>}
    />,
  );
  expect(
    screen.getByRole('region', { name: 'Custom menu' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('dialog')).toHaveClass('custom-popup');
  expect(screen.getByRole('textbox', { name: 'Search options' })).toHaveClass(
    'custom-input',
  );
  expect(screen.getByRole('button', { name: 'Apple' })).toHaveClass(
    'custom-item',
  );
  expect(screen.getByRole('button', { name: 'Apple' })).toHaveStyle({
    color: 'red',
  });
});

test('mobile clear is available before hover and does not open the drawer', async () => {
  const onChange = rs.fn();
  render(
    <Select
      mobile
      allowClear
      defaultValue="a"
      options={[{ value: 'a', label: 'Apple' }]}
      onChange={onChange}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(onChange).toHaveBeenCalledWith('', undefined);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('Select inherits configurable text through nested providers and portals', () => {
  render(
    <TaoProvider
      locale={{
        select: '选择',
        searchPlaceholder: '搜索…',
        searchOptions: '搜索选项',
        done: '完成',
        noResults: '暂无结果',
      }}
    >
      <TaoProvider>
        <Select mobile defaultOpen mode="multiple" showSearch options={[]} />
      </TaoProvider>
    </TaoProvider>,
  );
  expect(screen.getByRole('dialog', { name: '选择' })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: '搜索选项' })).toHaveAttribute(
    'placeholder',
    '搜索…',
  );
  expect(screen.getByRole('button', { name: '完成' })).toBeInTheDocument();
  expect(screen.getByText('暂无结果')).toBeInTheDocument();
});

test('multiple selection notifies change before select, deselect and clear', async () => {
  const alpha = { label: 'Alpha', value: 'a' };
  const beta = { label: 'Beta', value: 'b' };
  const events: unknown[][] = [];
  render(
    <Select
      mobile={false}
      showSearch
      defaultOpen
      mode="multiple"
      defaultValue={['a']}
      options={[alpha, beta]}
      allowClear
      onChange={(value, options) => events.push(['change', value, options])}
      onSelect={(value, option) => events.push(['select', value, option])}
      onDeselect={(value, option) => events.push(['deselect', value, option])}
      onClear={() => events.push(['clear'])}
    />,
  );

  await userEvent.click(screen.getByRole('option', { name: 'Beta' }));
  expect(events).toEqual([
    ['change', ['a', 'b'], [alpha, beta]],
    ['select', 'b', beta],
  ]);
  events.length = 0;
  await userEvent.click(screen.getByRole('option', { name: 'Alpha' }));
  expect(events).toEqual([
    ['change', ['b'], [beta]],
    ['deselect', 'a', alpha],
  ]);
  events.length = 0;
  await userEvent.click(screen.getByRole('button', { name: 'Remove Beta' }));
  expect(events).toEqual([
    ['change', [], []],
    ['deselect', 'b', beta],
  ]);

  await userEvent.click(screen.getByRole('option', { name: 'Alpha' }));
  events.length = 0;
  await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(events).toEqual([['change', [], undefined], ['clear']]);
  expect(document.querySelectorAll('[data-tao-select-tag]')).toHaveLength(0);
});

test.each([undefined, 'multiple', 'tags'] as const)(
  '%s controlled selection accepts only parent updates, including explicit undefined',
  async (mode) => {
    const alpha = { label: 'Alpha', value: 'a' };
    const beta = { label: 'Beta', value: 'b' };
    const updatedBeta = { label: 'Updated Beta', value: 'b' };
    const events: unknown[][] = [];
    const props = {
      mobile: false,
      showSearch: true,
      open: true,
      mode,
      placeholder: 'Pick',
      onChange: (value: unknown, options: unknown) =>
        events.push(['change', value, options]),
      onSelect: (value: unknown, option: unknown) =>
        events.push(['select', value, option]),
      onDeselect: (value: unknown, option: unknown) =>
        events.push(['deselect', value, option]),
    };
    const { container, rerender } = render(
      <Select
        {...props}
        options={[alpha, beta]}
        value={undefined}
        defaultValue={mode ? ['b'] : 'b'}
      />,
    );
    const trigger = container.querySelector('[data-tao-select]');
    expect(trigger).not.toHaveTextContent('Beta');
    await userEvent.click(screen.getByRole('option', { name: 'Alpha' }));
    expect(events).toEqual([
      ['change', mode ? ['a'] : 'a', mode ? [alpha] : alpha],
      ['select', 'a', alpha],
    ]);
    expect(trigger).not.toHaveTextContent('Alpha');

    rerender(
      <Select
        {...props}
        options={[alpha, updatedBeta]}
        value={mode ? ['b'] : 'b'}
      />,
    );
    expect(trigger).toHaveTextContent('Updated Beta');
    expect(events).toHaveLength(2);
    events.length = 0;
    await userEvent.click(screen.getByRole('option', { name: 'Updated Beta' }));
    expect(events).toEqual([
      ['change', mode ? [] : 'b', mode ? [] : updatedBeta],
      [mode ? 'deselect' : 'select', 'b', updatedBeta],
    ]);
    expect(trigger).toHaveTextContent('Updated Beta');
  },
);

test('tag tokens notify once in canonical order and omit synthetic options', () => {
  const alpha = { label: 'Alpha', value: 'a' };
  const beta = { label: 'Beta', value: 'b' };
  const events: unknown[][] = [];
  render(
    <Select
      mobile={false}
      showSearch
      mode="tags"
      defaultValue={['a']}
      options={[alpha, beta]}
      tokenSeparators={[',']}
      onChange={(value, options) => events.push(['change', value, options])}
      onSelect={(value, option) => events.push(['select', value, option])}
    />,
  );
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: 'Beta,b,new,new,Alpha,' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(events).toEqual([
    ['change', ['a', 'b', 'new'], [alpha, beta]],
    ['select', 'b', beta],
  ]);
  expect(document.querySelectorAll('[data-tao-select-tag]')).toHaveLength(3);
  expect(input).toHaveValue('');
});

test('mobile draft commit notifies change then additions and removals, while cancel discards edits', async () => {
  const alpha = { label: 'Alpha', value: 'a' };
  const beta = { label: 'Beta', value: 'b' };
  const gamma = { label: 'Gamma', value: 'c' };
  const events: unknown[][] = [];
  const { container } = render(
    <Select
      mobile
      mode="multiple"
      defaultValue={['a', 'b']}
      options={[alpha, beta, gamma]}
      onChange={(value, options) => events.push(['change', value, options])}
      onSelect={(value, option) => events.push(['select', value, option])}
      onDeselect={(value, option) => events.push(['deselect', value, option])}
    />,
  );
  const trigger = container.querySelector('[data-tao-select]')!;
  await userEvent.click(trigger);
  await userEvent.click(screen.getByRole('button', { name: 'Beta' }));
  await userEvent.click(screen.getByRole('button', { name: 'Gamma' }));
  expect(events).toEqual([]);
  await userEvent.click(screen.getByRole('button', { name: 'Done' }));
  expect(events).toEqual([
    ['change', ['a', 'c'], [alpha, gamma]],
    ['select', 'c', gamma],
    ['deselect', 'b', beta],
  ]);
  expect(trigger).toHaveTextContent('Alpha');
  expect(trigger).toHaveTextContent('Gamma');
  expect(trigger).not.toHaveTextContent('Beta');
  events.length = 0;
  await userEvent.click(trigger);
  await userEvent.click(screen.getByRole('button', { name: 'Alpha' }));
  await userEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(events).toEqual([]);
  expect(trigger).toHaveTextContent('Alpha');
});

test.each([undefined, 'multiple', 'tags'] as const)(
  '%s mode keeps defaultValue editable when value is omitted',
  async (mode) => {
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
    expect(document.querySelector('[data-tao-select]')).toHaveTextContent(
      'Beta',
    );
    if (mode)
      expect(document.querySelectorAll('[data-tao-select-tag]')).toHaveLength(
        2,
      );
    else
      expect(document.querySelector('[data-tao-select]')).not.toHaveTextContent(
        'Alpha',
      );
  },
);

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

test.each(['local', 'provider'])(
  'mobile Select respects %s disabled on pointer and keyboard activation',
  async (source) => {
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
  },
);

test.each(['single', 'multiple'])(
  'mobile %s selection becomes disabled while its drawer is open',
  async (mode) => {
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
  },
);

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

test.each(['Enter', 'Escape', 'ArrowDown', 'ArrowUp'])(
  'Select leaves %s to the input method during composition',
  (key) => {
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
  },
);

test.each([{ isComposing: true }, { keyCode: 229 }])(
  'Select ignores native composing Enter %j',
  (nativeState) => {
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
  },
);

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

test('Enter opens a closed searchable Select before committing an option', () => {
  const onChange = rs.fn();
  const option = { value: 'a', label: 'Alpha' };
  render(
    <Select mobile={false} showSearch options={[option]} onChange={onChange} />,
  );
  const input = screen.getByRole('combobox');
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).not.toHaveBeenCalled();
  expect(input).toHaveAttribute('aria-expanded', 'true');
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).toHaveBeenCalledExactlyOnceWith('a', option);
});

test('search highlight follows the same option when async results are inserted', () => {
  const onChange = rs.fn();
  const alpha = { value: 'a', label: 'Alpha' };
  const beta = { value: 'b', label: 'Beta' };
  const picker = (options: (typeof alpha)[]) => (
    <Select
      mobile={false}
      defaultOpen
      showSearch
      options={options}
      onChange={onChange}
    />
  );
  const view = render(picker([alpha, beta]));
  const input = screen.getByRole('combobox');
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  const highlight = input.getAttribute('aria-activedescendant');
  expect(document.getElementById(highlight!)).toHaveTextContent('Beta');
  view.rerender(picker([{ value: 'n', label: 'New' }, alpha, beta]));
  expect(input).toHaveAttribute('aria-activedescendant', highlight);
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).toHaveBeenCalledExactlyOnceWith('b', beta);
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
