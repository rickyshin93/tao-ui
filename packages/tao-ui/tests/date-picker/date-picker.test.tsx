import { expect, rstest, test } from '@rstest/core';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import dayjs from 'dayjs';
import { DatePicker } from '../../src/components/date-picker/date-picker';
import { Form } from '../../src/components/form';
import { TaoProvider, zhCN } from '../../src/provider/tao-provider';

test('date and time controls use provider language', async () => {
  render(
    <TaoProvider locale={zhCN}>
      <DatePicker mobile open showTime value={dayjs('2026-06-10')} />
    </TaoProvider>,
  );
  expect(
    screen.getByRole('dialog', { name: '选择日期和时间' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '确定' })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: '时' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '6月' }));
  expect(screen.getByRole('button', { name: '12月' })).toBeInTheDocument();
});

test('renders with placeholder', () => {
  render(<DatePicker />);
  expect(screen.getByRole('combobox')).toHaveAttribute(
    'placeholder',
    'YYYY-MM-DD',
  );
});

test('renders custom placeholder', () => {
  render(<DatePicker placeholder="Pick a date" />);
  expect(screen.getByRole('combobox')).toHaveAttribute(
    'placeholder',
    'Pick a date',
  );
});

test('displays formatted value', () => {
  render(<DatePicker value={dayjs('2026-06-15')} />);
  expect(screen.getByRole('combobox')).toHaveValue('2026-06-15');
});

test('defaultValue seeds an uncontrolled picker', () => {
  render(<DatePicker defaultValue={dayjs('2026-06-15')} />);
  expect(screen.getByRole('combobox')).toHaveValue('2026-06-15');
});

test('uncontrolled selection updates the displayed value', async () => {
  render(<DatePicker defaultValue={dayjs('2026-06-15')} />);
  await userEvent.click(screen.getByRole('combobox'));
  await userEvent.click(screen.getByRole('button', { name: '2026-06-20' }));
  expect(screen.getByRole('combobox')).toHaveValue('2026-06-20');
});

test('Form can clear a date with undefined after the first user selection without remounting', async () => {
  function Demo() {
    const [form] = Form.useForm();
    return (
      <>
        <Form form={form}>
          <Form.Item name="date">
            <DatePicker mobile={false} />
          </Form.Item>
        </Form>
        <button
          type="button"
          onClick={() => form.setFieldsValue({ date: undefined })}
        >
          Clear field
        </button>
      </>
    );
  }
  render(<Demo />);
  const input = screen.getByRole('combobox');
  await userEvent.type(input, '2026-06-15{Enter}');
  expect(input).toHaveValue('2026-06-15');
  await userEvent.click(screen.getByRole('button', { name: 'Clear field' }));
  expect(screen.getByRole('combobox')).toBe(input);
  expect(input).toHaveValue('');
});

test('controlled input restores the value when its change is rejected', async () => {
  let result = '';
  render(
    <DatePicker
      mobile={false}
      value={dayjs('2026-06-15')}
      onChange={(_, dateString) => {
        result = dateString;
      }}
    />,
  );

  const input = screen.getByRole('combobox');
  await userEvent.clear(input);
  await userEvent.type(input, '2026-06-20{Enter}');

  expect(result).toBe('2026-06-20');
  expect(input).toHaveValue('2026-06-15');
});

