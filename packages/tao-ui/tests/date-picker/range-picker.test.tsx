import { readFileSync } from 'node:fs';
import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import dayjs from 'dayjs';
import { RangePicker } from '../../src/components/date-picker/range-picker';
import { TaoProvider, zhCN } from '../../src/provider/tao-provider';

test('range calendar uses provider language in its drawer and navigation', () => {
  render(
    <TaoProvider locale={zhCN}>
      <RangePicker
        mobile
        open
        defaultValue={[dayjs('2026-06-10'), dayjs('2026-06-20')]}
      />
    </TaoProvider>,
  );
  expect(
    screen.getByRole('dialog', { name: '选择日期范围' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '上个月' })).toBeInTheDocument();
  expect(screen.getByRole('grid', { name: '2026年6月' })).toBeInTheDocument();
  expect(
    screen.getAllByRole('columnheader', { name: '一' }).length,
  ).toBeGreaterThan(0);
});
import { Form } from '../../src/components/form';

test('renders with placeholder', () => {
  render(<RangePicker mobile={false} />);
  const inputs = screen.getAllByRole('combobox');
  expect(inputs[0]).toHaveAttribute('placeholder', 'Start date');
  expect(inputs[1]).toHaveAttribute('placeholder', 'End date');
});

test('displays formatted range values', () => {
  render(
    <RangePicker
      mobile={false}
      value={[dayjs('2026-06-01'), dayjs('2026-06-15')]}
    />,
  );
  const inputs = screen.getAllByRole('combobox');
  expect(inputs[0]).toHaveValue('2026-06-01');
  expect(inputs[1]).toHaveValue('2026-06-15');
});

test.each([
  { index: 0, text: '2025-07-25', edge: 'start' },
  { index: 1, text: '2027-07-25', edge: 'end' },
])(
  'typing the $edge date previews its month and range edge before committing',
  async ({ index, text, edge }) => {
    const onChange = rstest.fn();
    render(
      <RangePicker
        mobile={false}
        defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-15')]}
        onChange={onChange}
      />,
    );
    const input = screen.getAllByRole('combobox')[index];
    await userEvent.clear(input);
    await userEvent.type(input, text);
    expect(screen.getByRole('button', { name: text })).toHaveAttribute(
      `data-tao-range-${edge}`,
    );
    expect(input).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(onChange.mock.calls.at(-1)?.[1][index]).toBe(text);
  },
);

test('shows separator', () => {
  render(<RangePicker separator="→" />);
  expect(screen.getByText('→')).toBeTruthy();
});

test('range content aligns to the start without excess leading space', () => {
  const css = readFileSync(
    'src/components/date-picker/date-picker.css',
    'utf8',
  );
  const rule = css.match(/\[data-tao-range-input\] \{([^}]+)\}/)?.[1];

  expect(rule).toContain('text-align: start;');
});

test('clicking the other RangePicker input keeps the open calendar available', async () => {
  const opened: boolean[] = [];
  render(
    <RangePicker
      mobile={false}
      defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-15')]}
      onOpenChange={(open) => opened.push(open)}
    />,
  );
  const [start, end] = screen.getAllByRole('combobox');
  await userEvent.click(start);
  await screen.findByRole('dialog');
  await userEvent.click(end);
  expect(end).toHaveFocus();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(opened).toEqual([true]);
});

test('click opens dual calendar panels', async () => {
  render(<RangePicker mobile={false} />);
  await userEvent.click(screen.getAllByRole('combobox')[0]);
  // Should have 2 calendar grids
  const grids = screen.getAllByRole('grid');
  expect(grids.length).toBe(2);
});

test('closing cancels an unfinished calendar range selection', async () => {
  let changeCount = 0;
  const view = render(
    <RangePicker
      mobile={false}
      open
      defaultValue={[dayjs('2026-06-15'), null]}
      onChange={() => {
        changeCount += 1;
      }}
    />,
  );

  await userEvent.click(
    screen.getAllByRole('button', { name: '2026-06-18' })[0],
  );
  view.rerender(
    <RangePicker
      mobile={false}
      open={false}
      defaultValue={[dayjs('2026-06-15'), null]}
      onChange={() => {
        changeCount += 1;
      }}
    />,
  );
  view.rerender(
    <RangePicker
      mobile={false}
      open
      defaultValue={[dayjs('2026-06-15'), null]}
      onChange={() => {
        changeCount += 1;
      }}
    />,
  );
  await userEvent.click(
    screen.getAllByRole('button', { name: '2026-06-20' })[0],
  );

  expect(changeCount).toBe(0);
});

