import { Alert, Button, Stack } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: '反馈 Feedback/Alert',
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <Stack gap="md">
      <Alert type="success" title="Success" />
      <Alert type="info" title="Info" />
      <Alert type="warning" title="Warning" />
      <Alert type="error" title="Error" />
    </Stack>
  ),
};

export const WithDescription: StoryObj = {
  name: 'With Description',
  render: () => (
    <Stack gap="md">
      <Alert
        type="success"
        title="Success"
        description="Your changes have been saved successfully."
      />
      <Alert
        type="info"
        title="Info"
        description="A new version is available. Refresh to update."
      />
      <Alert
        type="warning"
        title="Warning"
        description="Your subscription expires in 3 days."
      />
      <Alert
        type="error"
        title="Error"
        description="Something went wrong while processing your request."
      />
    </Stack>
  ),
};

export const WithIcon: StoryObj = {
  name: 'With Icon',
  render: () => (
    <Stack gap="md">
      <Alert type="success" title="Success" showIcon />
      <Alert type="info" title="Info" showIcon />
      <Alert type="warning" title="Warning" showIcon />
      <Alert type="error" title="Error" showIcon />
      <Alert
        type="success"
        title="Success"
        description="Icons grow larger when a description is present."
        showIcon
      />
      <Alert
        type="warning"
        title="Custom Icon"
        showIcon
        icon={<span>🔥</span>}
      />
    </Stack>
  ),
};

export const Closable: StoryObj = {
  render: () => (
    <Stack gap="md">
      <Alert type="info" title="Closable alert" closable showIcon />
      <Alert
        type="warning"
        title="Closable with description"
        description="Click the × button to dismiss this alert."
        closable
        showIcon
        onClose={() => console.log('closed')}
      />
    </Stack>
  ),
};

export const WithAction: StoryObj = {
  name: 'With Action',
  render: () => (
    <Stack gap="md">
      <Alert
        type="info"
        title="New version available"
        showIcon
        action={
          <Button size="small" variant="secondary">
            Update
          </Button>
        }
      />
      <Alert
        type="error"
        title="Payment failed"
        description="Your card was declined. Please update your payment method."
        showIcon
        action={
          <Button size="small" variant="primary">
            Retry
          </Button>
        }
        closable
      />
    </Stack>
  ),
};
