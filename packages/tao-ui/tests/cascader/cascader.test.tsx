import { expect, rstest, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { createRef, useState } from 'react';
import {
  Cascader,
  type CascaderRef,
} from '../../src/components/cascader/cascader';
import { TaoProvider } from '../../src/provider/tao-provider';
import { FieldLabelContext } from '../../src/utils/field-label';

const options = [
  {
    value: 'cn',
    label: 'China',
    children: [
      { value: 'sh', label: 'Shanghai' },
      { value: 'hz', label: 'Hangzhou' },
    ],
  },
  { value: 'locked', label: 'Locked', disabled: true },
];

test('mobile single selection opens a named drawer and commits a leaf', async () => {
  const onChange = rstest.fn();
  const onOpenChange = rstest.fn();
  render(
    <Cascader
      mobile
      mobileTitle="Delivery location"
      options={options}
      defaultOpen
      onChange={onChange}
      onOpenChange={onOpenChange}
    />,
  );
  const dialog = await screen.findByRole('dialog', {
    name: 'Delivery location',
  });
  fireEvent.click(within(dialog).getByText('China'));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(within(dialog).getByText('Shanghai'));
  expect(onChange).toHaveBeenCalledWith(
    ['cn', 'sh'],
    [options[0], options[0].children![0]],
  );
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(screen.getByTitle('China / Shanghai')).toBeInTheDocument();
});

test('mobile multiple selection commits on Done and discards a cancelled draft', async () => {
  const onChange = rstest.fn();
  render(
    <Cascader
      mobile
      multiple
      defaultOpen
      options={options}
      onChange={onChange}
    />,
  );
  let dialog = await screen.findByRole('dialog');
  fireEvent.click(
    within(dialog)
      .getByText('China')
      .parentElement!.querySelector('[class*="-checkbox"]')!,
  );
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(screen.queryByTitle('China')).not.toBeInTheDocument();
  fireEvent.mouseDown(document.querySelector('[data-tao-cascader]')!);
  dialog = await screen.findByRole('dialog');
  expect(
    within(dialog)
      .getByText('China')
      .parentElement!.querySelector('[class*="-checkbox-checked"]'),
  ).toBeNull();
  fireEvent.click(
    within(dialog)
      .getByText('China')
      .parentElement!.querySelector('[class*="-checkbox"]')!,
  );
  fireEvent.click(within(dialog).getByRole('button', { name: 'Done' }));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][0]).toEqual([['cn']]);
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(screen.getByTitle('China')).toBeInTheDocument();
});

test('mobile drawer search uses the cascader path search', async () => {
  const onChange = rstest.fn();
  const onSearch = rstest.fn();
  render(
    <Cascader
      mobile
      defaultOpen
      showSearch
      options={options}
      onChange={onChange}
      onSearch={onSearch}
    />,
  );
  const dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByRole('searchbox'), {
    target: { value: 'Shanghai' },
  });
  expect(onSearch).toHaveBeenCalledWith('Shanghai');
  fireEvent.click(await within(dialog).findByText('China / Shanghai'));
  expect(onChange.mock.calls[0][0]).toEqual(['cn', 'sh']);
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
});

test('mobile multiple selection clears uncontrolled search after a pick', async () => {
  render(<Cascader mobile multiple defaultOpen showSearch options={options} />);
  const dialog = await screen.findByRole('dialog');
  const input = within(dialog).getByRole('searchbox');
  fireEvent.change(input, { target: { value: 'Shanghai' } });
  const result = await within(dialog).findByText('China / Shanghai');
  fireEvent.click(result.parentElement!.querySelector('[class*="-checkbox"]')!);
  expect(input).toHaveValue('');
  expect(within(dialog).getByText('China')).toBeVisible();
});

