import {
  Button,
  FormActions,
  FormField,
  FormLayout,
  FormSection,
  Input,
} from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: '布局 Layout/FormLayout',
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <FormLayout>
      <FormSection title="Account" description="Your login credentials.">
        <FormField label="Email" required>
          <Input placeholder="you@example.com" />
        </FormField>
        <FormField label="Password" required>
          <Input type="password" placeholder="••••••••" />
        </FormField>
      </FormSection>
      <FormActions>
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Create Account</Button>
      </FormActions>
    </FormLayout>
  ),
};
