import {
  Button,
  Drawer,
  FormField,
  Input,
  RadioGroup,
  Select,
  Stack,
} from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta = {
  title: '反馈 Feedback/Drawer',
};
export default meta;

export const Basic: StoryObj = {
  render: () => {
    function Demo() {
      const [right, setRight] = useState(false);
      const [bottom, setBottom] = useState(false);
      const [perils, setPerils] = useState<string[]>([]);
      return (
        <Stack direction="horizontal" gap="md">
          <Button variant="secondary" onClick={() => setRight(true)}>
            Open Right Drawer
          </Button>
          <Button variant="secondary" onClick={() => setBottom(true)}>
            Open Bottom Drawer
          </Button>
          <Drawer
            open={right}
            onClose={() => setRight(false)}
            title="Settings"
            placement="right"
          >
            <Stack gap="md">
              <FormField label="Name">
                <Input placeholder="Your name" />
              </FormField>
              <FormField label="Email">
                <Input placeholder="you@example.com" />
              </FormField>
              <FormField label="Covered perils">
                <Select
                  mode="multiple"
                  value={perils}
                  onChange={(value) => setPerils(value as string[])}
                  options={[
                    { label: 'Illness', value: 'illness' },
                    { label: 'Accident', value: 'accident' },
                  ]}
                />
              </FormField>
            </Stack>
          </Drawer>
          <Drawer
            open={bottom}
            onClose={() => setBottom(false)}
            title="Options"
            placement="bottom"
            height="50vh"
          >
            <Stack gap="md">
              <p style={{ color: '#666' }}>
                Bottom drawer content with 50vh height.
              </p>
              <RadioGroup
                options={['Option A', 'Option B', 'Option C']}
                value="Option A"
              />
            </Stack>
          </Drawer>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const WithFooterAndExtra: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Open
          </Button>
          <Drawer
            open={open}
            onClose={() => setOpen(false)}
            title="Edit Profile"
            extra={
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Reset
              </Button>
            }
            footer={
              <>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setOpen(false)}>
                  Save
                </Button>
              </>
            }
          >
            <Stack gap="md">
              <FormField label="Name">
                <Input placeholder="Your name" />
              </FormField>
              <FormField label="Bio">
                <Input placeholder="Short bio" />
              </FormField>
            </Stack>
          </Drawer>
        </>
      );
    }
    return <Demo />;
  },
};

export const Sizes: StoryObj = {
  render: () => {
    function Demo() {
      const [size, setSize] = useState<'default' | 'large' | null>(null);
      return (
        <Stack direction="horizontal" gap="md">
          <Button variant="secondary" onClick={() => setSize('default')}>
            default (378)
          </Button>
          <Button variant="secondary" onClick={() => setSize('large')}>
            large (736)
          </Button>
          <Drawer
            open={size != null}
            onClose={() => setSize(null)}
            title={`Size: ${size}`}
            size={size ?? 'default'}
          >
            <p style={{ color: '#666' }}>Preset width via the `size` prop.</p>
          </Drawer>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const NoMaskClosableConfig: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Open (mask click won't close)
          </Button>
          <Drawer
            open={open}
            onClose={() => setOpen(false)}
            title="Locked"
            maskClosable={false}
            keyboard={false}
            footer={
              <Button variant="primary" onClick={() => setOpen(false)}>
                Done
              </Button>
            }
          >
            <p style={{ color: '#666' }}>
              Mask click and Esc are disabled — close via the × or the footer
              button.
            </p>
          </Drawer>
        </>
      );
    }
    return <Demo />;
  },
};

export const Resizable: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      const [size, setSize] = useState<number | null>(null);
      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Open resizable
          </Button>
          <Drawer
            open={open}
            onClose={() => setOpen(false)}
            title="Drag the left edge"
            resizable={{ onResize: (s) => setSize(Math.round(s)) }}
          >
            <p style={{ color: '#666' }}>
              Grab the inner edge and drag to resize. Current width:{' '}
              {size != null ? `${size}px` : 'default'}
            </p>
          </Drawer>
        </>
      );
    }
    return <Demo />;
  },
};