test('typing previews the date and time without committing or stealing focus', async () => {
  const onChange = rstest.fn();
  render(
    <DatePicker
      mobile={false}
      showTime
      defaultValue={dayjs('2026-06-15')}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('combobox');
  await userEvent.clear(input);
  await userEvent.type(input, '2027-07-25 13:24:35');
  expect(screen.getByRole('button', { name: '2027-07-25' })).toHaveAttribute(
    'data-tao-selected',
  );
  expect(
    within(screen.getByRole('group', { name: 'Hour' })).getByRole('button', {
      name: '13',
    }),
  ).toHaveAttribute('aria-pressed', 'true');
  expect(input).toHaveFocus();
  expect(onChange).not.toHaveBeenCalled();
  await userEvent.click(
    within(screen.getByRole('group', { name: 'Minute' })).getByRole('button', {
      name: '30',
    }),
  );
  expect(onChange.mock.calls.at(-1)?.[1]).toBe('2027-07-25 13:30:35');
});

test.each(['2027-07', '2026-02-31', '2027-07-25'])(
  'incomplete, invalid or blocked input %s does not move the calendar',
  async (text) => {
    render(
      <DatePicker
        mobile={false}
        defaultValue={dayjs('2026-06-15')}
        maxDate={dayjs('2026-12-31')}
      />,
    );
    const input = screen.getByRole('combobox');
    await userEvent.clear(input);
    await userEvent.type(input, text);
    expect(screen.getByRole('button', { name: '2026-06-15' })).toHaveAttribute(
      'data-tao-selected',
    );
  },
);

test('PC trigger accepts a typed date and commits it with Enter', async () => {
  let result: string | null = null;
  render(
    <DatePicker
      mobile={false}
      onChange={(_, dateString) => {
        result = dateString;
      }}
    />,
  );

  await userEvent.type(screen.getByRole('combobox'), '2026-07-25{Enter}');

  expect(result).toBe('2026-07-25');
});

test('PC trigger rejects a typed date that does not match the format', async () => {
  let changeCount = 0;
  render(
    <DatePicker
      mobile={false}
      onChange={() => {
        changeCount += 1;
      }}
    />,
  );

  const input = screen.getByRole('combobox');
  await userEvent.type(input, '2026-02-31{Enter}');

  expect(changeCount).toBe(0);
  expect(input).toHaveValue('');
});

test('mobile trigger remains a button', () => {
  render(<DatePicker mobile />);
  expect(screen.getByRole('button')).toBeTruthy();
  expect(screen.queryByRole('combobox')).toBeNull();
});

test('picker=month shows month format', () => {
  render(<DatePicker picker="month" value={dayjs('2026-06-01')} />);
  expect(screen.getByRole('combobox')).toHaveValue('2026-06');
});

test('picker=year shows year format', () => {
  render(<DatePicker picker="year" value={dayjs('2026-01-01')} />);
  expect(screen.getByRole('combobox')).toHaveValue('2026');
});

test('click trigger opens popover with calendar', async () => {
  render(<DatePicker />);
  await userEvent.click(screen.getByRole('combobox'));
  expect(screen.getByRole('grid')).toBeTruthy(); // calendar table
});

test('calendar exposes one date in the tab order', async () => {
  render(<DatePicker value={dayjs('2026-06-15')} />);
  await userEvent.click(screen.getByRole('combobox'));

  const day15 = screen.getByRole('button', { name: '2026-06-15' });
  const tabbableDays = screen
    .getAllByRole('button')
    .filter((button) => button.hasAttribute('data-tao-calendar-cell-button'))
    .filter((button) => button.tabIndex === 0);

  expect(tabbableDays).toHaveLength(1);
  expect(tabbableDays[0]).toBe(day15);
});

test('selecting a date triggers onChange', async () => {
  let result: string | null = null;
  const { container } = render(
    <DatePicker
      value={dayjs('2026-06-15')}
      onChange={(_, str) => {
        result = str;
      }}
    />,
  );
  await userEvent.click(container.querySelector('[data-tao-picker-trigger]')!);
  const cell20 = screen.getByText('20');
  await userEvent.click(cell20);
  expect(result).toBe('2026-06-20');
});

test('allowClear shows clear button on hover', async () => {
  const { container } = render(
    <DatePicker value={dayjs('2026-06-15')} allowClear />,
  );
  const trigger = container.querySelector('[data-tao-picker-trigger]')!;
  await userEvent.hover(trigger);
  expect(screen.getByLabelText('Clear')).toBeTruthy();
});

test('clearing a focused DatePicker does not commit pending text first', async () => {
  const changes: (string | null)[] = [];
  render(
    <DatePicker
      mobile={false}
      defaultValue={dayjs('2026-06-15')}
      onChange={(date) => changes.push(date?.format('YYYY-MM-DD') ?? null)}
    />,
  );
  const input = screen.getByRole('combobox');
  act(() => input.focus());
  fireEvent.change(input, { target: { value: '2026-06-20' } });
  await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(changes).toEqual([null]);
});

test('clear button resets value', async () => {
  let cleared = false;
  const { container } = render(
    <DatePicker
      value={dayjs('2026-06-15')}
      allowClear
      onChange={(d) => {
        if (d === null) cleared = true;
      }}
    />,
  );
  const trigger = container.querySelector('[data-tao-picker-trigger]')!;
  await userEvent.hover(trigger);
  await userEvent.click(screen.getByLabelText('Clear'));
  expect(cleared).toBe(true);
});

test('inherits size from TaoProvider', () => {
  render(
    <TaoProvider size="small">
      <DatePicker />
    </TaoProvider>,
  );
  expect(
    screen.getByRole('combobox').closest('[data-tao-picker-trigger]'),
  ).toHaveAttribute('data-tao-size', 'small');
});

test('disabled prevents opening', async () => {
  render(<DatePicker disabled />);
  expect(screen.getByRole('combobox')).toBeDisabled();
});

test('presets render as buttons', async () => {
  render(
    <DatePicker
      presets={[
        { label: 'Today', value: dayjs() },
        { label: 'Yesterday', value: dayjs().subtract(1, 'day') },
      ]}
    />,
  );
  await userEvent.click(screen.getByRole('combobox'));
  expect(screen.getByText('Today')).toBeTruthy();
  expect(screen.getByText('Yesterday')).toBeTruthy();
});

test('applies semantic classes and styles to desktop parts', () => {
  const { container } = render(
    <DatePicker
      mobile={false}
      open
      showTime
      className="consumer-root"
      style={{ width: 320 }}
      classNames={{
        root: 'semantic-root',
        input: 'semantic-input',
        popup: 'semantic-popup',
        calendar: 'semantic-calendar',
        cell: 'semantic-cell',
        footer: 'semantic-footer',
      }}
      styles={{
        root: { maxWidth: 640 },
        input: { color: 'red' },
        popup: { minWidth: 280 },
        calendar: { tableLayout: 'fixed' },
        cell: { opacity: 0.9 },
        footer: { justifyContent: 'start' },
      }}
    />,
  );

  const root = container.querySelector(
    '[data-tao-picker-trigger]',
  ) as HTMLElement;
  expect(root).toHaveClass('consumer-root', 'semantic-root');
  expect(root).toHaveStyle({ width: '320px', maxWidth: '640px' });
  expect(screen.getByRole('combobox')).toHaveClass('semantic-input');
  expect(document.querySelector('.semantic-popup')).toHaveStyle({
    minWidth: '280px',
  });
  expect(document.querySelector('.semantic-calendar')).toHaveStyle({
    tableLayout: 'fixed',
  });
  expect(document.querySelector('.semantic-cell')).toHaveStyle({
    opacity: '0.9',
  });
  expect(document.querySelector('.semantic-footer')).toHaveStyle({
    justifyContent: 'start',
  });
});

test('applies popup semantic customization in the mobile drawer', () => {
  render(
    <DatePicker
      mobile
      open
      classNames={{ popup: 'semantic-mobile-popup' }}
      styles={{ popup: { minWidth: 280 } }}
    />,
  );
  expect(document.querySelector('.semantic-mobile-popup')).toHaveStyle({
    minWidth: '280px',
  });
});

test.each([
  { picker: 'month', boundary: 'minDate', bound: '2026-06-15', target: 'May' },
  { picker: 'month', boundary: 'maxDate', bound: '2026-06-15', target: 'Jul' },
  { picker: 'year', boundary: 'minDate', bound: '2026-06-15', target: '2025' },
  { picker: 'year', boundary: 'maxDate', bound: '2026-06-15', target: '2027' },
] as const)(
  '$picker selection respects $boundary',
  async ({ picker, boundary, bound, target }) => {
    const onChange = rstest.fn();
    render(
      <DatePicker
        picker={picker}
        open
        defaultValue={dayjs('2026-06-15')}
        {...{ [boundary]: dayjs(bound) }}
        onChange={onChange}
      />,
    );
    const option = screen.getByRole('button', { name: target, exact: true });
    expect(option).toBeDisabled();
    await userEvent.click(option);
    expect(onChange).not.toHaveBeenCalled();
  },
);

test.each([
  { picker: 'month', text: '2026-06', target: 'Jun' },
  { picker: 'year', text: '2026', target: '2026' },
] as const)(
  '$picker boundary period is valid for both typing and selection',
  async ({ picker, text, target }) => {
    const onChange = rstest.fn();
    const { rerender } = render(
      <DatePicker
        picker={picker}
        mobile={false}
        minDate={dayjs('2026-06-15')}
        maxDate={dayjs('2026-06-20')}
        onChange={onChange}
      />,
    );
    await userEvent.type(screen.getByRole('combobox'), text);
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), text);
    onChange.mockClear();
    rerender(
      <DatePicker
        picker={picker}
        open
        minDate={dayjs('2026-06-15')}
        maxDate={dayjs('2026-06-20')}
        onChange={onChange}
      />,
    );
    const option = screen.getByRole('button', { name: target, exact: true });
    expect(option).not.toBeDisabled();
    await userEvent.click(option);
    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), text);
  },
);

