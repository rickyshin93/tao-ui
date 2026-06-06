import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Splitter, Stack } from 'tao-ui';

const Panel = Splitter.Panel;

const meta: Meta = {
  title: '布局 Layout/Splitter',
};
export default meta;

const boxStyle = (bg: string): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  minHeight: 40,
  background: bg,
  borderRadius: 4,
  color: 'var(--tao-color-text-secondary)',
  fontSize: 14,
});

export const Basic: StoryObj = {
  render: () => (
    <div style={{ height: 200, border: '1px solid var(--tao-color-border-secondary)', borderRadius: 6 }}>
      <Splitter>
        <Panel defaultSize="40%">
          <div style={boxStyle('var(--tao-color-fill-quaternary)')}>Panel 1</div>
        </Panel>
        <Panel>
          <div style={boxStyle('var(--tao-color-fill-tertiary)')}>Panel 2</div>
        </Panel>
      </Splitter>
    </div>
  ),
};

export const Vertical: StoryObj = {
  render: () => (
    <div style={{ height: 300, border: '1px solid var(--tao-color-border-secondary)', borderRadius: 6 }}>
      <Splitter orientation="vertical">
        <Panel defaultSize="40%">
          <div style={boxStyle('var(--tao-color-fill-quaternary)')}>Top</div>
        </Panel>
        <Panel>
          <div style={boxStyle('var(--tao-color-fill-tertiary)')}>Bottom</div>
        </Panel>
      </Splitter>
    </div>
  ),
};

export const ThreePanels: StoryObj = {
  name: 'Multiple Panels',
  render: () => (
    <div style={{ height: 200, border: '1px solid var(--tao-color-border-secondary)', borderRadius: 6 }}>
      <Splitter>
        <Panel defaultSize="25%" min={60}>
          <div style={boxStyle('var(--tao-color-fill-quaternary)')}>Sidebar</div>
        </Panel>
        <Panel min={100}>
          <div style={boxStyle('var(--tao-color-fill-tertiary)')}>Main</div>
        </Panel>
        <Panel defaultSize="25%" min={60}>
          <div style={boxStyle('var(--tao-color-fill-quaternary)')}>Detail</div>
        </Panel>
      </Splitter>
    </div>
  ),
};

export const Collapsible: StoryObj = {
  render: () => (
    <div style={{ height: 200, border: '1px solid var(--tao-color-border-secondary)', borderRadius: 6 }}>
      <Splitter>
        <Panel defaultSize="30%" collapsible min={0}>
          <div style={boxStyle('var(--tao-color-fill-quaternary)')}>Collapsible</div>
        </Panel>
        <Panel>
          <div style={boxStyle('var(--tao-color-fill-tertiary)')}>Main Content</div>
        </Panel>
      </Splitter>
    </div>
  ),
};

export const MinMax: StoryObj = {
  name: 'Min / Max Constraints',
  render: () => (
    <div style={{ height: 200, border: '1px solid var(--tao-color-border-secondary)', borderRadius: 6 }}>
      <Splitter>
        <Panel defaultSize="30%" min={100} max={300}>
          <div style={boxStyle('var(--tao-color-fill-quaternary)')}>min:100 max:300</div>
        </Panel>
        <Panel min={100}>
          <div style={boxStyle('var(--tao-color-fill-tertiary)')}>min:100</div>
        </Panel>
      </Splitter>
    </div>
  ),
};

export const Controlled: StoryObj = {
  render: () => {
    function Demo() {
      const [sizes, setSizes] = useState<number[]>([]);
      return (
        <Stack gap="sm">
          <p style={{ fontSize: 13, color: '#888' }}>
            sizes: [{sizes.map((s) => Math.round(s)).join(', ')}]
          </p>
          <div style={{ height: 200, border: '1px solid var(--tao-color-border-secondary)', borderRadius: 6 }}>
            <Splitter onResize={setSizes}>
              <Panel defaultSize="40%">
                <div style={boxStyle('var(--tao-color-fill-quaternary)')}>Left</div>
              </Panel>
              <Panel>
                <div style={boxStyle('var(--tao-color-fill-tertiary)')}>Right</div>
              </Panel>
            </Splitter>
          </div>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Nested: StoryObj = {
  name: 'Nested (Complex Layout)',
  render: () => (
    <div style={{ height: 400, border: '1px solid var(--tao-color-border-secondary)', borderRadius: 6 }}>
      <Splitter>
        <Panel defaultSize="25%" collapsible min={0}>
          <div style={boxStyle('var(--tao-color-fill-quaternary)')}>Sidebar</div>
        </Panel>
        <Panel>
          <Splitter orientation="vertical">
            <Panel defaultSize="70%">
              <div style={boxStyle('var(--tao-color-fill-tertiary)')}>Editor</div>
            </Panel>
            <Panel collapsible min={0}>
              <div style={boxStyle('var(--tao-color-fill-quaternary)')}>Terminal</div>
            </Panel>
          </Splitter>
        </Panel>
      </Splitter>
    </div>
  ),
};
