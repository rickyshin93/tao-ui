import { DatePicker, FormField, RangePicker, Stack } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';

const meta: Meta = {
  title: '数据录入 Data Entry/DatePicker',
};
export default meta;

export const Basic: StoryObj = {
  render: () => {
    function Demo() {
      const [val, setVal] = useState<Dayjs | null>(null);
      return (
        <Stack gap="md" style={{ maxWidth: 300 }}>
          <FormField label="Date">
            <DatePicker
              value={val}
              onChange={(d) => setVal(d)}
              placeholder="Select date"
            />
          </FormField>
          <p style={{ fontSize: 13, color: '#888' }}>
            Selected: {val ? val.format('YYYY-MM-DD') : 'none'}
          </p>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const PickerModes: StoryObj = {
  name: 'Picker Modes (date / month / year)',
  render: () => {
    function Demo() {
      const [d, setD] = useState<Dayjs | null>(dayjs());
      const [m, setM] = useState<Dayjs | null>(dayjs());
      const [y, setY] = useState<Dayjs | null>(dayjs());
      return (
        <Stack gap="md" style={{ maxWidth: 300 }}>
          <FormField label="Date picker">
            <DatePicker value={d} onChange={(v) => setD(v)} />
          </FormField>
          <FormField label="Month picker">
            <DatePicker picker="month" value={m} onChange={(v) => setM(v)} />
          </FormField>
          <FormField label="Year picker">
            <DatePicker picker="year" value={y} onChange={(v) => setY(v)} />
          </FormField>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const WithTime: StoryObj = {
  name: 'Date + Time',
  render: () => {
    function Demo() {
      const [val, setVal] = useState<Dayjs | null>(dayjs());
      return (
        <Stack gap="md" style={{ maxWidth: 300 }}>
          <FormField label="Date & Time">
            <DatePicker value={val} onChange={(d) => setVal(d)} showTime />
          </FormField>
          <p style={{ fontSize: 13, color: '#888' }}>
            Value: {val ? val.format('YYYY-MM-DD HH:mm:ss') : 'none'}
          </p>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const WithPresets: StoryObj = {
  render: () => {
    function Demo() {
      const [val, setVal] = useState<Dayjs | null>(null);
      return (
        <Stack gap="md" style={{ maxWidth: 300 }}>
          <FormField label="With Presets">
            <DatePicker
              value={val}
              onChange={(d) => setVal(d)}
              presets={[
                { label: 'Today', value: dayjs() },
                { label: 'Yesterday', value: dayjs().subtract(1, 'day') },
                { label: 'Last week', value: dayjs().subtract(7, 'day') },
                { label: 'Last month', value: dayjs().subtract(1, 'month') },
              ]}
            />
          </FormField>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const DisabledDates: StoryObj = {
  render: () => {
    function Demo() {
      const [val, setVal] = useState<Dayjs | null>(null);
      return (
        <Stack gap="md" style={{ maxWidth: 300 }}>
          <FormField label="Only future dates">
            <DatePicker
              value={val}
              onChange={(d) => setVal(d)}
              disabledDate={(d) => d.isBefore(dayjs(), 'day')}
            />
          </FormField>
          <FormField label="With min/max">
            <DatePicker
              value={val}
              onChange={(d) => setVal(d)}
              minDate={dayjs().subtract(7, 'day')}
              maxDate={dayjs().add(30, 'day')}
            />
          </FormField>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const RangePickerBasic: StoryObj = {
  name: 'RangePicker',
  render: () => {
    function Demo() {
      const [val, setVal] = useState<[Dayjs | null, Dayjs | null] | null>(null);
      return (
        <Stack gap="md" style={{ maxWidth: 500 }}>
          <FormField label="Date Range">
            <RangePicker value={val} onChange={(d) => setVal(d)} />
          </FormField>
          <p style={{ fontSize: 13, color: '#888' }}>
            Range: {val?.[0]?.format('YYYY-MM-DD') ?? '?'} ~{' '}
            {val?.[1]?.format('YYYY-MM-DD') ?? '?'}
          </p>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const RangePickerPresets: StoryObj = {
  name: 'RangePicker with Presets',
  render: () => {
    function Demo() {
      const [val, setVal] = useState<[Dayjs | null, Dayjs | null] | null>(null);
      return (
        <Stack gap="md" style={{ maxWidth: 500 }}>
          <FormField label="Range with presets">
            <RangePicker
              value={val}
              onChange={(d) => setVal(d)}
              presets={[
                {
                  label: 'This week',
                  value: [dayjs().startOf('week'), dayjs().endOf('week')],
                },
                {
                  label: 'This month',
                  value: [dayjs().startOf('month'), dayjs().endOf('month')],
                },
                {
                  label: 'Last 7 days',
                  value: [dayjs().subtract(7, 'day'), dayjs()],
                },
                {
                  label: 'Last 30 days',
                  value: [dayjs().subtract(30, 'day'), dayjs()],
                },
              ]}
            />
          </FormField>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const MobileDatePicker: StoryObj = {
  name: 'Mobile Mode (forced)',
  render: () => {
    function Demo() {
      const [val, setVal] = useState<Dayjs | null>(null);
      return (
        <Stack gap="md" style={{ maxWidth: 300 }}>
          <p style={{ color: '#888', fontSize: 13 }}>
            Using <code>mobile</code> prop to force Drawer mode.
          </p>
          <FormField label="Mobile DatePicker">
            <DatePicker
              value={val}
              onChange={(d) => setVal(d)}
              mobile
              presets={[
                { label: 'Today', value: dayjs() },
                { label: 'Yesterday', value: dayjs().subtract(1, 'day') },
              ]}
            />
          </FormField>
        </Stack>
      );
    }
    return <Demo />;
  },
};