test('mobile Done publishes current selected option objects after an async update', async () => {
  const onChange = rstest.fn();
  const picker = (label: string) => (
    <Cascader
      mobile
      multiple
      open
      fieldNames={{ value: 'id', label: 'name' }}
      options={[{ id: 'a', name: label }]}
      onChange={onChange}
    />
  );
  const view = render(picker('Alpha'));
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(
    within(dialog)
      .getByText('Alpha')
      .parentElement!.querySelector('[class*="-checkbox"]')!,
  );
  view.rerender(picker('Updated Alpha'));
  expect(within(dialog).getByText('Updated Alpha')).toBeVisible();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Done' }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith(
    [['a']],
    [[{ id: 'a', name: 'Updated Alpha' }]],
  );
});

test('mobile Done does not publish a draft option that became disabled', async () => {
  const onChange = rstest.fn();
  const picker = (disabled: boolean) => (
    <Cascader
      mobile
      multiple
      open
      options={[{ value: 'a', label: 'Alpha', disabled }]}
      onChange={onChange}
    />
  );
  const view = render(picker(false));
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(
    within(dialog)
      .getByText('Alpha')
      .parentElement!.querySelector('[class*="-checkbox"]')!,
  );
  view.rerender(picker(true));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Done' }));

  expect(onChange).not.toHaveBeenCalled();
});

test('mobile Done does not publish a draft option removed while the drawer is open', async () => {
  const onChange = rstest.fn();
  const picker = (available: typeof options) => (
    <Cascader mobile multiple open options={available} onChange={onChange} />
  );
  const view = render(picker(options));
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(
    within(dialog)
      .getByText('China')
      .parentElement!.querySelector('[class*="-checkbox"]')!,
  );
  view.rerender(picker([]));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Done' }));

  expect(onChange).not.toHaveBeenCalled();
});

test('external mobile close discards internal search before a controlled reopening', async () => {
  const onSearch = rstest.fn();
  const picker = (open: boolean) => (
    <Cascader
      mobile
      multiple
      showSearch
      open={open}
      options={options}
      onSearch={onSearch}
    />
  );
  const view = render(picker(true));
  const dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByRole('searchbox'), {
    target: { value: 'Shanghai' },
  });
  expect(await within(dialog).findByText('China / Shanghai')).toBeVisible();
  view.rerender(picker(false));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  view.rerender(picker(true));
  const reopened = await screen.findByRole('dialog');
  expect(within(reopened).getByRole('searchbox')).toHaveValue('');
  expect(within(reopened).getByText('China')).toBeVisible();
  expect(onSearch).toHaveBeenCalledExactlyOnceWith('Shanghai');
});

test('disabling an open mobile Cascader discards its pending selection', async () => {
  const onChange = rstest.fn();
  const picker = (disabled: boolean) => (
    <Cascader
      mobile
      multiple
      open
      disabled={disabled}
      options={options}
      onChange={onChange}
    />
  );
  const view = render(picker(false));
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(
    within(dialog)
      .getByText('China')
      .parentElement!.querySelector('[class*="-checkbox"]')!,
  );
  expect(dialog.querySelector('[class*="-checkbox-checked"]')).not.toBeNull();
  view.rerender(picker(true));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  view.rerender(picker(false));
  const reopened = await screen.findByRole('dialog');
  expect(reopened.querySelector('[class*="-checkbox-checked"]')).toBeNull();
  expect(onChange).not.toHaveBeenCalled();
});

test('external mobile close discards the draft before a controlled reopening', async () => {
  const onChange = rstest.fn();
  const props = { mobile: true, multiple: true as const, options, onChange };
  const { rerender } = render(<Cascader {...props} open />);
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(
    within(dialog)
      .getByText('China')
      .parentElement!.querySelector('[class*="-checkbox"]')!,
  );
  rerender(<Cascader {...props} open={false} />);
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  rerender(<Cascader {...props} open />);
  const reopened = await screen.findByRole('dialog');
  expect(reopened.querySelector('[class*="-checkbox-checked"]')).toBeNull();
  expect(onChange).not.toHaveBeenCalled();
});

