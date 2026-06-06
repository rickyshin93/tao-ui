import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select, FormField, Stack } from 'tao-ui';

const meta: Meta = {
  title: '数据录入 Data Entry/Select',
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <FormField label="Basic">
        <Select
          options={[
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
            { label: 'Option C', value: 'c' },
          ]}
          placeholder="Choose..."
        />
      </FormField>
    </Stack>
  ),
};

export const WithSearch: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <FormField label="With search">
        <Select
          options={[
            { label: 'React', value: 'react' },
            { label: 'Vue', value: 'vue' },
            { label: 'Angular', value: 'angular' },
            { label: 'Svelte', value: 'svelte' },
            { label: 'Solid', value: 'solid' },
          ]}
          placeholder="Search frameworks..."
          showSearch
        />
      </FormField>
    </Stack>
  ),
};

export const AllowClear: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <FormField label="Allow clear">
        <Select
          options={[
            { label: 'English', value: 'en' },
            { label: '简体中文', value: 'zh' },
            { label: '日本語', value: 'ja' },
          ]}
          value="zh"
          allowClear
          placeholder="Select language"
        />
      </FormField>
    </Stack>
  ),
};

export const LoadingAndPrefix: StoryObj = {
  name: 'Loading + Prefix',
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <FormField label="With prefix + loading">
        <Select
          options={[]}
          placeholder="Loading options..."
          loading
          prefix={<span>🌍</span>}
        />
      </FormField>
    </Stack>
  ),
};

export const DisabledOption: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <FormField label="Disabled option">
        <Select
          options={[
            { label: 'Free', value: 'free' },
            { label: 'Pro', value: 'pro' },
            { label: 'Enterprise (contact us)', value: 'ent', disabled: true },
          ]}
          placeholder="Select plan"
        />
      </FormField>
    </Stack>
  ),
};

export const MobileMode: StoryObj = {
  name: 'Mobile Bottom Sheet',
  render: () => {
    function Demo() {
      const [val, setVal] = useState('');
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `opt-${i + 1}`,
      }));
      return (
        <Stack gap="md" style={{ maxWidth: 400 }}>
          <p style={{ color: '#888', fontSize: 13 }}>
            Using <code>mobile</code> prop to force bottom sheet mode.
          </p>
          <FormField label="Mobile Select (few items)">
            <Select
              options={[
                { label: 'React', value: 'react' },
                { label: 'Vue', value: 'vue' },
                { label: 'Angular', value: 'angular' },
                { label: 'Svelte', value: 'svelte' },
              ]}
              value={val}
              onChange={setVal}
              placeholder="Choose framework"
              mobile
            />
          </FormField>
          <FormField label="Mobile Select (100 items, with search)">
            <Select
              options={manyOptions}
              placeholder="Pick from 100 options"
              showSearch
              mobile
            />
          </FormField>
        </Stack>
      );
    }
    return <Demo />;
  },
};
