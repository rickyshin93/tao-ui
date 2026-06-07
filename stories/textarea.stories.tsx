import { FormField, Stack, Textarea } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: '数据录入 Data Entry/Textarea',
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <Textarea placeholder="Default textarea" style={{ width: '100%' }} />
      <Textarea defaultValue="With some content" style={{ width: '100%' }} />
      <Textarea placeholder="Error state" error style={{ width: '100%' }} />
      <Textarea placeholder="Disabled" disabled style={{ width: '100%' }} />
    </Stack>
  ),
};

export const Variants: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <Textarea
        placeholder="Outlined (default)"
        variant="outlined"
        style={{ width: '100%' }}
      />
      <Textarea
        placeholder="Filled"
        variant="filled"
        style={{ width: '100%' }}
      />
      <Textarea
        placeholder="Borderless"
        variant="borderless"
        style={{ width: '100%' }}
      />
    </Stack>
  ),
};

export const Sizes: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <Textarea placeholder="Small" size="small" style={{ width: '100%' }} />
      <Textarea placeholder="Medium" size="medium" style={{ width: '100%' }} />
      <Textarea placeholder="Large" size="large" style={{ width: '100%' }} />
    </Stack>
  ),
};

export const AutoSize: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <Textarea
        placeholder="autoSize — grows freely"
        autoSize
        style={{ width: '100%' }}
      />
      <Textarea
        placeholder="autoSize {minRows: 2, maxRows: 6}"
        autoSize={{ minRows: 2, maxRows: 6 }}
        style={{ width: '100%' }}
      />
    </Stack>
  ),
};

export const InFormField: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <FormField label="Description" description="Tell us more">
        <Textarea
          placeholder="Fills the field width"
          autoSize={{ minRows: 3 }}
        />
      </FormField>
    </div>
  ),
};