test('an ignored mobile Cascader close preserves the pending edits', async () => {
  const onOpenChange = rstest.fn();
  render(
    <Cascader
      mobile
      multiple
      open
      showSearch={{ autoClearSearchValue: false }}
      options={options}
      onOpenChange={onOpenChange}
    />,
  );
  const dialog = await screen.findByRole('dialog');
  const search = within(dialog).getByRole('searchbox');
  fireEvent.change(search, { target: { value: 'Shanghai' } });
  const match = await within(dialog).findByText('China / Shanghai');
  fireEvent.click(match);
  expect(dialog.querySelector('[class*="-checkbox-checked"]')).not.toBeNull();

  fireEvent.keyDown(dialog, { key: 'Escape' });

  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(search).toHaveValue('Shanghai');
  expect(dialog.querySelector('[class*="-checkbox-checked"]')).not.toBeNull();
});

test('mobile title inherits the field label and custom option fields retain selection', async () => {
  const onChange = rstest.fn();
  const data = [{ id: 1, text: 'Parent', nodes: [{ id: 2, text: 'Child' }] }];
  render(
    <FieldLabelContext.Provider value="Destination">
      <Cascader
        mobile
        defaultOpen
        options={data}
        fieldNames={{ value: 'id', label: 'text', children: 'nodes' }}
        onChange={onChange}
      />
    </FieldLabelContext.Provider>,
  );
  const dialog = await screen.findByRole('dialog', { name: 'Destination' });
  fireEvent.click(within(dialog).getByText('Parent'));
  fireEvent.click(within(dialog).getByText('Child'));
  expect(onChange.mock.calls[0][0]).toEqual([1, 2]);
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
});

