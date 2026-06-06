import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Button,
  Drawer,
  FormField,
  Input,
  RadioGroup,
  Stack,
} from 'tao-ui';

const meta: Meta = {
  title: '反馈 Feedback/Drawer',
};
export default meta;

export const Basic: StoryObj = {
  render: () => {
    function Demo() {
      const [right, setRight] = useState(false);
      const [bottom, setBottom] = useState(false);
      return (
        <Stack direction="horizontal" gap="md">
          <Button variant="secondary" onClick={() => setRight(true)}>Open Right Drawer</Button>
          <Button variant="secondary" onClick={() => setBottom(true)}>Open Bottom Drawer</Button>
          <Drawer open={right} onClose={() => setRight(false)} title="Settings" placement="right">
            <Stack gap="md">
              <FormField label="Name"><Input placeholder="Your name" /></FormField>
              <FormField label="Email"><Input placeholder="you@example.com" /></FormField>
            </Stack>
          </Drawer>
          <Drawer open={bottom} onClose={() => setBottom(false)} title="Options" placement="bottom" height="50vh">
            <Stack gap="md">
              <p style={{ color: '#666' }}>Bottom drawer content with 50vh height.</p>
              <RadioGroup options={['Option A', 'Option B', 'Option C']} value="Option A" />
            </Stack>
          </Drawer>
        </Stack>
      );
    }
    return <Demo />;
  },
};
