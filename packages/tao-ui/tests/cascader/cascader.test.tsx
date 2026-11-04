import { expect, rstest, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createRef, useState } from 'react';
import {
  Cascader,
  type CascaderRef,
} from '../../src/components/cascader/cascader';
import { TaoProvider } from '../../src/provider/tao-provider';

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

test('loads lazy children and shows loading state until new options arrive', async () => {
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
});

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
