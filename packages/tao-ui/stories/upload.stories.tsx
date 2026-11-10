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

const pictureFiles = [
  {
    uid: 'image',
    name: 'image.png',
    status: 'done' as const,
    url: 'https://rickyshin93.github.io/tao-ui/demos/upload/mountain-lake.png',
  },
  {
    uid: 'progress',
    name: 'uploading.png',
    status: 'uploading' as const,
    percent: 48,
  },
  {
    uid: 'error',
    name: 'failed.png',
    status: 'error' as const,
    error: new Error('Example upload error'),
  },
];

export const PictureList: Story = {
  args: {
    listType: 'picture',
    defaultFileList: pictureFiles,
    beforeUpload: () => false,
  },
};
export const PictureCard: Story = {
  args: { ...PictureList.args, listType: 'picture-card' },
};
export const PictureCircle: Story = {
  args: { ...PictureList.args, listType: 'picture-circle' },
};
export const DisabledPictures: Story = {
  args: { ...PictureCard.args, disabled: true },
};
