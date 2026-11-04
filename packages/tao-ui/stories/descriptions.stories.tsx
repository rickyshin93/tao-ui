import type { Meta, StoryObj } from '@storybook/react';
import { Descriptions } from '../src/components/descriptions/descriptions';
export default {
  title: '数据展示 Data Display/Descriptions',
  component: Descriptions,
} satisfies Meta<typeof Descriptions>;
export const Record: StoryObj<typeof Descriptions> = {
  args: {
    title: 'Account details',
    bordered: true,
    column: { xs: 1, md: 3 },
    items: [
      { key: 'name', label: 'Name', children: 'Ada Lovelace' },
      { key: 'plan', label: 'Plan', children: 'Team' },
      { key: 'region', label: 'Region', children: 'London' },
      {
        key: 'notes',
        label: 'Notes',
        children: 'Shared product design workspace',
        span: 'filled',
      },
    ],
  },
};
export const Vertical: StoryObj<typeof Descriptions> = {
  args: { ...Record.args, layout: 'vertical' },
};
