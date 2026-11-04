import { expect, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createRef } from 'react';
import {
  Upload,
  type UploadFile,
  type UploadProps,
  type UploadRef,
} from '../../src/components/upload/upload';
import { TaoProvider } from '../../src/provider/tao-provider';

function pick(container: HTMLElement, names: string[]) {
  fireEvent.change(container.querySelector('input[type=file]')!, {
    target: {
      files: names.map(
        (name) => new File(['body'], name, { type: 'text/plain' }),
      ),
    },
  });
}
test('uploads real file objects through the request contract and exposes progress/done payloads', async () => {
  const events: string[] = [];
  let request:
    | Parameters<NonNullable<UploadProps['customRequest']>>[0]
    | undefined;
  const { container } = render(
    <Upload
      action="/files"
      data={{ folder: 'docs' }}
      customRequest={(options) => {
        request = options;
      }}
      onChange={(info) =>
        events.push(`${info.file.status}:${info.file.percent ?? 0}`)
      }
    >
      Choose
    </Upload>,
  );
  pick(container, ['guide.txt']);
  await waitFor(() => expect(request?.action).toBe('/files'));
  expect(request?.data).toEqual({ folder: 'docs' });
  expect(request?.file).toBeInstanceOf(File);
  act(() => request?.onProgress?.({ percent: 50 }));
  act(() => request?.onSuccess?.({ id: 'saved' }));
  expect(events).toEqual(['uploading:0', 'uploading:50', 'done:100']);
  expect(screen.getByText('guide.txt')).toBeTruthy();
});
test('beforeUpload false keeps the file without uploading and LIST_IGNORE removes it from the list', async () => {
  let calls = 0;
  const files: UploadFile[] = [];
  const { container } = render(
    <Upload
      multiple
      beforeUpload={(file) =>
        file.name === 'skip.txt' ? Upload.LIST_IGNORE : false
      }
      customRequest={() => {
        calls += 1;
      }}
      onChange={(info) => files.push(info.file)}
    >
      Choose
    </Upload>,
  );
  pick(container, ['keep.txt', 'skip.txt']);
  await screen.findByText('keep.txt');
  expect(screen.queryByText('skip.txt')).toBeNull();
  expect(calls).toBe(0);
  expect(files[0].status).toBeUndefined();
});
test('transformed files upload and maxCount one replaces the previous file', async () => {
  const requests: File[] = [];
  const { container } = render(
    <Upload
      maxCount={1}
      beforeUpload={(file) =>
        new File(['converted'], file.name, { type: 'text/plain' })
      }
      customRequest={(options) => {
        requests.push(options.file as File);
      }}
    />,
  );
  pick(container, ['first.txt']);
  await screen.findByText('first.txt');
  pick(container, ['next.txt']);
  await screen.findByText('next.txt');
  expect(screen.queryByText('first.txt')).toBeNull();
  expect(await requests[1].text()).toBe('converted');
});
test('remove veto is honored and accepted removal aborts an active request and ignores late callbacks', async () => {
  let allowRemove = false;
  let aborted = 0;
  let request:
    | Parameters<NonNullable<UploadProps['customRequest']>>[0]
    | undefined;
  const statuses: (string | undefined)[] = [];
  const { container } = render(
    <Upload
      onRemove={async () => allowRemove}
      customRequest={(options) => {
        request = options;
        return {
          abort: () => {
            aborted += 1;
          },
        };
      }}
      onChange={(info) => statuses.push(info.file.status)}
    />,
  );
  pick(container, ['pending.txt']);
  await screen.findByText('pending.txt');
  fireEvent.click(
    screen.getByRole('button', { name: 'Remove file pending.txt' }),
  );
  await act(async () => {});
  expect(aborted).toBe(0);
  allowRemove = true;
  fireEvent.click(
    screen.getByRole('button', { name: 'Remove file pending.txt' }),
  );
  await waitFor(() => expect(screen.queryByText('pending.txt')).toBeNull());
  act(() => request?.onSuccess?.({}));
  expect(aborted).toBe(1);
  expect(statuses).toEqual(['uploading', 'removed']);
});
test('request failures are visible, controlled file lists stay owned by the parent, and refs expose their list', async () => {
  const ref = createRef<UploadRef>();
  const file = { uid: '1', name: 'existing.txt', status: 'done' } as const;
  const { rerender } = render(<Upload ref={ref} fileList={[file]} />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Remove file existing.txt' }),
  );
  await act(async () => {});
  expect(screen.getByText('existing.txt')).toBeTruthy();
  expect(ref.current?.fileList).toEqual([file]);
  rerender(
    <Upload
      ref={ref}
      fileList={[
        { ...file, status: 'error', error: new Error('Server unavailable') },
      ]}
    />,
  );
  expect(screen.getByText('Server unavailable')).toBeTruthy();
});
test('inherits disabled behavior and supports Dragger, semantic parts and custom list rendering', () => {
  const { container } = render(
    <TaoProvider disabled>
      <Upload.Dragger
        height={140}
        defaultFileList={[{ uid: '1', name: 'document.txt' }]}
        classNames={{ trigger: 'dropzone' }}
        itemRender={(_, file) => <strong>{file.name}</strong>}
      >
        Drop files
      </Upload.Dragger>
    </TaoProvider>,
  );
  expect(container.querySelector('input[type=file]')).toBeDisabled();
  expect(container.querySelector('[data-tao-upload-trigger]')).toHaveClass(
    'dropzone',
  );
  expect(container.querySelector('[data-tao-upload]')).toHaveStyle({
    height: '140px',
  });
  expect(screen.getByText('document.txt').tagName).toBe('STRONG');
});