test('external value updates cancel an unfinished range selection', async () => {
  let changeCount = 0;
  const onChange = () => {
    changeCount += 1;
  };
  const view = render(
    <RangePicker
      mobile={false}
      open
      value={[dayjs('2026-06-01'), dayjs('2026-06-10')]}
      onChange={onChange}
    />,
  );

  await userEvent.click(
    screen.getAllByRole('button', { name: '2026-06-18' })[0],
  );
  view.rerender(
    <RangePicker
      mobile={false}
      open
      value={[dayjs('2026-07-01'), dayjs('2026-07-10')]}
      onChange={onChange}
    />,
  );
  await userEvent.click(
    screen.getAllByRole('button', { name: '2026-07-20' })[0],
  );

  expect(changeCount).toBe(0);
});

test('Form can clear a range with undefined after user entry without remounting', async () => {
  function Demo() {
    const [form] = Form.useForm();
    return (
      <>
        <Form form={form}>
          <Form.Item name="dates">
            <RangePicker mobile={false} />
          </Form.Item>
        </Form>
        <button
          type="button"
          onClick={() => form.setFieldsValue({ dates: undefined })}
        >
          Clear field
        </button>
      </>
    );
  }
  render(<Demo />);
  const [start, end] = screen.getAllByRole('combobox');
  await userEvent.type(start, '2026-06-01{Enter}');
  await userEvent.type(end, '2026-06-15{Enter}');
  expect(start).toHaveValue('2026-06-01');
  expect(end).toHaveValue('2026-06-15');
  await userEvent.click(screen.getByRole('button', { name: 'Clear field' }));
  expect(screen.getAllByRole('combobox')).toEqual([start, end]);
  expect(start).toHaveValue('');
  expect(end).toHaveValue('');
});

test('PC inputs accept a typed range with strict formatting', async () => {
  let result: [string, string] = ['', ''];
  render(
    <RangePicker
      mobile={false}
      value={[null, dayjs('2026-07-31')]}
      onChange={(_, dateStrings) => {
        result = dateStrings;
      }}
    />,
  );

  await userEvent.type(screen.getAllByRole('combobox')[0], '2026-07-01{Enter}');

  expect(result).toEqual(['2026-07-01', '2026-07-31']);
});

test('PC inputs reject invalid dates', async () => {
  let changeCount = 0;
  render(
    <RangePicker
      mobile={false}
      onChange={() => {
        changeCount += 1;
      }}
    />,
  );

  const input = screen.getAllByRole('combobox')[0];
  await userEvent.type(input, '2026-02-31{Enter}');

  expect(changeCount).toBe(0);
  expect(input).toHaveValue('');
});

test('mobile trigger remains a button', () => {
  render(<RangePicker mobile />);
  expect(screen.getByRole('button')).toBeTruthy();
  expect(screen.queryByRole('combobox')).toBeNull();
});

test('clearing the range does not commit pending text first', async () => {
  const onChange = rstest.fn();
  render(
    <RangePicker
      mobile={false}
      defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-15')]}
      onChange={onChange}
    />,
  );
  const start = screen.getAllByRole('combobox')[0];
  await userEvent.click(start);
  fireEvent.change(start, { target: { value: '2026-06-05' } });
  await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith(null, ['', '']);
});

test('clear button resets range', async () => {
  let cleared = false;
  const { container } = render(
    <RangePicker
      value={[dayjs('2026-06-01'), dayjs('2026-06-15')]}
      allowClear
      onChange={(d) => {
        if (d === null) cleared = true;
      }}
    />,
  );
  const trigger = container.querySelector('[data-tao-range-trigger]')!;
  await userEvent.hover(trigger);
  await userEvent.click(screen.getByLabelText('Clear'));
  expect(cleared).toBe(true);
});

