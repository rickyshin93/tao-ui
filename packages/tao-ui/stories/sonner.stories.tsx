import { Button, Sonner, Stack, TaoProvider, toast } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Sonner> = {
  title: '反馈 Feedback/Sonner',
  component: Sonner,
};

export default meta;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const Basic: StoryObj<typeof Sonner> = {
  render: () => (
    <>
      <Stack direction="horizontal" gap="sm">
        <Button
          onClick={() =>
            toast({
              title: 'Event created',
              description: 'Sunday, December 03 at 9:00 AM',
            })
          }
        >
          Show toast
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.success({
              title: 'Saved',
              description: 'Your profile has been updated.',
            })
          }
        >
          Success
        </Button>
      </Stack>
      <Sonner />
    </>
  ),
};

export const Loading: StoryObj<typeof Sonner> = {
  render: () => (
    <>
      <Button
        onClick={() => {
          const id = toast.loading({
            title: 'Syncing workspace',
            description: 'Uploading 24 changed files.',
          });
          setTimeout(() => {
            toast.dismiss(id);
            toast.success({ title: 'Workspace synced' });
          }, 1400);
        }}
      >
        Show loading
      </Button>
      <Sonner richColors closeButton />
    </>
  ),
};

export const PromiseApi: StoryObj<typeof Sonner> = {
  render: () => (
    <>
      <Stack direction="horizontal" gap="sm">
        <Button
          onClick={() =>
            toast.promise(wait(1400).then(() => '0.0.15'), {
              loading: {
                title: 'Publishing...',
                description: 'Building assets and uploading package.',
              },
              success: (version) => ({
                title: 'Published',
                description: `Version ${version} is now live on npm.`,
              }),
              error: {
                title: 'Publish failed',
                description: 'Please retry after checking release logs.',
              },
            })
          }
        >
          Promise success
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.promise(
              wait(1400).then(() => {
                throw new Error('Network interrupted');
              }),
              {
                loading: {
                  title: 'Uploading...',
                  description: 'Syncing 12 files to storage.',
                },
                success: { title: 'Done' },
                error: (error) => ({
                  title: 'Upload failed',
                  description: (error as Error).message,
                  action: { label: 'Retry' },
                }),
              },
            ).catch(() => undefined)
          }
        >
          Promise error
        </Button>
      </Stack>
      <Sonner richColors closeButton />
    </>
  ),
};

export const Custom: StoryObj<typeof Sonner> = {
  render: () => (
    <>
      <Button
        onClick={() =>
          toast.custom(
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>Team invitation</div>
                <div style={{ fontSize: 13, color: 'var(--tao-color-text-secondary)' }}>
                  Sarah invited you to join the design workspace.
                </div>
              </div>
              <Button size="small">Accept</Button>
            </div>,
            { closable: true },
          )
        }
      >
        Show custom toast
      </Button>
      <Sonner closeButton />
    </>
  ),
};

export const RichColors: StoryObj<typeof Sonner> = {
  render: () => (
    <>
      <Stack direction="horizontal" gap="sm">
        <Button
          onClick={() =>
            toast.info({
              title: 'Deploy started',
              description: 'We will notify you when it finishes.',
              action: { label: 'View' },
            })
          }
        >
          Info
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.error({
              title: 'Build failed',
              description: 'Check logs and retry.',
              cancel: { label: 'Dismiss' },
            })
          }
        >
          Error
        </Button>
      </Stack>
      <Sonner richColors closeButton />
    </>
  ),
};

export const Actions: StoryObj<typeof Sonner> = {
  render: () => (
    <>
      <Stack direction="horizontal" gap="sm">
        <Button
          onClick={() =>
            toast({
              title: 'Message sent',
              description: 'Your message has been delivered.',
              action: {
                label: 'Undo',
                onClick: () =>
                  toast.warning({
                    title: 'Send reverted',
                    description: 'Draft restored to composer.',
                  }),
              },
              cancel: { label: 'Dismiss' },
            })
          }
        >
          Undo toast
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.warning({
              title: 'Storage almost full',
              description: 'Delete unused files or upgrade your plan.',
              action: { label: 'Manage storage' },
            })
          }
        >
          Warning action
        </Button>
      </Stack>
      <Sonner closeButton richColors />
    </>
  ),
};

