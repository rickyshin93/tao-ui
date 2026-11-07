import { expect, rstest, test } from '@rstest/core';
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

test.each(['action', 'data'] as const)(
  'an upload %s failure stays with its file and lets the batch continue',
  async (phase) => {
    const customRequest =
      rstest.fn<NonNullable<UploadProps['customRequest']>>();
    const { container } = render(
      <Upload
        multiple
        action={async (file) => {
          if (phase === 'action' && file.name === 'rejected.pdf')
            throw new Error('Upload preparation failed');
          return '/upload';
        }}
        data={async (file) => {
          if (phase === 'data' && file.name === 'rejected.pdf')
            throw new Error('Upload preparation failed');
          return { tag: file.name };
        }}
        customRequest={customRequest}
      />,
    );
    pick(container, ['rejected.pdf', 'ready.pdf']);
    expect(await screen.findByText('Upload preparation failed')).toBeVisible();
    expect(screen.getByText('ready.pdf')).toBeVisible();
    expect(customRequest).toHaveBeenCalledTimes(1);
    expect(customRequest.mock.calls[0]?.[0].file).toMatchObject({
      name: 'ready.pdf',
    });
  },
);

test('late request progress does not undo a completed Upload row', async () => {
  type Request = Parameters<NonNullable<UploadProps['customRequest']>>[0];
  let request: Request | undefined;
  const onChange = rstest.fn();
  const { container } = render(
    <Upload
      onChange={onChange}
      customRequest={(options) => {
        request = options;
      }}
    />,
  );
  pick(container, ['ready.pdf']);
  await screen.findByText('ready.pdf');
  expect(request).toBeDefined();
  act(() => request!.onSuccess?.({ ok: true }));
  act(() => request!.onProgress?.({ percent: 20 }));
  expect(onChange.mock.calls.map(([info]) => info.file.status)).toEqual([
    'uploading',
    'done',
  ]);
});

test('a custom request throwing synchronously does not stop later files', async () => {
  const { container } = render(
    <Upload
      multiple
      customRequest={(request) => {
        if (request.file instanceof File && request.file.name === 'bad.pdf')
          throw new Error('Request setup failed');
        queueMicrotask(() => request.onSuccess?.({ ok: true }));
      }}
    />,
  );
  pick(container, ['bad.pdf', 'ready.pdf']);
  expect(await screen.findByText('Request setup failed')).toBeVisible();
  await waitFor(() =>
    expect(screen.getByText('ready.pdf').closest('[data-tao-upload-item]')).toHaveAttribute(
      'data-status',
      'done',
    ),
  );
});

test('a late Upload failure cannot replace an already successful request', async () => {
  type Request = Parameters<NonNullable<UploadProps['customRequest']>>[0];
  let request: Request | undefined;
  const onChange = rstest.fn();
  const { container } = render(
    <Upload
      onChange={onChange}
      customRequest={(options) => {
        request = options;
      }}
    />,
  );
  pick(container, ['ready.pdf']);
  await screen.findByText('ready.pdf');
  act(() => request!.onSuccess?.({ ok: true }));
  act(() => request!.onError?.(new Error('Outdated failure')));
  expect(onChange.mock.calls.map(([info]) => info.file.status)).toEqual([
    'uploading',
    'done',
  ]);
  expect(screen.queryByText('Outdated failure')).toBeNull();
});

test('a disabled pastable Upload ignores clipboard files and resumes when enabled', async () => {
  const onChange = rstest.fn();
  const { rerender } = render(
    <Upload disabled pastable onChange={onChange} beforeUpload={() => false} />,
  );
  const paste = () =>
    fireEvent.paste(document, {
      clipboardData: {
        files: [new File(['draft'], 'clipboard.pdf')],
        items: [],
      },
    });
  await act(async () => {
    paste();
  });
  expect(onChange).not.toHaveBeenCalled();
  rerender(<Upload pastable onChange={onChange} beforeUpload={() => false} />);
  paste();
  expect(await screen.findByText('clipboard.pdf')).toBeVisible();
});

test('changing the reported file list does not remove uncontrolled Upload rows', async () => {
  const { container } = render(
    <Upload
      beforeUpload={() => false}
      onChange={({ fileList }) => {
        fileList.splice(0);
      }}
    />,
  );
  pick(container, ['report.pdf']);
  expect(await screen.findByText('report.pdf')).toBeVisible();
});

test('Dragger highlights drag-over and reports dropped files', async () => {
  const onDrop = rstest.fn();
  const { container } = render(
    <Upload.Dragger beforeUpload={() => false} onDrop={onDrop} />,
  );
  const root = container.querySelector('[data-tao-upload]')!;
  const trigger = root.querySelector('[data-tao-upload-trigger] > span')!;
  const file = new File(['report'], 'dropped.pdf');
  const dataTransfer = { files: [file], items: [] };

  fireEvent.dragOver(trigger, { dataTransfer });
  expect(root).toHaveAttribute('data-dragging', 'true');
  fireEvent.drop(trigger, { dataTransfer });
  expect(onDrop).toHaveBeenCalledTimes(1);
  expect(root).not.toHaveAttribute('data-dragging');
  expect(await screen.findByText('dropped.pdf')).toBeVisible();
});

test('disabling Dragger clears an active drag highlight', () => {
  const { container, rerender } = render(<Upload.Dragger />);
  const root = container.querySelector('[data-tao-upload]')!;
  const trigger = root.querySelector('[data-tao-upload-trigger] > span')!;

  fireEvent.dragOver(trigger);
  expect(root).toHaveAttribute('data-dragging', 'true');
  rerender(<Upload.Dragger disabled />);
  expect(root).not.toHaveAttribute('data-dragging');
  rerender(<Upload.Dragger />);
  expect(root).not.toHaveAttribute('data-dragging');
});
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

