import type { Meta, StoryObj } from '@storybook/react';
import { ColorPicker } from '../src/components/color-picker/color-picker';

const meta = {
  title: '数据录入 Data Entry/ColorPicker',
  component: ColorPicker,
} satisfies Meta<typeof ColorPicker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {
  args: { defaultValue: '#2463eb', showText: true },
};
export const Gradient: Story = {
  args: {
    mode: ['single', 'gradient'],
    defaultValue: [
      { color: '#2463eb', percent: 0 },
      { color: '#16a085', percent: 100 },
    ],
    showText: true,
  },
};
export const Presets: Story = {
  args: {
    allowClear: true,
    presets: [
      {
        label: 'Brand colors',
        colors: ['#2463eb', '#16a085', '#e65732', '#8b5cf6'],
      },
    ],
  },
};
export const CustomPanel: Story = {
  args: {
    panelRender: (_, { components: { Picker, Presets } }) => (
      <div>
        <strong>Project palette</strong>
        <Picker />
        <Presets />
      </div>
    ),
  },
};