export const FormSubmit: StoryObj<typeof Sonner> = {
  render: () => (
    <>
      <Stack direction="horizontal" gap="sm">
        <Button
          onClick={async () => {
            await toast.promise(wait(1200), {
              loading: {
                title: 'Submitting form',
                description: 'Validating fields and saving changes.',
              },
              success: {
                title: 'Profile updated',
                description: 'Name, email, and preferences are saved.',
              },
              error: {
                title: 'Submit failed',
              },
            });
          }}
        >
          Submit profile
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.promise(
              wait(1200).then(() => {
                throw new Error('Card declined');
              }),
              {
                loading: {
                  title: 'Submitting payment',
                  description: 'Contacting payment gateway.',
                },
                success: { title: 'Paid' },
                error: (error) => ({
                  title: 'Payment failed',
                  description: (error as Error).message,
                }),
              },
            ).catch(() => undefined)
          }
        >
          Submit payment
        </Button>
      </Stack>
      <Sonner richColors />
    </>
  ),
};

export const DeleteConfirmFlow: StoryObj<typeof Sonner> = {
  render: () => (
    <>
      <Stack direction="horizontal" gap="sm">
        <Button
          variant="destructive"
          onClick={() =>
            toast.error({
              title: 'Project deleted',
              description: 'The project has been moved to trash.',
              action: {
                label: 'Undo',
                onClick: () =>
                  toast.success({
                    title: 'Project restored',
                    description: 'Your project is active again.',
                  }),
              },
            })
          }
        >
          Delete project
        </Button>
      </Stack>
      <Sonner richColors closeButton />
    </>
  ),
};

export const UploadComplete: StoryObj<typeof Sonner> = {
  render: () => (
    <>
      <Stack direction="horizontal" gap="sm">
        <Button
          onClick={async () => {
            await toast.promise(wait(1000), {
              loading: {
                title: 'Uploading assets',
                description: '3 files remaining...',
              },
              success: {
                title: 'Upload complete',
                description: '12 images were added to your media library.',
                action: { label: 'Open library' },
              },
            });
          }}
        >
          Upload success
        </Button>
      </Stack>
      <Sonner richColors position="top-right" />
    </>
  ),
};

export const Positions: StoryObj<typeof Sonner> = {
  render: () => (
    <>
      <Stack direction="horizontal" gap="sm" wrap>
        <Button
          onClick={() =>
            toast({
              title: 'Top left',
              description: 'Positioned in the top-left corner.',
            })
          }
        >
          Trigger
        </Button>
      </Stack>
      <Sonner position="top-left" />
    </>
  ),
};

export const StackAndLimit: StoryObj<typeof Sonner> = {
  render: () => (
    <>
      <Stack direction="horizontal" gap="sm">
        <Button
          onClick={() => {
            for (let index = 1; index <= 5; index += 1) {
              toast({
                title: `Queued task #${index}`,
                description: `Background job ${index} is now running.`,
              });
            }
          }}
        >
          Push 5 toasts
        </Button>
        <Button variant="ghost" onClick={() => toast.dismiss()}>
          Clear all
        </Button>
      </Stack>
      <Sonner visibleToasts={3} />
    </>
  ),
};

export const CustomDuration: StoryObj<typeof Sonner> = {
  render: () => (
    <>
      <Stack direction="horizontal" gap="sm">
        <Button
          onClick={() =>
            toast({
              title: 'Autosaves enabled',
              description: 'This one disappears quickly.',
              duration: 1200,
            })
          }
        >
          Short
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast({
              title: 'Manual review needed',
              description: 'This one stays longer for attention.',
              duration: 8000,
            })
          }
        >
          Long
        </Button>
      </Stack>
      <Sonner closeButton />
    </>
  ),
};

export const Themed: StoryObj<typeof Sonner> = {
  render: () => (
    <TaoProvider theme={{ token: { colorPrimary: 'oklch(0.55 0.22 300)' } }}>
      <Button
        onClick={() =>
          toast.info({
            title: 'Stripe mode',
            description: 'Toast follows provider theme tokens.',
          })
        }
      >
        Show themed toast
      </Button>
      <Sonner richColors position="top-center" />
    </TaoProvider>
  ),
};
