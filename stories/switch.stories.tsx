import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Switch, Stack } from '@rockshin/tao-ui';

const meta: Meta = {
  title: '数据录入 Data Entry/Switch',
};
export default meta;

export const Basic: StoryObj = {
  render: () => {
    function Demo() {
      const [a, setA] = useState(false);
      const [b, setB] = useState(true);
      const [c, setC] = useState(true);
      return (
        <Stack direction="horizontal" gap="lg" align="center">
          <Switch checked={a} onChange={setA} />
          <Switch checked={b} onChange={setB} />
          <Switch checked={c} onChange={setC} loading />
          <Switch disabled />
          <Switch checked disabled />
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const WithLabels: StoryObj = {
  render: () => {
    function Demo() {
      const [a, setA] = useState(false);
      const [b, setB] = useState(false);
      return (
        <Stack direction="horizontal" gap="lg" align="center">
          <Switch checked={a} onChange={setA} checkedChildren="ON" unCheckedChildren="OFF" />
          <Switch checked={b} onChange={setB} checkedChildren="是" unCheckedChildren="否" />
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Small: StoryObj = {
  render: () => {
    function Demo() {
      const [a, setA] = useState(true);
      return (
        <Stack direction="horizontal" gap="lg" align="center">
          <Switch size="small" checked={a} onChange={setA} />
          <Switch size="small" />
          <Switch size="small" checked loading />
        </Stack>
      );
    }
    return <Demo />;
  },
};
