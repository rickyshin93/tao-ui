import { expect, rs, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createRef } from 'react';
import { Form } from '../../src/components/form';
import {
  Upload,
  type UploadChangeParam,
  type UploadRef,
} from '../../src/components/upload/upload';

test('Upload follows Form fileList clearing after file selection and ignores late progress', async () => {
  let form!: ReturnType<typeof Form.useForm>[0];
  const ref = createRef<UploadRef>();
  const request = rs.fn();
  function Demo() {
    [form] = Form.useForm();
    return (
      <Form form={form}>
        <Form.Item
          name="files"
          valuePropName="fileList"
          getValueFromEvent={(info) => (info as UploadChangeParam).fileList}
        >
          <Upload ref={ref} customRequest={request} />
        </Form.Item>
      </Form>
    );
  }
  const view = render(<Demo />);
  const input = view.container.querySelector('input[type=file]')!;
  fireEvent.change(input, {
    target: { files: [new File(['hello'], 'hello.txt')] },
  });
  await screen.findByText('hello.txt');
  await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
  expect(form.getFieldValue('files')).toHaveLength(1);
  act(() => form.setFieldsValue({ files: undefined }));
  expect(form.getFieldValue('files')).toBeUndefined();
  expect(screen.queryByText('hello.txt')).not.toBeInTheDocument();
  expect(ref.current?.fileList).toEqual([]);
  act(() => request.mock.calls[0][0].onProgress({ percent: 50 }));
  expect(screen.queryByText('hello.txt')).not.toBeInTheDocument();
  expect(form.getFieldValue('files')).toBeUndefined();
});

test('explicit undefined fileList stays empty until the parent accepts an upload', async () => {
  const onChange = rs.fn();
  const file = { uid: 'saved', name: 'saved.txt' };
  const view = render(
    <Upload
      fileList={undefined}
      defaultFileList={[file]}
      beforeUpload={() => false}
      onChange={onChange}
    />,
  );
  expect(screen.queryByText('saved.txt')).not.toBeInTheDocument();
  fireEvent.change(view.container.querySelector('input[type=file]')!, {
    target: { files: [new File(['hello'], 'new.txt')] },
  });
  await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
  expect(onChange.mock.calls[0][0].fileList[0].name).toBe('new.txt');
  expect(screen.queryByText('new.txt')).not.toBeInTheDocument();
  view.rerender(<Upload fileList={[file]} />);
  expect(screen.getByText('saved.txt')).toBeInTheDocument();
});
