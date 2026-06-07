import { Checkbox, CheckboxGroup, FormField, Stack } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta = {
  title: '数据录入 Data Entry/Checkbox',
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <Stack direction="horizontal" gap="lg">
      <Checkbox>Unchecked</Checkbox>
      <Checkbox checked onChange={() => {}}>
        Checked
      </Checkbox>
      <Checkbox indeterminate>Indeterminate</Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox checked disabled onChange={() => {}}>
        Checked Disabled
      </Checkbox>
    </Stack>
  ),
};

export const Group: StoryObj = {
  render: () => (
    <Stack gap="lg">
      <FormField label="Fruits (horizontal group)">
        <CheckboxGroup
          options={['Apple', 'Banana', 'Cherry', 'Durian']}
          value={['Apple', 'Cherry']}
        />
      </FormField>
      <FormField label="Settings (vertical group)">
        <CheckboxGroup
          direction="vertical"
          options={[
            { label: 'Enable notifications', value: 'notif' },
            { label: 'Dark mode', value: 'dark' },
            { label: 'Beta features', value: 'beta', disabled: true },
          ]}
          value={['notif']}
        />
      </FormField>
    </Stack>
  ),
};
