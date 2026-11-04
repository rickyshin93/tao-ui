import type { Meta, StoryObj } from '@storybook/react';
import { Carousel } from '../src/components/carousel/carousel';

const slides = ['Explore', 'Review', 'Publish'].map((title, index) => (
  <div key={title}>
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        height: 200,
        background: ['#e7eee9', '#eee9f5', '#f2ece3'][index],
        color: '#27342d',
        fontSize: 24,
      }}
    >
      {title}
    </div>
  </div>
));
const meta = {
  title: '数据展示 Data Display/Carousel',
  component: Carousel,
  args: { children: slides, style: { width: 560, maxWidth: '100%' } },
} satisfies Meta<typeof Carousel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {};
export const Arrows: Story = { args: { arrows: true, draggable: true } };
export const Autoplay: Story = { args: { autoplay: { dotDuration: true } } };
export const Fade: Story = { args: { effect: 'fade', autoplay: true } };
export const Vertical: Story = { args: { dotPlacement: 'end' } };
