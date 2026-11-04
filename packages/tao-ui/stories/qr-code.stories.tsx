import type { Meta, StoryObj } from '@storybook/react';
import { QRCode } from '../src/components/qr-code/qr-code';

const meta = {
  title: '数据展示 Data Display/QRCode',
  component: QRCode,
  args: { value: 'https://github.com/rickyshin93/tao-ui', type: 'svg' },
} satisfies Meta<typeof QRCode>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {};
export const Expired: Story = {
  args: { status: 'expired', onRefresh: () => {} },
};
export const Scanned: Story = { args: { status: 'scanned' } };
