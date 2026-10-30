import { expect, test } from '@rstest/core';
import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import dayjs from 'dayjs';
import { Checkbox, CheckboxGroup } from '../src/components/checkbox/checkbox';
import { Radio, RadioGroup } from '../src/components/radio/radio';
import { Switch } from '../src/components/switch/switch';
import { Popover } from '../src/components/popover/popover';
import { Popconfirm } from '../src/components/popconfirm/popconfirm';
import { Modal } from '../src/components/modal/modal';
import { Drawer } from '../src/components/drawer/drawer';
import { TimePanel } from '../src/components/date-picker/calendar/time-panel';
import { MonthGrid } from '../src/components/date-picker/calendar/month-grid';
import { YearGrid } from '../src/components/date-picker/calendar/year-grid';
import { CalendarGrid } from '../src/components/date-picker/calendar/calendar-grid';
import { DatePicker } from '../src/components/date-picker/date-picker';
import {
  RangePicker,
  type RangePickerProps,
} from '../src/components/date-picker/range-picker';
import { FormField } from '../src/components/form-field/form-field';
import { Input } from '../src/components/input/input';
import { Textarea } from '../src/components/textarea/textarea';
import { InputNumber } from '../src/components/input-number/input-number';
import { Select } from '../src/components/select/select';
import { Spinner } from '../src/components/spinner/spinner';
import { Tabs } from '../src/components/tabs/tabs';
import { CheckableTag } from '../src/components/tag/tag';

test.each([
  { name: 'checkbox', control: <Checkbox /> },
  { name: 'radio', control: <Radio /> },
  { name: 'switch', control: <Switch /> },
  {
    name: 'checkbox group',
    control: <CheckboxGroup options={['One', 'Two']} />,
  },
  { name: 'radio group', control: <RadioGroup options={['One', 'Two']} /> },
  { name: 'input', control: <Input /> },
  { name: 'textarea', control: <Textarea /> },
  { name: 'number', control: <InputNumber /> },
  { name: 'date', control: <DatePicker mobile={false} /> },
  { name: 'mobile date', control: <DatePicker mobile /> },
  { name: 'range', control: <RangePicker mobile={false} /> },
  { name: 'mobile range', control: <RangePicker mobile /> },
])(
  '$name keeps FormField labels and validation on its controls',
  ({ control }) => {
    const field = (error?: string) => (
      <FormField
        label="Booking"
        required
        description="Choose a value"
        error={error}
      >
        {control}
      </FormField>
    );
    const { rerender } = render(field('Invalid booking'));
    const inputs = screen.getAllByLabelText(/Booking/);
    for (const input of inputs) {
      expect(input).toHaveAccessibleErrorMessage('Invalid booking');
      expect(input).toHaveAccessibleDescription('Invalid booking');
    }
    rerender(field());
    for (const input of inputs) {
      expect(input).not.toHaveAttribute('aria-invalid');
      expect(input).toHaveAccessibleDescription('Choose a value');
    }
  },
);

test.each([
  { name: 'date', control: <DatePicker mobile={false} aria-label="Date" /> },
  { name: 'range', control: <RangePicker mobile={false} aria-label="Stay" /> },
])(
  '$name opens its named dialog by keyboard and restores input focus',
  async ({ control }) => {
    render(control);
    const input = screen.getAllByRole('combobox')[0];
    expect(input).toHaveAccessibleName();
    expect(input).toHaveAttribute('aria-expanded', 'false');
    input.focus();
    await userEvent.keyboard('{ArrowDown}');
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input.getAttribute('aria-controls')).toBe(dialog.id);
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toHaveAttribute('aria-current', 'date');
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).not.toHaveAttribute('aria-controls');
  },
);

test('range inputs have distinct endpoint names', () => {
  render(
    <FormField label="Stay">
      <RangePicker mobile={false} />
    </FormField>,
  );
  expect(
    screen.getByRole('combobox', { name: 'Stay Start date' }),
  ).toBeTruthy();
  expect(screen.getByRole('combobox', { name: 'Stay End date' })).toBeTruthy();
});

