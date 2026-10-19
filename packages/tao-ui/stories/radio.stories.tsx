import { FormField, Radio, RadioGroup, Stack } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: '数据录入 Data Entry/Radio',
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <Stack direction="horizontal" gap="lg">
      <Radio value="a" checked onChange={() => {}}>
        Selected
      </Radio>
      <Radio value="b">Unselected</Radio>
      <Radio value="c" disabled>
        Disabled
      </Radio>
    </Stack>
  ),
};

export const Group: StoryObj = {
  render: () => (
    <Stack gap="lg">
      <FormField label="Plan (horizontal)">
        <RadioGroup
          options={[
            { label: 'Free', value: 'free' },
            { label: 'Pro', value: 'pro' },
            { label: 'Enterprise', value: 'ent', disabled: true },
          ]}
          value="pro"
        />
      </FormField>
      <FormField label="Frequency (vertical)">
        <RadioGroup
          direction="vertical"
          options={['Daily', 'Weekly', 'Monthly']}
          value="Weekly"
        />
      </FormField>
    </Stack>
  ),
};
