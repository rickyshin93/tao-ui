import { Button, Popover, Stack } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: '数据展示 Data Display/Popover',
};
export default meta;

const demoContent = (
  <p style={{ margin: 0 }}>
    This is the popover body. It can hold any rich content.
  </p>
);

const placementContent = (
  <div>
    <div>Content</div>
    <div>Content</div>
  </div>
);

const centeredStoryStyle = {
  display: 'grid',
  minHeight: '100vh',
  placeItems: 'center',
} as const;

export const Hover: StoryObj = {
  name: 'Trigger: hover (default)',
  render: () => (
    <div style={centeredStoryStyle}>
      <Popover title="Popover title" content={demoContent}>
        <Button variant="secondary">Hover me</Button>
      </Popover>
    </div>
  ),
};

export const Click: StoryObj = {
  name: 'Trigger: click',
  render: () => (
    <div style={centeredStoryStyle}>
      <Popover trigger="click" title="Popover title" content={demoContent}>
        <Button variant="secondary">Click me</Button>
      </Popover>
    </div>
  ),
};

export const Placement: StoryObj = {
  render: () => (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'grid',
        minWidth: 880,
        minHeight: '100vh',
        padding: '128px 220px',
        placeItems: 'center',
      }}
    >
      <div style={{ display: 'grid', gap: 24, width: 440 }}>
        <Stack
          direction="horizontal"
          gap="sm"
          style={{ justifyContent: 'center' }}
        >
          {(['topLeft', 'top', 'topRight'] as const).map((placement) => (
            <Popover
              key={placement}
              placement={placement}
              title={placement}
              content={placementContent}
            >
              <Button variant="secondary" style={{ width: 104 }}>
                {placement}
              </Button>
            </Popover>
          ))}
        </Stack>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            minHeight: 168,
          }}
        >
          <Stack gap="sm" style={{ justifyContent: 'center' }}>
            {(['leftTop', 'left', 'leftBottom'] as const).map((placement) => (
              <Popover
                key={placement}
                placement={placement}
                title={placement}
                content={placementContent}
              >
                <Button variant="secondary" style={{ width: 104 }}>
                  {placement}
                </Button>
              </Popover>
            ))}
          </Stack>

          <Stack gap="sm" style={{ justifyContent: 'center' }}>
            {(['rightTop', 'right', 'rightBottom'] as const).map(
              (placement) => (
                <Popover
                  key={placement}
                  placement={placement}
                  title={placement}
                  content={placementContent}
                >
                  <Button variant="secondary" style={{ width: 104 }}>
                    {placement}
                  </Button>
                </Popover>
              ),
            )}
          </Stack>
        </div>

        <Stack
          direction="horizontal"
          gap="sm"
          style={{ justifyContent: 'center' }}
        >
          {(['bottomLeft', 'bottom', 'bottomRight'] as const).map(
            (placement) => (
              <Popover
                key={placement}
                placement={placement}
                title={placement}
                content={placementContent}
              >
                <Button variant="secondary" style={{ width: 104 }}>
                  {placement}
                </Button>
              </Popover>
            ),
          )}
        </Stack>
      </div>
    </div>
  ),
};
