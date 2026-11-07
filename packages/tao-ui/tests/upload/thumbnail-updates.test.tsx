import { expect, rs, test } from '@rstest/core';
import { act, render, screen, waitFor } from '@testing-library/react';
import {
  Upload,
  type RcFile,
  type UploadFile,
} from '../../src/components/upload/upload';

const file: UploadFile = {
  uid: 'photo',
  name: 'photo.png',
  type: 'image/png',
  originFileObj: Object.assign(
    new File(['first'], 'photo.png', { type: 'image/png' }),
    { uid: 'photo' },
  ) as RcFile,
};

test.each(['url', 'thumbUrl'] as const)(
  'Upload recovers from preview failure when %s is provided',
  async (field) => {
    const previewFile = rs.fn().mockRejectedValue(new Error('Preview failed'));
    const view = render(
      <Upload
        listType="picture-card"
        fileList={[file]}
        previewFile={previewFile}
      />,
    );
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Preview failed',
    );
    view.rerender(
      <Upload
        listType="picture-card"
        fileList={[{ ...file, [field]: '/recovered.png' }]}
        previewFile={previewFile}
      />,
    );
    expect(
      await screen.findByRole('img', { name: 'photo.png' }),
    ).toHaveAttribute('src', '/recovered.png');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(previewFile).toHaveBeenCalledTimes(1);
  },
);

test('Upload clears an old preview error when a replacement preview succeeds', async () => {
  const failed = rs.fn().mockRejectedValue(new Error('Preview failed'));
  const success = rs.fn().mockResolvedValue('/generated.png');
  const view = render(
    <Upload listType="picture-card" fileList={[file]} previewFile={failed} />,
  );
  await screen.findByText('Preview failed');
  view.rerender(
    <Upload listType="picture-card" fileList={[file]} previewFile={success} />,
  );
  expect(await screen.findByRole('img', { name: 'photo.png' })).toHaveAttribute(
    'src',
    '/generated.png',
  );
  expect(screen.queryByText('Preview failed')).not.toBeInTheDocument();
});

test('Upload clears a stale thumbnail while the replacement file preview is pending', async () => {
  let resolve!: (url: string) => void;
  const pending = new Promise<string>((done) => {
    resolve = done;
  });
  const previewFile = rs
    .fn()
    .mockResolvedValueOnce('/old.png')
    .mockReturnValueOnce(pending);
  const view = render(
    <Upload
      listType="picture-card"
      fileList={[file]}
      previewFile={previewFile}
    />,
  );
  expect(await screen.findByRole('img')).toHaveAttribute('src', '/old.png');
  const replacement = {
    ...file,
    originFileObj: Object.assign(
      new File(['second'], 'photo.png', { type: 'image/png' }),
      { uid: 'photo' },
    ) as RcFile,
  };
  view.rerender(
    <Upload
      listType="picture-card"
      fileList={[replacement]}
      previewFile={previewFile}
    />,
  );
  await waitFor(() => expect(previewFile).toHaveBeenCalledTimes(2));
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  await act(async () => {
    resolve('/new.png');
    await pending;
  });
  expect(screen.getByRole('img')).toHaveAttribute('src', '/new.png');
});

test('Upload ignores a superseded preview rejection after a URL arrives', async () => {
  let reject!: (error: Error) => void;
  const pending = new Promise<string>((_, fail) => {
    reject = fail;
  });
  const previewFile = rs.fn().mockReturnValue(pending);
  const view = render(
    <Upload
      listType="picture-card"
      fileList={[file]}
      previewFile={previewFile}
    />,
  );
  view.rerender(
    <Upload
      listType="picture-card"
      fileList={[{ ...file, url: '/saved.png' }]}
      previewFile={previewFile}
    />,
  );
  await act(async () => {
    reject(new Error('Late failure'));
    await expect(pending).rejects.toThrow('Late failure');
  });
  expect(screen.getByRole('img')).toHaveAttribute('src', '/saved.png');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('Upload reports a thumbnail generator that throws synchronously', async () => {
  render(
    <Upload
      listType="picture-card"
      fileList={[file]}
      previewFile={() => {
        throw new Error('Cannot read thumbnail');
      }}
    />,
  );
  expect(await screen.findByRole('status')).toHaveTextContent(
    'Cannot read thumbnail',
  );
});
