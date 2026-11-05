import { Button, Collapse, type CollapseItem, Stack } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const items: CollapseItem[] = [
  {
    key: 'overview',
    label: 'Project overview',
    children: 'Keep project details and progress together.',
  },
  {
    key: 'members',
    label: 'Team members',
    children: 'Manage collaborators and their access.',
  },
  {
    key: 'billing',
    label: 'Billing details',
    children: 'Your next invoice and payment details.',
  },
];

export default {
  title: '数据展示 Data Display/Collapse',
  component: Collapse,
  args: { items, defaultActiveKey: ['overview'] },
} satisfies Meta<typeof Collapse>;

type Story = StoryObj<typeof Collapse>;
export const Basic: Story = {};
export const Accordion: Story = { args: { accordion: true } };
export const Borderless: Story = { args: { bordered: false } };
export const Ghost: Story = { args: { ghost: true } };
export const EndIcon: Story = { args: { expandIconPlacement: 'end' } };
export const Sizes: Story = {
  render: () => (
    <Stack gap="lg">
      {(['small', 'medium', 'large'] as const).map((size) => (
        <Collapse
          key={size}
          items={items}
          defaultActiveKey="overview"
          size={size}
        />
      ))}
    </Stack>
  ),
};
export const TriggerModes: Story = {
  args: {
    items: [
      items[0],
      { ...items[1], collapsible: 'icon' },
      { ...items[2], collapsible: 'disabled' },
    ],
  },
};
function ControlledDemo() {
  const [activeKey, setActiveKey] = useState<string[]>(['overview']);
  return (
    <Stack>
      <Button
        onClick={() =>
          setActiveKey(
            activeKey.length ? [] : items.map((item) => String(item.key)),
          )
        }
      >
        Toggle all
      </Button>
      <Collapse items={items} activeKey={activeKey} onChange={setActiveKey} />
    </Stack>
  );
}
export const Controlled: Story = { render: () => <ControlledDemo /> };