test('disabled mobile cascader does not open a drawer', () => {
  render(<Cascader mobile disabled defaultOpen options={options} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test.each([false, true])(
  'mobile keyboard navigation works with search=%s',
  async (showSearch) => {
    const onChange = rstest.fn();
    render(
      <Cascader
        mobile
        defaultOpen
        showSearch={showSearch}
        options={options}
        onChange={onChange}
      />,
    );
    const dialog = await screen.findByRole('dialog');
    const focusTarget = within(dialog).getByRole(
      showSearch ? 'searchbox' : 'group',
    );
    focusTarget.focus();
    fireEvent.keyDown(focusTarget, { key: 'ArrowDown' });
    fireEvent.keyDown(focusTarget, { key: 'ArrowRight' });
    fireEvent.keyDown(focusTarget, { key: 'Enter', isComposing: true });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(focusTarget, { key: 'Enter' });
    expect(onChange.mock.calls[0][0]).toEqual(['cn', 'sh']);
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
);

test.each([false, true])(
  'mobile multiple selection handles successive Enter presses with a custom trigger=%s',
  async (customTrigger) => {
    const onChange = rstest.fn();
    render(
      <Cascader
        mobile
        multiple
        defaultOpen
        options={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ]}
        onChange={onChange}
      >
        {customTrigger ? (
          <button type="button">Pick locations</button>
        ) : undefined}
      </Cascader>,
    );
    const dialog = await screen.findByRole('dialog');
    const menu = within(dialog).getByRole('group');
    menu.focus();
    for (const key of ['ArrowDown', 'Enter', 'ArrowDown', 'Enter']) {
      fireEvent.keyDown(menu, { key });
      fireEvent.keyUp(menu, { key });
    }
    fireEvent.click(within(dialog).getByRole('button', { name: 'Done' }));
    expect(onChange.mock.calls[0][0]).toEqual([['a'], ['b']]);
  },
);

test('opens cascaded columns and emits complete paths and selected option objects', async () => {
  const onChange = rstest.fn();
  const onOpenChange = rstest.fn();
  render(
    <Cascader
      options={options}
      defaultOpen
      onChange={onChange}
      onOpenChange={onOpenChange}
    />,
  );
  fireEvent.click(await screen.findByText('China'));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Shanghai'));
  expect(onChange.mock.calls[0]).toEqual([
    ['cn', 'sh'],
    [options[0], options[0].children![0]],
  ]);
  await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  expect(screen.getByTitle('China / Shanghai')).toBeInTheDocument();
});

test('changeOnSelect emits parent paths and supports custom displayRender', async () => {
  const onChange = rstest.fn();
  render(
    <Cascader
      options={options}
      defaultOpen
      changeOnSelect
      displayRender={(labels) => labels.join(' > ')}
      onChange={onChange}
    />,
  );
  fireEvent.click(await screen.findByText('China'));
  expect(onChange.mock.calls[0][0]).toEqual(['cn']);
  fireEvent.click(screen.getByText('Shanghai'));
  expect(screen.getByText('China > Shanghai')).toBeInTheDocument();
});

test('multiple selection follows SHOW_CHILD and keeps dropdown open', async () => {
  const onChange = rstest.fn();
  render(
    <Cascader
      options={options}
      defaultOpen
      multiple
      showCheckedStrategy={Cascader.SHOW_CHILD}
      onChange={onChange}
    />,
  );
  fireEvent.click(
    (await screen.findByText('China')).parentElement!.querySelector(
      '[class*="-checkbox"]',
    )!,
  );
  expect(onChange.mock.calls[0][0]).toEqual([
    ['cn', 'sh'],
    ['cn', 'hz'],
  ]);
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
});

test('searches full option paths with custom filter and render', async () => {
  const onSearch = rstest.fn();
  const onChange = rstest.fn();
  render(
    <Cascader
      options={options}
      defaultOpen
      showSearch={{
        onSearch,
        filter: (value, path) =>
          path.some((option) => String(option.label).includes(value)),
        render: (_value, path) =>
          `Found ${path.map((option) => option.label).join(' > ')}`,
      }}
      onChange={onChange}
    />,
  );
  fireEvent.change(screen.getByRole('combobox'), {
    target: { value: 'Shanghai' },
  });
  expect(onSearch).toHaveBeenCalledWith('Shanghai');
  fireEvent.click(await screen.findByText('Found China > Shanghai'));
  expect(onChange.mock.calls[0][0]).toEqual(['cn', 'sh']);
});

test('supports custom fields, keyboard paths and disabled options', async () => {
  const onChange = rstest.fn();
  render(
    <Cascader
      options={[{ id: 'a', name: 'Alpha', nodes: [{ id: 'b', name: 'Beta' }] }]}
      fieldNames={{ label: 'name', value: 'id', children: 'nodes' }}
      defaultOpen
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('combobox');
  await screen.findByText('Alpha');
  fireEvent.keyDown(input, { key: 'ArrowDown', keyCode: 40, which: 40 });
  fireEvent.keyDown(input, { key: 'ArrowRight', keyCode: 39, which: 39 });
  fireEvent.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
  expect(onChange.mock.calls[0][0]).toEqual(['a', 'b']);
});

test('controlled clear emits an empty value without overriding the supplied value', () => {
  const onChange = rstest.fn();
  const onClear = rstest.fn();
  render(
    <Cascader
      options={options}
      value={['cn', 'sh']}
      onChange={onChange}
      onClear={onClear}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(onChange.mock.calls[0][0]).toBeUndefined();
  expect(onClear).toHaveBeenCalledOnce();
  expect(screen.getByTitle('China / Shanghai')).toBeInTheDocument();
});

test.each([false, true])(
  'loads lazy children with mobile=%s',
  async (mobile) => {
    const loadData = rstest.fn();
    function Lazy() {
      const [data, setData] = useState([
        {
          value: 'cn',
          label: 'China',
          isLeaf: false,
          children: [] as { value: string; label: string }[],
        },
      ]);
      return (
        <Cascader
          mobile={mobile}
          options={data}
          defaultOpen
          loadData={(path) => {
            loadData(path);
            setData([
              {
                value: 'cn',
                label: 'China',
                isLeaf: false,
                children: [{ value: 'sh', label: 'Shanghai' }],
              },
            ]);
          }}
        />
      );
    }
    render(<Lazy />);
    fireEvent.click(await screen.findByText('China'));
    expect(await screen.findByText('Shanghai')).toBeInTheDocument();
    expect(loadData.mock.calls[0][0]).toEqual([
      expect.objectContaining({ value: 'cn' }),
    ]);
  },
);

test('Panel supports multiple values and provider disabled state', () => {
  const onChange = rstest.fn();
  const { rerender } = render(
    <Cascader.Panel options={options} multiple onChange={onChange} />,
  );
  fireEvent.click(
    screen
      .getByText('China')
      .parentElement!.querySelector('[class*="-checkbox"]')!,
  );
  expect(onChange.mock.calls[0][0]).toEqual([['cn']]);
  rerender(
    <TaoProvider disabled>
      <Cascader.Panel options={options} multiple onChange={onChange} />
    </TaoProvider>,
  );
  fireEvent.click(
    screen
      .getByText('China')
      .parentElement!.querySelector('[class*="-checkbox"]')!,
  );
  expect(onChange).toHaveBeenCalledOnce();
});

test('Panel treats explicit undefined as an empty controlled selection', () => {
  const onChange = rstest.fn();
  const view = render(
    <Cascader.Panel
      multiple
      options={options}
      value={undefined}
      defaultValue={[['cn']]}
      onChange={onChange}
    />,
  );
  expect(
    view.container.querySelector('[class*="-checkbox-checked"]'),
  ).toBeNull();
  fireEvent.click(
    screen
      .getByText('China')
      .parentElement!.querySelector('[class*="-checkbox"]')!,
  );
  expect(onChange.mock.calls[0][0]).toEqual([['cn']]);
  expect(
    view.container.querySelector('[class*="-checkbox-checked"]'),
  ).toBeNull();
});

test('forwards refs, semantics and dark portal theme', async () => {
  const ref = createRef<CascaderRef>();
  const { container } = render(
    <TaoProvider
      size="small"
      theme={{ mode: 'dark', token: { colorPrimary: '#845ef7' } }}
    >
      <Cascader
        ref={ref}
        options={options}
        defaultOpen
        classNames={({ props }) => ({
          root: props.size === 'small' ? 'small-root' : '',
          popup: { root: 'popup-root', listItem: 'custom-option' },
        })}
        styles={{ popup: { listItem: { fontWeight: 700 } } }}
        popupRender={(menus) => (
          <>
            {menus}
            <span>Footer</span>
          </>
        )}
      />
    </TaoProvider>,
  );
  act(() => ref.current?.focus());
  expect(screen.getByRole('combobox')).toHaveFocus();
  expect(container.querySelector('[data-tao-cascader]')).toHaveClass(
    'small-root',
  );
  const footer = await screen.findByText('Footer');
  expect(footer.closest('[data-tao-theme]')).toHaveAttribute(
    'data-tao-theme',
    'dark',
  );
  expect(document.querySelector('.custom-option')).toHaveStyle({
    fontWeight: '700',
  });
});

test('maps the public middle size alias to the shared medium control', () => {
  const { container } = render(<Cascader size="middle" />);
  expect(container.querySelector('[data-tao-cascader]')).toHaveAttribute(
    'data-tao-size',
    'medium',
  );
});

test('Cascader Done cannot restore a selection that the parent replaced while open', async () => {
  const changed = rstest.fn();
  const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Gamma' },
  ];
  const props = {
    open: true,
    mobile: true,
    multiple: true as const,
    options,
    onChange: changed,
  };
  const view = render(<Cascader {...props} value={[['a']]} />);
  const dialog = await screen.findByRole('dialog');
  const beta = within(dialog).getByText('Beta');
  fireEvent.click(beta.parentElement!.querySelector('[class*="-checkbox"]')!);
  view.rerender(<Cascader {...props} value={[['c']]} />);
  fireEvent.click(within(dialog).getByRole('button', { name: 'Done' }));
  expect(changed).not.toHaveBeenCalled();
});
