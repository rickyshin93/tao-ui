import type { Meta, StoryObj } from '@storybook/react';
import {
  Button,
  FormActions,
  FormField,
  FormLayout,
  FormSection,
  Input,
  Select,
  Stack,
} from '@rockshin/tao-ui';

const meta: Meta = {
  title: '数据录入 Data Entry/Form',
};
export default meta;

export const FormFieldBasic: StoryObj = {
  name: 'FormField',
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <FormField label="Email" required description="We won't share it.">
        <Input placeholder="you@example.com" />
      </FormField>
      <FormField label="Username" required error="Must be at least 3 characters.">
        <Input value="ab" error />
      </FormField>
    </Stack>
  ),
};

export const CompleteForm: StoryObj = {
  name: 'Complete Form',
  render: () => (
    <FormLayout>
      <FormSection title="Personal Information" description="Basic details about you.">
        <Stack direction="horizontal" gap="md">
          <FormField label="First name" required>
            <Input value="Rihua" />
          </FormField>
          <FormField label="Last name" required>
            <Input value="Chen" />
          </FormField>
        </Stack>
        <FormField label="Email" required>
          <Input value="rihua@example.com" prefix={<span>✉️</span>} />
        </FormField>
        <FormField label="Phone" description="Optional. Used for recovery.">
          <Input placeholder="138 0000 0000" prefix={<span>+86</span>} />
        </FormField>
      </FormSection>

      <FormSection title="Preferences" description="Configure your workspace.">
        <FormField label="Language">
          <Select
            options={[
              { label: '简体中文', value: 'zh' },
              { label: 'English', value: 'en' },
            ]}
            value="zh"
          />
        </FormField>
        <FormField label="Timezone">
          <Select
            options={[
              { label: 'Asia/Shanghai (UTC+8)', value: 'cst' },
              { label: 'America/New_York (UTC-5)', value: 'est' },
            ]}
            value="cst"
          />
        </FormField>
      </FormSection>

      <FormActions>
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Save Changes</Button>
      </FormActions>
    </FormLayout>
  ),
};
