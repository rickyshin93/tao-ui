import { createRef } from 'react';
import { Upload, type UploadProps, type UploadRef } from '../../src';

interface UploadResponse {
  id: string;
}

const ref = createRef<UploadRef<UploadResponse>>();
const beforeUpload: NonNullable<UploadProps['beforeUpload']> = () => {};
const onRemove: NonNullable<UploadProps['onRemove']> = async () => {};

export const upload = (
  <Upload<UploadResponse>
    ref={ref}
    beforeUpload={beforeUpload}
    onRemove={onRemove}
    customRequest={({ onSuccess }) => {
      onSuccess?.({ id: 'uploaded' });
    }}
    onChange={({ file }) => {
      const id: string | undefined = file.response?.id;
      void id;
    }}
  />
);

export const cancellableUpload = (
  <Upload
    beforeUpload={async (file) => file}
    onRemove={() => false}
    customRequest={(_, { defaultRequest }) => {
      void defaultRequest;
      return { abort() {} };
    }}
  />
);

export const invalidResponse: UploadProps<UploadResponse> = {
  // @ts-expect-error completion data must satisfy the caller's response type
  fileList: [{ uid: '1', name: 'a', response: { id: 123 } }],
};
