import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { NumberInput } from '../src/number-input';

const meta = {
  title: '数据录入 Data Entry/NumberInput',
  component: NumberInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { onChange: fn(), onBlur: fn() },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledWrapper(props: React.ComponentProps<typeof NumberInput>) {
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
      <NumberInput
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
  args: {
    placeholder: 'Enter amount',
  },
};

export const WithThousandSeparator: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    placeholder: 'Try 1234567',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
};

export const WithPrefixSuffix: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    prefix: '$',
    suffix: 'USD',
    decimalPlaces: 2,
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

export const AllowNegative: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    allowNegative: true,
    placeholder: 'Type -123.45',
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

export const PadOnBlurAlways: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    padDecimalsOnBlur: 'always',
    decimalPlaces: 2,
    placeholder: 'Type 5, blur to see 5.00',
  },
};

export const EuropeanLocale: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimalPlaces: 2,
    placeholder: '1.234,56',
  },
};