test('range inputs preserve native labels supplied through endpoint ids', () => {
  render(
    <>
      <label htmlFor="stay">Arrival</label>
      <label htmlFor="stay-end">Departure</label>
      <RangePicker id="stay" mobile={false} />
    </>,
  );
  expect(screen.getByRole('combobox', { name: 'Arrival' })).toHaveAttribute(
    'id',
    'stay',
  );
  expect(screen.getByRole('combobox', { name: 'Departure' })).toHaveAttribute(
    'id',
    'stay-end',
  );
});

test('a required Radio uses native required semantics', () => {
  const { rerender } = render(
    <FormField label="Choice" required>
      <Radio />
    </FormField>,
  );
  const radio = screen.getByRole('radio', { name: 'Choice' });
  expect(radio).toBeRequired();
  expect(radio).not.toHaveAttribute('aria-required');
  rerender(<Radio aria-label="Choice" aria-required="false" />);
  expect(screen.getByRole('radio', { name: 'Choice' })).not.toBeRequired();
});

test.each([
  {
    name: 'CheckboxGroup',
    Component: CheckboxGroup,
    role: 'checkbox',
    groupRole: 'group',
  },
  {
    name: 'RadioGroup',
    Component: RadioGroup,
    role: 'radio',
    groupRole: 'radiogroup',
  },
])(
  '$name keeps explicitly enabled options operable and semantically enabled',
  async ({ Component, role, groupRole }) => {
    const changes: (string | string[])[] = [];
    render(
      <Component
        aria-label="Options"
        disabled
        onChange={(value: string | string[]) => changes.push(value)}
        options={[
          { label: 'Enabled option', value: 'enabled', disabled: false },
          { label: 'Disabled option', value: 'disabled' },
        ]}
      />,
    );
    const option = screen.getByRole(role, { name: 'Enabled option' });
    expect(
      screen.getByRole(groupRole, { name: 'Options' }),
    ).not.toHaveAttribute('aria-disabled', 'true');
    expect(option).toBeEnabled();
    expect(screen.getByRole(role, { name: 'Disabled option' })).toBeDisabled();
    await userEvent.click(option);
    expect(changes).toEqual([role === 'radio' ? 'enabled' : ['enabled']]);
  },
);

test('calendar exposes its month, selected date and today', () => {
  const today = dayjs();
  render(<CalendarGrid viewDate={today} value={today} onSelect={() => {}} />);
  expect(screen.getByRole('grid')).toHaveAccessibleName(
    today.format('MMMM YYYY'),
  );
  const button = screen.getByRole('button', {
    name: today.format('YYYY-MM-DD'),
  });
  expect(button).toHaveAttribute('aria-current', 'date');
  expect(button.closest('td')).toHaveAttribute('aria-selected', 'true');
});

test('calendar only announces committed range selection, not hover preview', () => {
  const { rerender } = render(
    <CalendarGrid
      viewDate={dayjs('2026-06-15')}
      rangeStart={dayjs('2026-06-10')}
      rangeEnd={dayjs('2026-06-12')}
      onSelect={() => {}}
    />,
  );
  expect(screen.getByRole('grid')).toHaveAttribute(
    'aria-multiselectable',
    'true',
  );
  expect(screen.getAllByRole('gridcell', { selected: true })).toHaveLength(3);
  rerender(
    <CalendarGrid
      viewDate={dayjs('2026-06-15')}
      rangeStart={dayjs('2026-06-10')}
      rangeEnd={null}
      hoverDate={dayjs('2026-06-12')}
      onSelect={() => {}}
    />,
  );
  expect(screen.queryAllByRole('gridcell', { selected: true })).toHaveLength(0);
});