test('presets render in range picker', async () => {
  render(
    <RangePicker
      mobile={false}
      presets={[
        {
          label: 'This week',
          value: [dayjs().startOf('week'), dayjs().endOf('week')],
        },
      ]}
    />,
  );
  await userEvent.click(screen.getAllByRole('combobox')[0]);
  expect(screen.getByText('This week')).toBeTruthy();
});

test('applies semantic classes and styles to desktop parts', () => {
  const { container } = render(
    <RangePicker
      mobile={false}
      open
      className="consumer-root"
      style={{ width: 480 }}
      classNames={{
        root: 'semantic-root',
        input: 'semantic-input',
        separator: 'semantic-separator',
        popup: 'semantic-popup',
        calendar: 'semantic-calendar',
        cell: 'semantic-cell',
      }}
      styles={{
        root: { maxWidth: 640 },
        input: { color: 'red' },
        separator: { opacity: 0.8 },
        popup: { minWidth: 560 },
        calendar: { tableLayout: 'fixed' },
        cell: { opacity: 0.9 },
      }}
    />,
  );

  const root = container.querySelector(
    '[data-tao-range-trigger]',
  ) as HTMLElement;
  expect(root).toHaveClass('consumer-root', 'semantic-root');
  expect(root).toHaveStyle({ width: '480px', maxWidth: '640px' });
  expect(screen.getAllByRole('combobox')[0]).toHaveClass('semantic-input');
  expect(container.querySelector('.semantic-separator')).toHaveStyle({
    opacity: '0.8',
  });
  expect(document.querySelector('.semantic-popup')).toHaveStyle({
    minWidth: '560px',
  });
  expect(document.querySelector('.semantic-calendar')).toHaveStyle({
    tableLayout: 'fixed',
  });
  expect(document.querySelector('.semantic-cell')).toHaveStyle({
    opacity: '0.9',
  });
});

test('applies popup semantic customization in the mobile drawer', () => {
  render(
    <RangePicker
      mobile
      open
      classNames={{ popup: 'semantic-mobile-popup' }}
      styles={{ popup: { minWidth: 560 } }}
    />,
  );
  expect(document.querySelector('.semantic-mobile-popup')).toHaveStyle({
    minWidth: '560px',
  });
});

