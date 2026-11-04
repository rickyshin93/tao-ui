import type { Meta, StoryObj } from '@storybook/react';
import { Masonry } from '../src/components/masonry/masonry';
export default {
  title: '数据展示 Data Display/Masonry',
  component: Masonry,
} satisfies Meta<typeof Masonry>;
export const Responsive: StoryObj<typeof Masonry> = {
  render: () => (
    <Masonry
      columns={{ xs: 1, sm: 2, lg: 3 }}
      gutter={16}
      items={[120, 180, 90, 150, 110, 160].map((height, key) => ({
        key,
        height,
        data: key,
        children: (
          <div
            style={{
              height: '100%',
              padding: 16,
              boxSizing: 'border-box',
              borderRadius: 'var(--tao-radius)',
              background: 'var(--tao-color-fill-tertiary)',
            }}
          >
            Tile {key + 1}
          </div>
        ),
      }))}
    />
  ),
};