test('spinner announces loading and marks only its content busy during delay', () => {
  const { rerender } = render(
    <Spinner delay={1000}>
      <p>Results</p>
    </Spinner>,
  );
  expect(screen.getByText('Results').parentElement).toHaveAttribute(
    'aria-busy',
    'true',
  );
  rerender(
    <Spinner spinning={false}>
      <p>Results</p>
    </Spinner>,
  );
  expect(screen.getByText('Results').parentElement).toHaveAttribute(
    'aria-busy',
    'false',
  );
  rerender(<Spinner />);
  expect(screen.getByRole('status')).toHaveAccessibleName('Loading');
  rerender(<Spinner aria-label="Loading results" />);
  expect(screen.getByRole('status')).toHaveAccessibleName('Loading results');
});

test('disabled checkable tags expose their disabled state', () => {
  render(
    <CheckableTag disabled checked>
      Archived
    </CheckableTag>,
  );
  const tag = screen.getByRole('checkbox', { name: 'Archived' });
  expect(tag).toHaveAttribute('aria-disabled', 'true');
  expect(tag).toHaveAttribute('aria-checked', 'true');
});

test('tabs provide a named tablist and keyboard access to text-only panels', async () => {
  render(
    <Tabs
      aria-label="Details"
      destroyInactiveTabPane
      items={[
        { key: 'a', label: 'Overview', children: 'Summary' },
        { key: 'b', label: 'History', children: 'Events' },
      ]}
    />,
  );
  expect(screen.getByRole('tablist')).toHaveAccessibleName('Details');
  const active = screen.getByRole('tab', { selected: true });
  expect(document.getElementById(active.getAttribute('aria-controls')!)).toBe(
    screen.getByRole('tabpanel'),
  );
  expect(screen.getByRole('tab', { selected: false })).not.toHaveAttribute(
    'aria-controls',
  );
  active.focus();
  await userEvent.tab();
  expect(screen.getByRole('tabpanel')).toHaveFocus();
});

