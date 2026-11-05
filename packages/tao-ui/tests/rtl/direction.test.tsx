import { Popover } from '../../src/components/popover/popover';
import { Segmented } from '../../src/components/segmented/segmented';
import { Table } from '../../src/components/table/table';
import { expect, rstest, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Cascader,
  type CascaderRef,
} from '../../src/components/cascader/cascader';
import { Rate } from '../../src/components/rate/rate';
import { Select } from '../../src/components/select/select';
import { Slider } from '../../src/components/slider/slider';
import {
  TaoPortalScope,
  TaoProvider,
  useTaoConfig,
} from '../../src/provider/tao-provider';

function PortalProbe() {
  const { direction } = useTaoConfig();
  return createPortal(
    <TaoPortalScope>
      <span data-testid="portal">{direction}</span>
    </TaoPortalScope>,
    document.body,
  );
}

test('provider direction reaches body portals and updates with nested overrides', () => {
  const { rerender } = render(
    <TaoProvider direction="rtl">
      <PortalProbe />
    </TaoProvider>,
  );
  expect(screen.getByTestId('portal').textContent).toBe('rtl');
  expect(screen.getByTestId('portal').closest('[dir]')).toHaveAttribute(
    'dir',
    'rtl',
  );
  rerender(
    <TaoProvider direction="rtl">
      <TaoProvider direction="ltr">
        <PortalProbe />
      </TaoProvider>
    </TaoProvider>,
  );
  expect(screen.getByTestId('portal').textContent).toBe('ltr');
  expect(screen.getByTestId('portal').closest('[dir]')).toHaveAttribute(
    'dir',
    'ltr',
  );
});

test('a local DOM direction overrides an outer provider and follows attribute changes', async () => {
  const { container } = render(
    <TaoProvider direction="rtl">
      <div dir="ltr" style={{ direction: 'ltr' }} data-testid="local">
        <Select options={[{ value: 'a', label: 'Alpha' }]} defaultOpen />
      </div>
    </TaoProvider>,
  );
  expect(screen.getByRole('combobox', { hidden: true })).toHaveAttribute(
    'dir',
    'ltr',
  );
  expect(document.querySelector('[data-tao-select-content]')).toHaveAttribute(
    'dir',
    'ltr',
  );
  act(() => {
    const local = screen.getByTestId('local');
    local.setAttribute('dir', 'rtl');
    local.style.direction = 'rtl';
  });
  await waitFor(() =>
    expect(screen.getByRole('combobox', { hidden: true })).toHaveAttribute(
      'dir',
      'rtl',
    ),
  );
  expect(document.querySelector('[data-tao-select-content]')).toHaveAttribute(
    'dir',
    'rtl',
  );
  expect(container.querySelector('[data-tao-provider]')).toHaveAttribute(
    'dir',
    'rtl',
  );
});

test('explicit engine direction overrides DOM inheritance without losing imperative refs', () => {
  const ref = createRef<CascaderRef>();
  const { container } = render(
    <div dir="rtl">
      <Slider direction="ltr" defaultValue={25} />
      <Cascader
        ref={ref}
        direction="ltr"
        options={[{ value: 'a', label: 'Alpha' }]}
      />
    </div>,
  );
  expect(container.querySelector('[data-tao-slider]')).toHaveAttribute(
    'dir',
    'ltr',
  );
  expect(container.querySelector('[data-tao-cascader]')).toHaveAttribute(
    'dir',
    'ltr',
  );
  act(() => ref.current?.focus());
  expect(ref.current?.nativeElement.contains(document.activeElement)).toBe(
    true,
  );
});

test.each(['inherited', 'explicit'] as const)(
  'Rate keeps %s RTL layout and keyboard value in agreement',
  (mode) => {
    const change = rstest.fn();
    render(
      <div
        dir={mode === 'inherited' ? 'rtl' : 'ltr'}
        style={{ direction: mode === 'inherited' ? 'rtl' : 'ltr' }}
      >
        <Rate
          direction={mode === 'explicit' ? 'rtl' : undefined}
          defaultValue={2}
          onChange={change}
        />
      </div>,
    );
    const rating = screen.getByRole('radiogroup');
    expect(rating.closest('[dir]')).toHaveAttribute('dir', 'rtl');
    fireEvent.keyDown(rating, { key: 'ArrowRight', keyCode: 39 });
    expect(change).toHaveBeenLastCalledWith(1);
  },
);

test('a trigger-local direction reaches its popup and updates dynamically', async () => {
  const { rerender } = render(
    <Popover open content="Local popup">
      <button type="button" style={{ direction: 'rtl' }}>
        Trigger
      </button>
    </Popover>,
  );
  expect(screen.getByText('Local popup').closest('[dir]')).toHaveAttribute(
    'dir',
    'rtl',
  );
  rerender(
    <Popover open content="Local popup">
      <button type="button" style={{ direction: 'ltr' }}>
        Trigger
      </button>
    </Popover>,
  );
  await waitFor(() =>
    expect(screen.getByText('Local popup').closest('[dir]')).toHaveAttribute(
      'dir',
      'ltr',
    ),
  );
});

test('Segmented preserves native auto direction unless direction is explicitly overridden', () => {
  const { container, rerender } = render(
    <Segmented dir="auto" options={['مرحبا', 'بكم']} />,
  );
  expect(container.querySelector('[data-tao-segmented]')).toHaveAttribute(
    'dir',
    'auto',
  );
  rerender(<Segmented dir="auto" direction="ltr" options={['مرحبا', 'بكم']} />);
  expect(container.querySelector('[data-tao-segmented]')).toHaveAttribute(
    'dir',
    'ltr',
  );
});

test('fixed table columns follow direction on the component root', async () => {
  const columns = [
    {
      key: 'name',
      dataIndex: 'name',
      title: 'Name',
      width: 100,
      fixed: 'left' as const,
    },
    { key: 'detail', dataIndex: 'detail', title: 'Detail', width: 700 },
  ];
  const { container, rerender } = render(
    <Table
      style={{ direction: 'rtl' }}
      columns={columns}
      dataSource={[{ key: '1', name: 'One', detail: 'Detail' }]}
      scroll={{ x: 800 }}
      pagination={false}
    />,
  );
  const firstHeader = container.querySelector('th')!;
  expect(firstHeader.style.right).toBe('0px');
  rerender(
    <Table
      style={{ direction: 'ltr' }}
      columns={columns}
      dataSource={[{ key: '1', name: 'One', detail: 'Detail' }]}
      scroll={{ x: 800 }}
      pagination={false}
    />,
  );
  await waitFor(() => expect(firstHeader.style.left).toBe('0px'));
  expect(firstHeader.style.right).toBe('');
});