test('a pending beforeUpload does not emit file changes after unmount', async () => {
  let finish!: (value: false) => void;
  const validation = new Promise<false>((resolve) => {
    finish = resolve;
  });
  const onChange = rstest.fn();
  const { container, unmount } = render(
    <Upload beforeUpload={() => validation} onChange={onChange} />,
  );
  pick(container, ['pending.txt']);
  unmount();
  await act(async () => {
    finish(false);
    await validation;
  });
  expect(onChange).not.toHaveBeenCalled();
});

test('unmount aborts the request and ignores its late callbacks', async () => {
  let request:
    | Parameters<NonNullable<UploadProps['customRequest']>>[0]
    | undefined;
  const abort = rstest.fn();
  const onChange = rstest.fn();
  const { container, unmount } = render(
    <Upload
      action="/files"
      customRequest={(options) => {
        request = options;
        return { abort };
      }}
      onChange={onChange}
    />,
  );
  pick(container, ['active.txt']);
  await waitFor(() => expect(request).toBeDefined());
  expect(onChange).toHaveBeenCalledTimes(1);
  unmount();
  expect(abort).toHaveBeenCalledTimes(1);
  act(() => {
    request?.onProgress?.({ percent: 50 });
    request?.onSuccess?.({});
  });
  expect(onChange).toHaveBeenCalledTimes(1);
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

test('only asks for confirmation once while removal of a file is pending', async () => {
  let confirm!: (allow: boolean) => void;
  const pending = new Promise<boolean>((resolve) => {
    confirm = resolve;
  });
  const onRemove = rstest.fn(() => pending);
  render(
    <Upload
      defaultFileList={[{ uid: 'pending', name: 'pending.txt' }]}
      onRemove={onRemove}
    />,
  );
  const button = screen.getByRole('button', {
    name: 'Remove file pending.txt',
  });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(onRemove).toHaveBeenCalledTimes(1);
  await act(async () => {
    confirm(true);
    await pending;
  });
  expect(screen.queryByText('pending.txt')).toBeNull();
});

test.each(['resolve', 'reject'] as const)(
  'ignores %s of a pending removal after its file is replaced under the same uid',
  async (result) => {
    let settle!: () => void;
    const pending = new Promise<boolean>((resolve, reject) => {
      settle = () => {
        if (result === 'resolve') resolve(true);
        else reject(new Error('Old removal failed'));
      };
    });
    const original = { uid: 'shared', name: 'old.txt' };
    const replacement = { uid: 'shared', name: 'new.txt' };
    const onChange = rstest.fn();
    const onRemove = () => pending;
    const view = render(
      <Upload fileList={[original]} onRemove={onRemove} onChange={onChange} />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove file old.txt' }),
    );
    view.rerender(
      <Upload
        fileList={[replacement]}
        onRemove={onRemove}
        onChange={onChange}
      />,
    );
    await act(async () => {
      settle();
      await pending.catch(() => {});
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByText('Old removal failed')).toBeNull();
    expect(screen.getByText('new.txt')).toBeInTheDocument();
  },
);

test('late request updates do not overwrite a replacement with the same uid', async () => {
  const onChange = rstest.fn();
  let request:
    | Parameters<NonNullable<UploadProps['customRequest']>>[0]
    | undefined;
  const props = {
    onChange,
    customRequest: (options: NonNullable<typeof request>) => {
      request = options;
    },
  };
  const view = render(<Upload {...props} fileList={[]} />);
  pick(view.container, ['old.txt']);
  await waitFor(() => expect(request).toBeDefined());
  const replacementFile = Object.assign(new File(['new'], 'new.txt'), {
    uid: request!.file.uid,
  });
  view.rerender(
    <Upload
      {...props}
      fileList={[
        {
          uid: replacementFile.uid,
          name: replacementFile.name,
          originFileObj: replacementFile,
        },
      ]}
    />,
  );
  onChange.mockClear();
  act(() => {
    request?.onProgress?.({ percent: 90 });
    request?.onSuccess?.({ id: 'old' });
  });
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByText('new.txt')).toBeInTheDocument();
});

test('custom item removal respects the disabled state', async () => {
  const onRemove = rstest.fn();
  render(
    <Upload
      disabled
      defaultFileList={[{ uid: 'stored', name: 'stored.txt' }]}
      onRemove={onRemove}
      itemRender={(_, file, __, actions) => (
        <button type="button" onClick={actions.remove}>
          Remove {file.name}
        </button>
      )}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Remove stored.txt' }));
  await act(async () => {});
  expect(onRemove).not.toHaveBeenCalled();
});

test('a visible download action is disabled until it has a URL or handler', () => {
  const onDownload = rstest.fn();
  const file: UploadFile = { uid: 'pending', name: 'Pending.txt' };
  const { rerender } = render(
    <Upload fileList={[file]} showUploadList={{ showDownloadIcon: true }} />,
  );
  const download = screen.getByRole('button', { name: /Download.*Pending/ });
  expect(download).toBeDisabled();
  rerender(
    <Upload
      fileList={[file]}
      showUploadList={{ showDownloadIcon: true }}
      onDownload={onDownload}
    />,
  );
  expect(download).toBeEnabled();
  fireEvent.click(download);
  expect(onDownload).toHaveBeenCalledWith(file);
});
