import type { Meta, StoryObj } from '@storybook/react';
import { Image } from '../src/components/image/image';

const photo = (color: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="${color}"/><circle cx="420" cy="110" r="46" fill="#fff5"/><path d="M0 400L220 120L420 400Z" fill="#fff8"/><path d="M200 400L430 200L600 400Z" fill="#fff4"/></svg>`)}`;
const meta = {
  title: '数据展示 Data Display/Image',
  component: Image,
  args: { src: photo('#496f5d'), alt: 'Illustrated mountains', width: 240 },
} satisfies Meta<typeof Image>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {};
export const PreviewGroup: Story = {
  render: () => (
    <Image.PreviewGroup>
      <div style={{ display: 'flex', gap: 12 }}>
        <Image src={photo('#496f5d')} alt="Green mountains" width={180} />
        <Image src={photo('#6d5c91')} alt="Purple mountains" width={180} />
      </div>
    </Image.PreviewGroup>
  ),
};
export const Progress: Story = {
  args: {
    src: undefined,
    height: 160,
    placeholder: { progress: { percent: 64 } },
  },
};
export const DisabledPreview: Story = { args: { preview: false } };
export const CustomActions: Story = {
  args: {
    preview: {
      actionsRender: (actions, info) => (
        <>
          {actions}
          <button type="button" onClick={info.actions.onReset}>
            Reset
          </button>
        </>
      ),
    },
  },
};
