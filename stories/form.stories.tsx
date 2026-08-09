import {
  Button,
  Form,
  FormActions,
  FormField,
  FormLayout,
  FormSection,
  Input,
  Select,
  Stack,
} from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';

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
      <FormField
        label="Username"
        required
        error="Must be at least 3 characters."
      >
        <Input value="ab" error />
      </FormField>
    </Stack>
  ),
};

export const CompleteForm: StoryObj = {
  name: 'Complete Form',
  render: () => (
    <FormLayout>
      <FormSection
        title="Personal Information"
        description="Basic details about you."
      >
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

export const FormValidation: StoryObj = {
  name: 'Form (Validation)',
  render: () => (
    <Form
      style={{ maxWidth: 400 }}
      initialValues={{ role: 'editor' }}
      onFinish={(values) => alert(JSON.stringify(values, null, 2))}
    >
      <Stack gap="md">
        <Form.Item
          name="username"
          label="Username"
          rules={[
            { required: true, message: 'Username is required' },
            { min: 3, message: 'Must be at least 3 characters' },
          ]}
        >
          <Input placeholder="pick a username" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Email is required' },
            { pattern: /@/, message: 'Invalid email' },
          ]}
        >
          <Input placeholder="you@example.com" />
        </Form.Item>
        <FormActions>
          <Button type="submit" variant="primary">
            Sign up
          </Button>
        </FormActions>
      </Stack>
    </Form>
  ),
};

export const FormCrossField: StoryObj = {
  name: 'Form (Cross-field Validation)',
  render: () => (
    <Form layout="horizontal" style={{ maxWidth: 460 }}>
      <Stack gap="md">
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Password is required' }]}
        >
          <Input type="password" />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="Confirm"
          dependencies={['password']}
          rules={[
            ({ getFieldValue }) => ({
              validator: (_, value) =>
                !value || getFieldValue('password') === value
                  ? Promise.resolve()
                  : Promise.reject(new Error('Passwords do not match')),
            }),
          ]}
        >
          <Input type="password" />
        </Form.Item>
        <FormActions>
          <Button type="submit" variant="primary">
            Change password
          </Button>
        </FormActions>
      </Stack>
    </Form>
  ),
};

export const FormDynamicList: StoryObj = {
  name: 'Form (Dynamic List)',
  render: () => (
    <Form
      style={{ maxWidth: 400 }}
      initialValues={{ members: [''] }}
      onFinish={(values) => alert(JSON.stringify(values, null, 2))}
    >
      <Stack gap="md">
        <Form.List name="members">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Stack key={field.key} direction="horizontal" gap="sm" align="start">
                  <Form.Item
                    name={field.name}
                    label={index === 0 ? 'Members' : undefined}
                    noStyle={index !== 0}
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input placeholder="member name" />
                  </Form.Item>
                  <Button variant="ghost" onClick={() => remove(field.name)}>
                    Remove
                  </Button>
                </Stack>
              ))}
              <Button variant="secondary" onClick={() => add()}>
                Add member
              </Button>
            </>
          )}
        </Form.List>
        <FormActions>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </FormActions>
      </Stack>
    </Form>
  ),
};
