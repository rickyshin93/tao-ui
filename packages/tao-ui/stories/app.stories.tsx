import type { Meta, StoryObj } from '@storybook/react';
import { App } from '../src/components/app/app';
import { Button } from '../src/components/button/button';
import { Stack } from '../src/layouts/stack/stack';

export default { title: '配置 Config/App' } satisfies Meta;

function Actions() {
  const { message, notification, modal } = App.useApp();
  return (
    <Stack direction="horizontal" gap="sm">
      <Button onClick={() => message.success('Changes saved')}>Message</Button>
      <Button
        variant="secondary"
        onClick={() =>
          notification.info({
            title: 'Export ready',
            description: 'The report is available in your workspace.',
          })
        }
      >
        Notification
      </Button>
      <Button
        variant="secondary"
        onClick={async () => {
          const confirmed = await modal.confirm({
            title: 'Archive project?',
            content: 'You can restore it from archived projects.',
          });
          if (confirmed) message.success('Project archived');
        }}
      >
        Confirm
      </Button>
    </Stack>
  );
}

export const Basic: StoryObj = {
  render: () => (
    <App>
      <Actions />
    </App>
  ),
};
