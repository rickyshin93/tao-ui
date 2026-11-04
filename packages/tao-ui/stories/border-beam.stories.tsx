import type { Meta, StoryObj } from '@storybook/react';
import { BorderBeam } from '../src/components/border-beam/border-beam';
import { Card } from '../src/components/card/card';
export default {
  title: '通用 General/BorderBeam',
  component: BorderBeam,
} satisfies Meta<typeof BorderBeam>;
export const Activity: StoryObj<typeof BorderBeam> = {
  render: () => (
    <BorderBeam count={2} lineWidth={2} duration={5}>
      <Card title="Activity stream" style={{ maxWidth: 420 }}>
        12 running jobs. The moving border highlights this active panel.
      </Card>
    </BorderBeam>
  ),
};
export const CustomColors: StoryObj<typeof BorderBeam> = {
  render: () => (
    <BorderBeam
      items={[
        { color: 'var(--tao-color-primary)' },
        { color: 'var(--tao-color-success)', size: 160 },
      ]}
    >
      <Card title="Two colors" style={{ maxWidth: 420 }}>
        Each beam can use its own size, color and line width.
      </Card>
    </BorderBeam>
  ),
};
