import { expect, test } from '@rstest/core';
import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DatePicker } from '../../src/components/date-picker/date-picker';
import { RangePicker } from '../../src/components/date-picker/range-picker';
import { Form } from '../../src/components/form';
import { FormField } from '../../src/components/form-field/form-field';
import { Select } from '../../src/components/select/select';
import { TaoProvider, zhCN } from '../../src/provider/tao-provider';

const controls = [
  {
    name: 'Select',
    render: (title?: ReactNode) => (
      <Select
        mobile
        open
        options={[]}
        placeholder="Input hint"
        mobileTitle={title}
      />
    ),
  },
  {
    name: 'multiple Select',
    render: (title?: ReactNode) => (
      <Select
        mobile
        open
        mode="multiple"
        options={[]}
        placeholder="Input hint"
        mobileTitle={title}
      />
    ),
  },
  {
    name: 'DatePicker',
    render: (title?: ReactNode) => (
      <DatePicker mobile open placeholder="YYYY-MM-DD" mobileTitle={title} />
    ),
  },
  {
    name: 'RangePicker',
    render: (title?: ReactNode) => (
      <RangePicker mobile open mobileTitle={title} />
    ),
  },
];

for (const control of controls) {
  test(`${control.name} inherits FormField label without the required mark`, () => {
    render(
      <FormField label="Destination" required>
        {control.render()}
      </FormField>,
    );
    expect(
      screen.getByRole('dialog', { name: 'Destination' }),
    ).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).queryByText('*')).toBeNull();
  });

  test(`${control.name} inherits rich Form.Item labels through wrappers and updates them`, () => {
    const field = (label: string) => (
      <Form>
        <Form.Item label={<span>{label}</span>}>
          <div>{control.render()}</div>
        </Form.Item>
      </Form>
    );
    const { rerender } = render(field('Departure'));
    expect(
      screen.getByRole('dialog', { name: 'Departure' }),
    ).toBeInTheDocument();
    rerender(field('Return'));
    expect(screen.getByRole('dialog', { name: 'Return' })).toBeInTheDocument();
  });

  test(`${control.name} gives explicit mobileTitle priority over the label`, () => {
    render(
      <FormField label="Destination">
        {control.render(<span>Choose your destination</span>)}
      </FormField>,
    );
    expect(
      screen.getByRole('dialog', { name: 'Choose your destination' }),
    ).toBeInTheDocument();
  });
}

test.each([
  {
    control: <Select mobile open options={[]} placeholder="Input hint" />,
    en: 'Select',
    zh: '选择',
  },
  {
    control: <DatePicker mobile open placeholder="YYYY-MM-DD" />,
    en: 'Select date',
    zh: '选择日期',
  },
  {
    control: <DatePicker mobile open showTime />,
    en: 'Date & Time',
    zh: '选择日期和时间',
  },
  {
    control: <RangePicker mobile open />,
    en: 'Select date range',
    zh: '选择日期范围',
  },
])(
  'unlabelled $en uses localized defaults instead of placeholders',
  ({ control, en, zh }) => {
    const { rerender } = render(<TaoProvider>{control}</TaoProvider>);
    expect(screen.getByRole('dialog', { name: en })).toBeInTheDocument();
    rerender(<TaoProvider locale={zhCN}>{control}</TaoProvider>);
    expect(screen.getByRole('dialog', { name: zh })).toBeInTheDocument();
  },
);

test('an unlabelled nested field does not inherit its outer field label', () => {
  render(
    <Form>
      <Form.Item label="Outer">
        <div>
          <Form.Item>
            <Select mobile open options={[]} />
          </Form.Item>
        </div>
      </Form.Item>
    </Form>,
  );
  expect(screen.getByRole('dialog', { name: 'Select' })).toBeInTheDocument();
});

test('standalone controls accept a mobile title', () => {
  render(<DatePicker mobile open mobileTitle="Birthday" />);
  expect(screen.getByRole('dialog', { name: 'Birthday' })).toBeInTheDocument();
});