test('mobile select exposes the current selection and an explicit search label', async () => {
  render(
    <Select
      mobile
      showSearch
      defaultValue="a"
      options={[
        { label: 'Alpha', value: 'a' },
        { label: 'Beta', value: 'b' },
      ]}
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('textbox')).toHaveAccessibleName('Search options');
  expect(screen.getByRole('button', { name: 'Alpha' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(screen.getByRole('button', { name: 'Beta' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});

test('popover and confirmation dialogs are named by their visible titles', () => {
  const { rerender } = render(
    <Popover title="Details" content="Body" open>
      <button type="button">Open</button>
    </Popover>,
  );
  expect(screen.getByRole('dialog')).toHaveAccessibleName('Details');
  rerender(
    <Popconfirm title="Delete record?" description="Cannot be undone" open>
      <button type="button">Delete</button>
    </Popconfirm>,
  );
  expect(screen.getByRole('dialog')).toHaveAccessibleName('Delete record?');
  expect(screen.getByRole('dialog')).toHaveAccessibleDescription(
    'Cannot be undone',
  );
});

test.each([Modal, Drawer])(
  'dialogs accept a name and description without a visible title (%#)',
  (Dialog) => {
    render(
      <>
        <p id="dialog-help">Review the details</p>
        <Dialog open aria-label="Review" aria-describedby="dialog-help">
          Body
        </Dialog>
      </>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Review');
    expect(dialog).toHaveAccessibleDescription('Review the details');
  },
);

test('month, year and time selection expose pressed states', () => {
  const value = dayjs('2026-06-15');
  const { rerender } = render(
    <MonthGrid viewDate={value} value={value} onSelect={() => {}} />,
  );
  expect(screen.getByRole('button', { name: 'Jun' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  rerender(<YearGrid viewDate={value} value={value} onSelect={() => {}} />);
  expect(screen.getByRole('button', { name: '2026' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  rerender(<TimePanel hour={9} minute={30} second={0} onChange={() => {}} />);
  expect(
    within(screen.getByRole('group', { name: 'Hour' })).getByRole('button', {
      pressed: true,
    }),
  ).toHaveTextContent('09');
  expect(
    within(screen.getByRole('group', { name: 'Minute' })).getByRole('button', {
      pressed: true,
    }),
  ).toHaveTextContent('30');
  expect(
    within(screen.getByRole('group', { name: 'Second' })).getByRole('button', {
      pressed: true,
    }),
  ).toHaveTextContent('00');
});

test('range keyboard dismissal returns to the endpoint that opened the dialog', async () => {
  render(<RangePicker mobile={false} aria-label="Stay" />);
  const end = screen.getByRole('combobox', { name: 'Stay End date' });
  end.focus();
  await userEvent.keyboard('{ArrowDown}');
  expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(
    true,
  );
  await userEvent.keyboard('{Escape}');
  expect(end).toHaveFocus();
});

test.each([false, true])(
  'range end opens at its selected date across months (controlled: %s)',
  async (controlled) => {
    function Example() {
      const [value, setValue] = useState<RangePickerProps['value']>([
        dayjs('2026-06-10'),
        dayjs('2026-08-20'),
      ]);
      return (
        <RangePicker
          mobile={false}
          {...(controlled ? { value } : { defaultValue: value ?? undefined })}
          onChange={setValue}
        />
      );
    }
    render(<Example />);
    const end = screen.getByRole('combobox', { name: 'End date' });
    end.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toHaveAccessibleName('2026-08-20');
    await userEvent.keyboard('{Enter}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(end).toHaveFocus();
    expect(end).toHaveValue('2026-08-20');
    expect(screen.getByRole('combobox', { name: 'Start date' })).toHaveValue(
      '2026-06-10',
    );
  },
);

test('an existing range stays open when keyboard focus enters its calendar', async () => {
  render(
    <RangePicker
      mobile={false}
      defaultValue={[dayjs('2026-06-10'), dayjs('2026-06-12')]}
    />,
  );
  const start = screen.getByRole('combobox', { name: 'Start date' });
  start.focus();
  await userEvent.keyboard('{ArrowDown}');
  expect(start).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(
    true,
  );
  expect(document.activeElement).toHaveAccessibleName('2026-06-10');
});

test.each([
  {
    endpoint: 'Start date',
    date: '2026-06-12',
    expected: '2026-06-12 / 2026-06-20',
    controlled: false,
  },
  {
    endpoint: 'End date',
    date: '2026-06-22',
    expected: '2026-06-10 / 2026-06-22',
    controlled: true,
  },
])(
  'range commits the $endpoint draft when entering its calendar',
  async ({ endpoint, date, expected, controlled }) => {
    function Example() {
      const [value, setValue] = useState<RangePickerProps['value']>([
        dayjs('2026-06-10'),
        dayjs('2026-06-20'),
      ]);
      return (
        <>
          <RangePicker
            mobile={false}
            {...(controlled ? { value } : { defaultValue: value ?? undefined })}
            onChange={setValue}
          />
          <output aria-label="Committed range">
            {value?.map((d) => d?.format('YYYY-MM-DD')).join(' / ')}
          </output>
          <button type="button">Outside</button>
        </>
      );
    }
    render(<Example />);
    const input = screen.getByRole('combobox', { name: endpoint });
    await userEvent.clear(input);
    await userEvent.type(input, date);
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(
      true,
    );
    expect(screen.getByLabelText('Committed range')).toHaveTextContent(
      expected,
    );
    expect(document.activeElement).toHaveAccessibleName(date);
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
    expect(input).toHaveValue(date);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByLabelText('Committed range')).toHaveTextContent(
      expected,
    );
  },
);

test.each(['2026-06-20', '2026-08-20'])(
  'an already-open range moves focus to the end date %s',
  async (endDate) => {
    render(
      <RangePicker
        open
        mobile={false}
        defaultValue={[dayjs('2026-06-10'), dayjs(endDate)]}
      />,
    );
    const start = screen.getByRole('combobox', { name: 'Start date' });
    const end = screen.getByRole('combobox', { name: 'End date' });
    start.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toHaveAccessibleName('2026-06-10');
    await userEvent.click(end);
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toHaveAccessibleName(endDate);
    expect(document.activeElement).toHaveAttribute('tabindex', '0');
  },
);