test('date picker can navigate through a partially allowed month and year', async () => {
  const onChange = rstest.fn();
  render(
    <DatePicker
      open
      defaultValue={dayjs('2026-06-18')}
      minDate={dayjs('2026-06-15')}
      maxDate={dayjs('2026-06-20')}
      onChange={onChange}
    />,
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Jun', exact: true }),
  );
  const month = screen.getByRole('button', { name: 'Jun', exact: true });
  expect(month).not.toBeDisabled();
  await userEvent.click(month);
  await userEvent.click(
    screen.getByRole('button', { name: '2026', exact: true }),
  );
  const year = screen.getByRole('button', { name: '2026', exact: true });
  expect(year).not.toBeDisabled();
  await userEvent.click(year);
  await userEvent.click(
    screen.getByRole('button', { name: 'Jan', exact: true }),
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Jun', exact: true }),
  );
  expect(screen.getByRole('button', { name: '2026-06-14' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: '2026-06-16' }));
  expect(onChange).toHaveBeenLastCalledWith(expect.anything(), '2026-06-16');
});

test.each([
  {
    name: 'minDate',
    target: '2026-01-01',
    props: { minDate: dayjs('2026-01-10') },
  },
  {
    name: 'maxDate',
    target: '2026-01-31',
    props: { maxDate: dayjs('2026-01-25') },
  },
  {
    name: 'disabledDate',
    target: '2026-01-20',
    props: { disabledDate: (date: dayjs.Dayjs) => date.date() === 20 },
  },
  { name: 'invalid date', target: 'invalid', props: {} },
])(
  'presets respect $name without changing or closing the picker',
  async ({ target, props }) => {
    const onChange = rstest.fn();
    const onOpenChange = rstest.fn();
    render(
      <DatePicker
        mobile={false}
        open
        defaultValue={dayjs('2026-01-15')}
        {...props}
        presets={[{ label: 'Blocked preset', value: dayjs(target) }]}
        onChange={onChange}
        onOpenChange={onOpenChange}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Blocked preset' }),
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveValue('2026-01-15');
  },
);

test.each(['month', 'year'] as const)(
  'valid %s presets use the same boundary granularity as manual input',
  async (picker) => {
    const onChange = rstest.fn();
    const preset = dayjs('2026-01-01');
    render(
      <DatePicker
        mobile={false}
        open
        picker={picker}
        minDate={dayjs('2026-01-15')}
        maxDate={dayjs('2026-01-20')}
        presets={[{ label: 'Allowed period', value: preset }]}
        onChange={onChange}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Allowed period' }),
    );
    expect(onChange).toHaveBeenCalledWith(
      preset,
      picker === 'month' ? '2026-01' : '2026',
    );
  },
);

test('preset validation follows updated boundaries without changing the preset list', async () => {
  const presets = [{ label: 'January 10', value: dayjs('2026-01-10') }];
  const onChange = rstest.fn();
  const { rerender } = render(
    <DatePicker
      mobile={false}
      open
      minDate={dayjs('2026-01-01')}
      presets={presets}
      onChange={onChange}
    />,
  );
  rerender(
    <DatePicker
      mobile={false}
      open
      minDate={dayjs('2026-01-15')}
      presets={presets}
      onChange={onChange}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'January 10' }));
  expect(onChange).not.toHaveBeenCalled();
});

test('DatePicker confirms a valid typed date and time when clicking OK', () => {
  const typed = '2026-06-18 12:34:56';
  const start = dayjs('2026-06-15T09:00:00');
  const changed = rstest.fn();
  render(
    <DatePicker
      mobile={false}
      defaultValue={start}
      showTime
      onChange={changed}
    />,
  );
  const input = screen.getByRole('combobox');
  act(() => input.focus());
  fireEvent.click(input);
  fireEvent.change(input, { target: { value: typed } });
  const ok = screen.getByRole('button', { name: 'OK' });
  act(() => ok.focus());
  fireEvent.click(ok);
  expect(input).toHaveValue(typed);
  expect(input).toHaveAttribute('aria-expanded', 'false');
  expect(changed.mock.calls.map(([, text]) => text)).toEqual([typed]);
});
