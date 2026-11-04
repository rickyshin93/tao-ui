import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../src/components/button/button';
import { Upload } from '../src/components/upload/upload';

const meta = {
  title: '数据录入 Data Entry/Upload',
  component: Upload,
} satisfies Meta<typeof Upload>;
export default meta;
type Story = StoryObj<typeof meta>;
export const LocalSelection: Story = {
  render: () => (
    <Upload beforeUpload={() => false}>
      <Button>Choose files</Button>
    </Upload>
  ),
};
export const DragFiles: Story = {
  render: () => (
    <Upload.Dragger multiple beforeUpload={() => false}>
      Drop files here; this example keeps them local.
    </Upload.Dragger>
  ),
};
export const FileStates: Story = {
  args: {
    disabled: true,
    defaultFileList: [
      { uid: '1', name: 'Report.pdf', status: 'done' },
      { uid: '2', name: 'Archive.zip', status: 'uploading', percent: 64 },
      {
        uid: '3',
        name: 'Import.csv',
        status: 'error',
        error: new Error('The upload server rejected this file'),
      },
    ],
  },
};
