import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TaoProvider, Stack } from 'tao-ui';

const meta: Meta = {
  title: '导航 Navigation/Tabs',
};
export default meta;

const basicItems = [
  { key: 'general', label: 'General', children: 'General settings content.' },
  { key: 'security', label: 'Security', children: 'Security settings content.' },
  { key: 'notifications', label: 'Notifications', children: 'Notification preferences.' },
];

export const Line: StoryObj = {
  render: () => (
    <Tabs items={basicItems} />
  ),
};

export const Card: StoryObj = {
  render: () => (
    <Tabs items={basicItems} variant="card" />
  ),
};

export const Controlled: StoryObj = {
  render: () => {
    function Demo() {
      const [key, setKey] = useState('security');
      return (
        <Stack gap="md">
          <Tabs items={basicItems} activeKey={key} onChange={setKey} />
          <p style={{ color: '#888', fontSize: 13 }}>activeKey: {key}</p>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const DisabledTab: StoryObj = {
  render: () => (
    <Tabs
      items={[
        { key: 'a', label: 'Active', children: 'This tab works.' },
        { key: 'b', label: 'Also Active', children: 'This too.' },
        { key: 'c', label: 'Disabled', children: 'Cannot reach.', disabled: true },
      ]}
    />
  ),
};

export const Sizes: StoryObj = {
  render: () => (
    <Stack gap="xl">
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>small</p>
        <Tabs items={basicItems} size="small" />
      </div>
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>medium (default)</p>
        <Tabs items={basicItems} size="medium" />
      </div>
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>large</p>
        <Tabs items={basicItems} size="large" />
      </div>
    </Stack>
  ),
};

export const CardSizes: StoryObj = {
  name: 'Card Variant Sizes',
  render: () => (
    <Stack gap="xl">
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>small</p>
        <Tabs items={basicItems} variant="card" size="small" />
      </div>
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>medium</p>
        <Tabs items={basicItems} variant="card" size="medium" />
      </div>
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>large</p>
        <Tabs items={basicItems} variant="card" size="large" />
      </div>
    </Stack>
  ),
};

export const ProviderInherit: StoryObj = {
  name: 'Inherits from TaoProvider',
  render: () => (
    <TaoProvider size="large">
      <Tabs items={basicItems} variant="card" />
    </TaoProvider>
  ),
};

export const DestroyInactive: StoryObj = {
  name: 'destroyInactiveTabPane',
  render: () => (
    <Tabs
      items={[
        { key: 'a', label: 'Tab A', children: 'Only this panel is in DOM when active.' },
        { key: 'b', label: 'Tab B', children: 'Destroyed when not active.' },
        { key: 'c', label: 'Tab C', children: 'Also destroyed when not active.' },
      ]}
      destroyInactiveTabPane
    />
  ),
};