test.each([
  { position: 0, text: '2026-06-02' },
  { position: 1, text: '2026-06-14' },
  { position: 0, text: '' },
  { position: 1, text: '' },
])(
  'controlled ranges restore rejected input after blur (%#)',
  ({ position, text }) => {
    const onChange = rstest.fn();
    render(
      <RangePicker
        mobile={false}
        value={[dayjs('2026-06-01'), dayjs('2026-06-15')]}
        onChange={onChange}
      />,
    );
    const input = screen.getAllByRole('combobox')[position];
    fireEvent.change(input, { target: { value: text } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls.at(-1)?.[1][position]).toBe(text);
    expect(input).toHaveValue(position === 0 ? '2026-06-01' : '2026-06-15');
  },
);

test('Enter followed by blur does not resubmit a rejected range value', () => {
  const onChange = rstest.fn();
  render(
    <RangePicker
      mobile={false}
      value={[null, dayjs('2026-07-31')]}
      onChange={onChange}
    />,
  );
  const input = screen.getAllByRole('combobox')[0];
  fireEvent.change(input, { target: { value: '2026-07-01' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  fireEvent.blur(input);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][1]).toEqual(['2026-07-01', '2026-07-31']);
  expect(input).toHaveValue('');
});

test('uncontrolled range edits replace default values on blur', () => {
  const onChange = rstest.fn();
  render(
    <RangePicker
      mobile={false}
      defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-15')]}
      onChange={onChange}
    />,
  );
  const [start, end] = screen.getAllByRole('combobox');
  fireEvent.change(start, { target: { value: '2026-06-02' } });
  fireEvent.blur(start);
  expect(start).toHaveValue('2026-06-02');
  expect(end).toHaveValue('2026-06-15');
  expect(onChange.mock.calls.at(-1)?.[1]).toEqual(['2026-06-02', '2026-06-15']);
});

test.each(['start', 'end'] as const)(
  'disabled %s endpoint stays fixed while the other input is editable',
  async (position) => {
    const onChange = rstest.fn();
    render(
      <RangePicker
        mobile={false}
        disabled={position === 'start' ? [true, false] : [false, true]}
        defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-30')]}
        onChange={onChange}
      />,
    );
    const inputs = screen.getAllByRole('combobox');
    expect(inputs[position === 'start' ? 0 : 1]).toBeDisabled();
    const editable = inputs[position === 'start' ? 1 : 0];
    await userEvent.clear(editable);
    await userEvent.type(editable, '2026-06-15');
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.anything(),
      position === 'start'
        ? ['2026-06-01', '2026-06-15']
        : ['2026-06-15', '2026-06-30'],
    );
  },
);

test.each([
  { position: 'start', action: 'clear' },
  { position: 'end', action: 'clear' },
  { position: 'start', action: 'calendar' },
  { position: 'end', action: 'calendar' },
  { position: 'start', action: 'preset' },
  { position: 'end', action: 'preset' },
] as const)(
  '$action preserves the disabled $position endpoint',
  async ({ position, action }) => {
    const onChange = rstest.fn();
    render(
      <RangePicker
        mobile={false}
        open={action !== 'clear'}
        disabled={position === 'start' ? [true, false] : [false, true]}
        defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-30')]}
        onChange={onChange}
        presets={[
          {
            label: 'Middle range',
            value: [dayjs('2026-06-10'), dayjs('2026-06-20')],
          },
        ]}
      />,
    );
    if (action === 'clear')
      await userEvent.click(screen.getByRole('button', { name: /Clear/ }));
    else if (action === 'calendar')
      await userEvent.click(
        screen.getAllByRole('button', { name: '2026-06-15', exact: true })[0],
      );
    else
      await userEvent.click(
        screen.getByRole('button', { name: 'Middle range' }),
      );
    const next =
      action === 'clear'
        ? ''
        : action === 'calendar'
          ? '2026-06-15'
          : position === 'start'
            ? '2026-06-20'
            : '2026-06-10';
    expect(onChange).toHaveBeenLastCalledWith(
      expect.anything(),
      position === 'start' ? ['2026-06-01', next] : [next, '2026-06-30'],
    );
  },
);

test.each(['start', 'end'] as const)(
  'calendar and presets cannot cross the disabled %s endpoint',
  async (position) => {
    const onChange = rstest.fn();
    render(
      <RangePicker
        mobile={false}
        open
        disabled={position === 'start' ? [true, false] : [false, true]}
        defaultValue={[dayjs('2026-06-10'), dayjs('2026-06-20')]}
        onChange={onChange}
        presets={[
          {
            label: 'Outside range',
            value:
              position === 'start'
                ? [dayjs('2026-06-01'), dayjs('2026-06-05')]
                : [dayjs('2026-06-25'), dayjs('2026-06-30')],
          },
        ]}
      />,
    );
    const day = screen.getAllByRole('button', {
      name: position === 'start' ? '2026-06-05' : '2026-06-25',
      exact: true,
    })[0];
    expect(day).toBeDisabled();
    await userEvent.click(
      screen.getByRole('button', { name: 'Outside range' }),
    );
    expect(onChange).not.toHaveBeenCalled();
  },
);

test('mobile range opens on the editable endpoint when the start is disabled', () => {
  render(
    <RangePicker
      mobile
      open
      disabled={[true, false]}
      value={[dayjs('2026-06-01'), dayjs('2026-09-20')]}
    />,
  );
  expect(screen.getByRole('button', { name: '2026-09-20' })).toHaveAttribute(
    'data-tao-range-end',
  );
});

test.each(['start', 'end'] as const)(
  'mobile calendar changes only the editable endpoint with %s disabled',
  async (position) => {
    const onChange = rstest.fn();
    render(
      <RangePicker
        mobile
        open
        disabled={position === 'start' ? [true, false] : [false, true]}
        defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-30')]}
        onChange={onChange}
      />,
    );
    await userEvent.click(
      screen.getAllByRole('button', { name: '2026-06-15', exact: true })[0],
    );
    expect(onChange).toHaveBeenLastCalledWith(
      expect.anything(),
      position === 'start'
        ? ['2026-06-01', '2026-06-15']
        : ['2026-06-15', '2026-06-30'],
    );
  },
);

test.each([
  {
    name: 'minDate',
    start: '2026-01-01',
    end: '2026-01-20',
    props: { minDate: dayjs('2026-01-10') },
  },
  {
    name: 'maxDate',
    start: '2026-01-10',
    end: '2026-01-31',
    props: { maxDate: dayjs('2026-01-25') },
  },
  {
    name: 'disabledDate',
    start: '2026-01-10',
    end: '2026-01-20',
    props: { disabledDate: (date: dayjs.Dayjs) => date.date() === 20 },
  },
  { name: 'invalid date', start: 'invalid', end: '2026-01-20', props: {} },
  {
    name: 'reversed endpoints',
    start: '2026-01-20',
    end: '2026-01-10',
    props: {},
  },
])(
  'range presets reject $name without changing or closing the picker',
  async ({ start, end, props }) => {
    const onChange = rstest.fn();
    const onOpenChange = rstest.fn();
    render(
      <RangePicker
        mobile={false}
        open
        defaultValue={[dayjs('2026-01-10'), dayjs('2026-01-15')]}
        {...props}
        presets={[
          { label: 'Blocked range', value: [dayjs(start), dayjs(end)] },
        ]}
        onChange={onChange}
        onOpenChange={onOpenChange}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Blocked range' }),
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getAllByRole('combobox')[0]).toHaveValue('2026-01-10');
    expect(screen.getAllByRole('combobox')[1]).toHaveValue('2026-01-15');
  },
);

test.each(['start', 'end'] as const)(
  'preset validation preserves an existing disabled %s outside new boundaries',
  async (position) => {
    const onChange = rstest.fn();
    render(
      <RangePicker
        mobile={false}
        open
        disabled={position === 'start' ? [true, false] : [false, true]}
        defaultValue={[dayjs('2026-01-01'), dayjs('2026-01-31')]}
        minDate={dayjs('2026-01-10')}
        maxDate={dayjs('2026-01-20')}
        presets={[
          {
            label: 'Editable endpoint',
            value:
              position === 'start'
                ? [dayjs('invalid'), dayjs('2026-01-15')]
                : [dayjs('2026-01-15'), dayjs('invalid')],
          },
        ]}
        onChange={onChange}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Editable endpoint' }),
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.anything(),
      position === 'start'
        ? ['2026-01-01', '2026-01-15']
        : ['2026-01-15', '2026-01-31'],
    );
  },
);

test.each(['start', 'end'] as const)(
  'reopening a controlled range locates its updated %s value',
  (position) => {
    const original: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [
      dayjs('2025-01-10'),
      dayjs('2025-01-20'),
    ];
    const next: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [
      position === 'start' ? dayjs('2026-09-10') : null,
      dayjs('2026-09-20'),
    ];
    const { rerender } = render(
      <RangePicker mobile={false} open={false} value={original} />,
    );
    rerender(<RangePicker mobile={false} open={false} value={next} />);
    rerender(<RangePicker mobile={false} open value={next} />);
    expect(
      screen.getAllByRole('button', { name: '2026-09-20', exact: true }).length,
    ).toBeGreaterThan(0);
  },
);

test('range value updates and parent rerenders do not interrupt navigation while open', async () => {
  const value: [dayjs.Dayjs, dayjs.Dayjs] = [
    dayjs('2026-01-10'),
    dayjs('2026-01-20'),
  ];
  const onChange = rstest.fn();
  const { rerender } = render(
    <RangePicker mobile={false} open value={value} onChange={onChange} />,
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Next month', exact: true }),
  );
  expect(screen.getByText('Feb 2026')).toBeTruthy();
  rerender(
    <RangePicker
      mobile={false}
      open
      value={[dayjs('2026-01-10'), dayjs('2026-01-20')]}
      onChange={onChange}
    />,
  );
  expect(screen.getByText('Feb 2026')).toBeTruthy();
  rerender(
    <RangePicker
      mobile={false}
      open
      value={[dayjs('2026-09-10'), dayjs('2026-09-20')]}
      onChange={onChange}
    />,
  );
  expect(screen.getByText('Feb 2026')).toBeTruthy();
  expect(onChange).not.toHaveBeenCalled();
});
