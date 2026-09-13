import { Stack, Steps, TaoProvider } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta = {
  title: '导航 Navigation/Steps',
};
export default meta;

const basicItems = [
  { title: 'Finished', content: 'This step is done.' },
  { title: 'In Progress', content: 'Working on it now.' },
  { title: 'Waiting', content: 'Not started yet.' },
];

export const Basic: StoryObj = {
  render: () => <Steps items={basicItems} current={1} />,
};

export const Vertical: StoryObj = {
  render: () => (
    <Steps
      items={basicItems}
      current={1}
      orientation="vertical"
      style={{ maxWidth: 360 }}
    />
  ),
};

export const Clickable: StoryObj = {
  render: () => {
    function Demo() {
      const [current, setCurrent] = useState(0);
      return (
        <Stack gap="md">
          <Steps
            items={basicItems}
            current={current}
            onChange={setCurrent}
          />
          <p style={{ color: '#888', fontSize: 13 }}>current: {current}</p>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const ErrorStatus: StoryObj = {
  name: 'Error status',
  render: () => <Steps items={basicItems} current={1} status="error" />,
};

export const PerStepStatus: StoryObj = {
  name: 'Per-step status',
  render: () => (
    <Steps
      current={2}
      items={[
        { title: 'Done', content: 'Finished.' },
        { title: 'Failed', content: 'Something broke.', status: 'error' },
        { title: 'Running', content: 'In progress.' },
        { title: 'Queued', content: 'Not started.' },
      ]}
    />
  ),
};

export const WithIcon: StoryObj = {
  name: 'With icon',
  render: () => (
    <Steps
      current={1}
      items={[
        { title: 'Login', icon: <span>👤</span> },
        { title: 'Verify', icon: <span>🔑</span> },
        { title: 'Done', icon: <span>🎉</span> },
      ]}
    />
  ),
};

export const IconRender: StoryObj = {
  name: 'iconRender',
  render: () => (
    <Steps
      items={basicItems}
      current={1}
      iconRender={(_node, { index, active }) => (
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: 'grid',
            placeItems: 'center',
            fontSize: 12,
            border: `1px solid ${active ? 'currentColor' : 'transparent'}`,
          }}
        >
          {index + 1}
        </span>
      )}
    />
  ),
};

export const TitlePlacement: StoryObj = {
  name: 'Title placement',
  render: () => (
    <Stack gap="xl">
      <Steps items={basicItems} current={1} titlePlacement="horizontal" />
      <Steps items={basicItems} current={1} titlePlacement="vertical" />
    </Stack>
  ),
};

export const WithProgress: StoryObj = {
  name: 'With percent',
  render: () => {
    function Demo() {
      const [percent, setPercent] = useState(40);
      return (
        <Stack gap="md">
          <Steps
            items={basicItems}
            current={1}
            percent={percent}
            onChange={() => setPercent((p) => (p >= 100 ? 10 : p + 30))}
          />
          <p style={{ color: '#888', fontSize: 13 }}>percent: {percent}</p>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const DotStyle: StoryObj = {
  name: 'Dot style',
  render: () => <Steps items={basicItems} current={1} type="dot" />,
};

export const DotWithCustomDot: StoryObj = {
  name: 'Dot with custom dot',
  render: () => (
    <Steps
      items={basicItems}
      current={1}
      type="dot"
      iconRender={() => (
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'currentColor',
          }}
        />
      )}
    />
  ),
};

export const Navigation: StoryObj = {
  render: () => {
    function Demo() {
      const [current, setCurrent] = useState(0);
      return (
        <Steps
          type="navigation"
          current={current}
          onChange={setCurrent}
          items={[
            { title: 'Step 1', content: 'First' },
            { title: 'Step 2', content: 'Second' },
            { title: 'Step 3', content: 'Third' },
          ]}
        />
      );
    }
    return <Demo />;
  },
};

export const Panel: StoryObj = {
  render: () => {
    function Demo() {
      const [current, setCurrent] = useState(1);
      return (
        <Stack gap="xl">
          <Steps
            type="panel"
            current={current}
            onChange={setCurrent}
            items={[
              { title: 'One' },
              { title: 'Two' },
              { title: 'Three' },
              { title: 'Four' },
            ]}
          />
          <Steps
            type="panel"
            variant="outlined"
            current={current}
            onChange={setCurrent}
            items={[
              { title: 'One' },
              { title: 'Two' },
              { title: 'Three' },
              { title: 'Four' },
            ]}
          />
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Inline: StoryObj = {
  render: () => {
    function Demo() {
      const [current, setCurrent] = useState(1);
      return (
        <Stack gap="xl">
          <Steps
            type="inline"
            current={current}
            onChange={setCurrent}
            items={[
              { title: 'One', content: 'First step' },
              { title: 'Two', content: 'Second step' },
              { title: 'Three', content: 'Third step' },
            ]}
          />
          <Steps
            type="inline"
            titlePlacement="vertical"
            current={current}
            onChange={setCurrent}
            items={[
              { title: 'One', content: 'First step' },
              { title: 'Two', content: 'Second step' },
              { title: 'Three', content: 'Third step' },
            ]}
          />
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const MaxCount: StoryObj = {
  name: 'Max count',
  render: () => (
    <Steps
      current={3}
      maxCount={5}
      items={Array.from({ length: 10 }, (_, index) => ({
        title: `Step ${index + 1}`,
      }))}
    />
  ),
};

export const Variants: StoryObj = {
  render: () => (
    <Stack gap="xl">
      <Steps items={basicItems} current={1} variant="filled" />
      <Steps items={basicItems} current={1} variant="outlined" />
    </Stack>
  ),
};

export const Sizes: StoryObj = {
  render: () => (
    <Stack gap="xl">
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>small</p>
        <Steps items={basicItems} current={1} size="small" />
      </div>
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
          medium (default)
        </p>
        <Steps items={basicItems} current={1} size="medium" />
      </div>
    </Stack>
  ),
};

export const DisabledStep: StoryObj = {
  name: 'Disabled step',
  render: () => (
    <Steps
      current={1}
      onChange={() => {}}
      items={[
        { title: 'First' },
        { title: 'Second' },
        { title: 'Locked', disabled: true },
      ]}
    />
  ),
};

export const Ellipsis: StoryObj = {
  render: () => (
    <Stack gap="xl">
      <div style={{ maxWidth: 520 }}>
        <Steps items={basicItems} current={1} ellipsis />
      </div>
      <div style={{ maxWidth: 520 }}>
        <Steps
          items={[
            {
              title: 'A rather long first title',
              subTitle: 'with a subtitle',
              content: 'And a long description that will be truncated.',
            },
            { title: 'Second', content: 'Also truncated when needed.' },
          ]}
          current={0}
          ellipsis
        />
      </div>
    </Stack>
  ),
};

export const Initial: StoryObj = {
  render: () => <Steps items={basicItems} initial={2} current={3} />,
};

export const SemanticStyling: StoryObj = {
  name: 'Semantic DOM styling',
  render: () => (
    <Steps
      items={basicItems}
      current={1}
      styles={{
        itemIcon: { boxShadow: '0 0 0 3px var(--tao-control-outline)' },
      }}
      classNames={{ root: 'sb-steps-root' }}
    />
  ),
};

export const ProviderInherit: StoryObj = {
  name: 'Inherits from TaoProvider',
  render: () => (
    <TaoProvider size="small">
      <Steps items={basicItems} current={1} variant="outlined" />
    </TaoProvider>
  ),
};
