import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Upload } from '../../src/components/upload/upload';

test.each(['picture-card', 'picture-circle'] as const)(
  '%s previews a file URL without a callback',
  (listType) => {
    const open = rstest.spyOn(window, 'open').mockReturnValue(null);
    try {
      render(
        <Upload
          listType={listType}
          defaultFileList={[
            { uid: '1', name: 'photo.png', status: 'done', url: '/photo.png' },
          ]}
        />,
      );
      fireEvent.click(screen.getByLabelText('Preview file photo.png'));
      expect(open).toHaveBeenCalledWith(
        '/photo.png',
        '_blank',
        'noopener,noreferrer',
      );
    } finally {
      open.mockRestore();
    }
  },
);

test('a custom preview handler replaces URL navigation', () => {
  const open = rstest.spyOn(window, 'open').mockReturnValue(null);
  const preview = rstest.fn();
  const file = { uid: '1', name: 'photo.png', url: '/photo.png' };
  try {
    render(
      <Upload
        listType="picture-card"
        defaultFileList={[file]}
        onPreview={preview}
      />,
    );
    fireEvent.click(screen.getByLabelText('Preview file photo.png'));
    expect(preview).toHaveBeenCalledWith(file);
    expect(open).not.toHaveBeenCalled();
  } finally {
    open.mockRestore();
  }
});

test('local picture-card files open an image preview without an uploaded URL', async () => {
  const file = Object.assign(
    new File([new Uint8Array([1, 2, 3])], 'local.png', { type: 'image/png' }),
    { uid: 'local' },
  );
  render(
    <Upload
      listType="picture-card"
      defaultFileList={[
        {
          uid: 'local',
          name: file.name,
          type: file.type,
          originFileObj: file,
        },
      ]}
    />,
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Preview file local.png' }),
  );
  const dialog = screen.getByRole('dialog', { name: file.name });
  const image = await within(dialog).findByRole('img', { name: file.name });
  expect(image).toHaveAttribute(
    'src',
    expect.stringMatching(/^data:image\/png/),
  );
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  expect(dialog).not.toBeInTheDocument();
});

test('file link handlers can cancel the default preview without swallowing the click', () => {
  const onPreview = rstest.fn();
  const linkClick = rstest.fn((event: { preventDefault(): void }) =>
    event.preventDefault(),
  );
  render(
    <Upload
      onPreview={onPreview}
      defaultFileList={[
        {
          uid: 'photo',
          name: 'photo.png',
          url: '/photo.png',
          linkProps: { onClick: linkClick },
        },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole('link', { name: 'photo.png' }));
  expect(linkClick).toHaveBeenCalledTimes(1);
  expect(onPreview).not.toHaveBeenCalled();
});
