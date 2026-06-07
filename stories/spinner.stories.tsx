import { Spinner, Stack } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';

const meta: Meta = {
  title: '反馈 Feedback/Spinner',
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <Stack gap="lg" direction="horizontal" style={{ alignItems: 'center' }}>
      <Spinner size="small" />
      <Spinner size="medium" />
      <Spinner size="large" />
    </Stack>
  ),
};

export const WithTip: StoryObj = {
  render: () => <Spinner tip="Loading…" />,
};

export const CustomIndicator: StoryObj = {
  render: () => (
    <Spinner
      indicator={<span style={{ fontSize: 24 }}>⏳</span>}
      tip="Please wait"
    />
  ),
};

export const WrapContent: StoryObj = {
  name: 'Wrap content (overlay)',
  render: () => {
    function Demo() {
      const [spinning, setSpinning] = useState(true);
      return (
        <Stack gap="md" style={{ maxWidth: 360 }}>
          <button type="button" onClick={() => setSpinning((s) => !s)}>
            {spinning ? 'Stop' : 'Start'} loading
          </button>
          <Spinner spinning={spinning} tip="Loading">
            <div
              style={{
                padding: 24,
                border: '1px solid #e5e5e5',
                borderRadius: 8,
                lineHeight: 1.6,
              }}
            >
              <h4 style={{ margin: '0 0 8px' }}>Card title</h4>
              <p style={{ margin: 0 }}>
                Content stays in place and dims while the spinner overlays it.
              </p>
            </div>
          </Spinner>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Delay: StoryObj = {
  name: 'Delay (no flicker)',
  render: () => {
    function Demo() {
      const [spinning, setSpinning] = useState(false);
      return (
        <Stack gap="md" style={{ maxWidth: 360 }}>
          <p style={{ color: '#888', fontSize: 13 }}>
            500ms delay — quick toggles won&apos;t flash the spinner.
          </p>
          <button type="button" onClick={() => setSpinning((s) => !s)}>
            Toggle spinning ({String(spinning)})
          </button>
          <Spinner spinning={spinning} delay={500}>
            <div
              style={{
                padding: 24,
                border: '1px solid #e5e5e5',
                borderRadius: 8,
              }}
            >
              Toggle quickly to see the delay in action.
            </div>
          </Spinner>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Fullscreen: StoryObj = {
  render: () => {
    function Demo() {
      const [spinning, setSpinning] = useState(false);
      useEffect(() => {
        if (!spinning) return;
        const t = setTimeout(() => setSpinning(false), 3000);
        return () => clearTimeout(t);
      }, [spinning]);
      return (
        <>
          <button type="button" onClick={() => setSpinning(true)}>
            Show fullscreen spinner (3s)
          </button>
          <Spinner fullscreen spinning={spinning} tip="Loading…" />
        </>
      );
    }
    return <Demo />;
  },
};
