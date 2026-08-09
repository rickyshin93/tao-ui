import { Button, Stack, Tooltip } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: '数据展示 Data Display/Tooltip',
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <Tooltip title="Prompt text">
      <Button variant="secondary">Hover or focus me</Button>
    </Tooltip>
  ),
};

export const Placements: StoryObj = {
  render: () => (
    <Stack direction="horizontal" gap="md" align="center">
      <Tooltip title="Top" placement="top">
        <Button variant="secondary">Top</Button>
      </Tooltip>
      <Tooltip title="Bottom" placement="bottom">
        <Button variant="secondary">Bottom</Button>
      </Tooltip>
      <Tooltip title="Left" placement="left">
        <Button variant="secondary">Left</Button>
      </Tooltip>
      <Tooltip title="Right" placement="right">
        <Button variant="secondary">Right</Button>
      </Tooltip>
    </Stack>
  ),
};

export const NoArrow: StoryObj = {
  name: 'Without Arrow',
  render: () => (
    <Tooltip title="No arrow tooltip" arrow={false}>
      <Button variant="secondary">No arrow</Button>
    </Tooltip>
  ),
};

export const CustomColor: StoryObj = {
  name: 'Custom Color',
  render: () => (
    <Stack direction="horizontal" gap="md" align="center">
      <Tooltip title="Brand primary" color="#1677ff">
        <Button variant="secondary">#1677ff</Button>
      </Tooltip>
      <Tooltip title="Warm orange" color="#f76b15">
        <Button variant="secondary">#f76b15</Button>
      </Tooltip>
    </Stack>
  ),
};

export const Controlled: StoryObj = {
  render: () => (
    <Tooltip open title="Always visible">
      <Button variant="secondary">Controlled open</Button>
    </Tooltip>
  ),
};
