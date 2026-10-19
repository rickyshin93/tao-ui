import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { InputNumber } from '../src/components/input-number/input-number';

const meta = {
  title: '数据录入 Data Entry/InputNumber',
  component: InputNumber,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { onChange: fn(), onBlur: fn() },
} satisfies Meta<typeof InputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledWrapper(props: React.ComponentProps<typeof InputNumber>) {
  const [value, setValue] = useState((props.value as string | undefined) ?? '');
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minWidth: 320,
      }}
    >
      <InputNumber
        {...props}
        value={value}
        onChange={(v) => {
          setValue(v);
          props.onChange?.(v);
        }}
      />
      <code style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
        actual value: {JSON.stringify(value)}
      </code>
    </div>
  );
}

export const Default: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: { placeholder: 'Enter amount' },
};

export const Currency: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    prefix: '€',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    decimalPlaces: 2,
    value: '150000',
    placeholder: 'Amount',
  },
};

export const WithSuffix: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    suffix: 'USD',
    prefix: '$',
    decimalPlaces: 2,
    placeholder: 'Try 1234567',
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minWidth: 320,
      }}
    >
      <InputNumber {...args} size="small" prefix="¥" value="1000" />
      <InputNumber {...args} size="medium" prefix="¥" value="1000" />
      <InputNumber {...args} size="large" prefix="¥" value="1000" />
    </div>
  ),
  args: { thousandsSeparator: ',' },
};

export const Variants: Story = {
  render: (args) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minWidth: 320,
      }}
    >
      <InputNumber {...args} variant="outlined" prefix="¥" value="1000" />
      <InputNumber {...args} variant="filled" prefix="¥" value="1000" />
      <InputNumber {...args} variant="borderless" prefix="¥" value="1000" />
    </div>
  ),
  args: { thousandsSeparator: ',' },
};

export const ErrorState: Story = {
  name: 'Error',
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    error: true,
    prefix: '¥',
    value: '999',
    placeholder: 'Invalid amount',
  },
};

export const Percentage: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    isPercentage: true,
    decimalPlaces: 2,
    suffix: '%',
    placeholder: 'Type 50 → actual is 0.5',
  },
};

export const ClampedRange: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    min: 0,
    max: 100,
    decimalPlaces: 0,
    placeholder: 'Type 999, blur to clamp to 100',
  },
};
