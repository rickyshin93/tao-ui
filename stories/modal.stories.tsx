import { Button, FormField, Input, Modal, Stack } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta = {
  title: '反馈 Feedback/Modal',
};
export default meta;

export const Basic: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Open Modal
          </Button>
          <Modal
            open={open}
            title="Edit Profile"
            onClose={() => setOpen(false)}
            onOk={() => setOpen(false)}
          >
            <Stack gap="md">
              <FormField label="Name">
                <Input placeholder="Your name" />
              </FormField>
              <FormField label="Email">
                <Input placeholder="you@example.com" />
              </FormField>
            </Stack>
          </Modal>
        </>
      );
    }
    return <Demo />;
  },
};

export const ConfirmLoading: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      const [loading, setLoading] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Open Confirm
          </Button>
          <Modal
            open={open}
            title="Delete item?"
            confirmLoading={loading}
            okText="Delete"
            onClose={() => setOpen(false)}
            onOk={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setOpen(false);
              }, 1500);
            }}
          >
            <p>This action cannot be undone.</p>
          </Modal>
        </>
      );
    }
    return <Demo />;
  },
};

export const CustomFooter: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Open
          </Button>
          <Modal
            open={open}
            title="Custom footer"
            width={420}
            onClose={() => setOpen(false)}
            footer={
              <Button variant="primary" onClick={() => setOpen(false)}>
                Got it
              </Button>
            }
          >
            <p>Single-action footer.</p>
          </Modal>
        </>
      );
    }
    return <Demo />;
  },
};

export const NoFooterTopAligned: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Open
          </Button>
          <Modal
            open={open}
            title="Announcement"
            footer={null}
            centered={false}
            onClose={() => setOpen(false)}
          >
            <p>Top-aligned modal with no footer. Close via × or mask.</p>
          </Modal>
        </>
      );
    }
    return <Demo />;
  },
};

export const FooterRenderFn: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Open
          </Button>
          <Modal
            open={open}
            title="Compose around defaults"
            onClose={() => setOpen(false)}
            onOk={() => setOpen(false)}
            footer={(origin, { CancelBtn }) => (
              <Stack direction="horizontal" gap="sm" style={{ width: '100%' }}>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Read later
                </Button>
                <span style={{ flex: 1 }} />
                <CancelBtn />
                {origin}
              </Stack>
            )}
          >
            <p>
              The render-prop footer receives the default node plus{' '}
              <code>OkBtn</code> / <code>CancelBtn</code> so you can keep
              defaults and add your own.
            </p>
          </Modal>
        </>
      );
    }
    return <Demo />;
  },
};

export const ButtonProps: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Open
          </Button>
          <Modal
            open={open}
            title="Delete item?"
            okText="Delete"
            okButtonProps={{ variant: 'destructive' }}
            cancelButtonProps={{ variant: 'ghost' }}
            onClose={() => setOpen(false)}
            onOk={() => setOpen(false)}
          >
            <p>OK is a destructive button via okButtonProps.</p>
          </Modal>
        </>
      );
    }
    return <Demo />;
  },
};

export const KeepAlive: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Open (state preserved across reopen)
          </Button>
          <Modal
            open={open}
            title="destroyOnHidden = false"
            destroyOnHidden={false}
            onClose={() => setOpen(false)}
            onOk={() => setOpen(false)}
          >
            <FormField label="Type, close, reopen — text stays">
              <Input placeholder="I survive close" />
            </FormField>
          </Modal>
        </>
      );
    }
    return <Demo />;
  },
};

export const ImperativeConfirm: StoryObj = {
  render: () => (
    <Stack direction="horizontal" gap="sm">
      <Button
        variant="destructive"
        onClick={() =>
          Modal.confirm({
            title: 'Delete item?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            okButtonProps: { variant: 'destructive' },
            onOk: () => new Promise((res) => setTimeout(res, 1200)),
          })
        }
      >
        confirm (async OK)
      </Button>
      <Button
        variant="secondary"
        onClick={() => Modal.info({ title: 'Info', content: 'FYI.' })}
      >
        info
      </Button>
      <Button
        variant="secondary"
        onClick={() => Modal.success({ title: 'Saved!' })}
      >
        success
      </Button>
      <Button
        variant="secondary"
        onClick={() => Modal.error({ title: 'Something broke' })}
      >
        error
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          Modal.warning({ title: 'Heads up', content: 'Check your input.' })
        }
      >
        warning
      </Button>
    </Stack>
  ),
};

export const UseModalHook: StoryObj = {
  render: () => {
    function Demo() {
      const [modal, contextHolder] = Modal.useModal();
      return (
        <>
          <Button
            variant="secondary"
            onClick={() =>
              modal.confirm({
                title: 'Context-aware confirm',
                content: 'Inherits TaoProvider config & theme.',
              })
            }
          >
            useModal confirm
          </Button>
          {contextHolder}
        </>
      );
    }
    return <Demo />;
  },
};

export const ResponsiveWidth: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Open Responsive Modal
          </Button>
          <Modal
            open={open}
            title="Responsive Width"
            width={{ xs: 'calc(100vw - 32px)', md: 640, xl: 800 }}
            onClose={() => setOpen(false)}
            onOk={() => setOpen(false)}
          >
            Resize the viewport: full-width on phones, 640px from md up,
            800px from xl up.
          </Modal>
        </>
      );
    }
    return <Demo />;
  },
};
