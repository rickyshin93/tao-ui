import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Image } from '../../src/components/image/image';
import { TaoProvider } from '../../src/provider/tao-provider';

const source =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"/>';

test('opens a labeled preview with Enter and forwards transform and close events', async () => {
  const onOpenChange = rstest.fn();
  const onTransform = rstest.fn();
  render(
    <Image
      src={source}
      alt="Mountains"
      preview={{ onOpenChange, onTransform }}
    />,
  );
  fireEvent.keyDown(screen.getByRole('button', { name: 'Mountains' }), {
    key: 'Enter',
  });
  const dialog = await screen.findByRole('dialog', { name: 'Mountains' });
  expect(onOpenChange).toHaveBeenCalledWith(true);
  fireEvent.click(screen.getByRole('button', { name: 'zoomIn' }));
  await waitFor(() =>
    expect(onTransform.mock.calls.at(-1)?.[0]).toMatchObject({
      action: 'zoomIn',
      transform: { scale: 1.5 },
    }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'rotateRight' }));
  await waitFor(() =>
    expect(onTransform.mock.calls.at(-1)?.[0]).toMatchObject({
      action: 'rotateRight',
      transform: { rotate: 90 },
    }),
  );
  fireEvent.click(dialog.querySelector('.tao-image-preview-close')!);
  expect(onOpenChange).toHaveBeenLastCalledWith(false);
});

test('preview false renders an ordinary image without a preview trigger', () => {
  render(<Image src={source} alt="Thumbnail" preview={false} />);
  expect(screen.getByRole('img', { name: 'Thumbnail' })).toBeInTheDocument();
  expect(screen.queryByRole('button')).toBeNull();
});

test('controlled open stays under its owner and legacy open callback is supported', async () => {
  const onVisibleChange = rstest.fn();
  const { rerender } = render(
    <Image
      src={source}
      alt="Controlled"
      preview={{ visible: false, onVisibleChange }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Controlled' }));
  expect(onVisibleChange).toHaveBeenCalledWith(true, false);
  expect(screen.queryByRole('dialog')).toBeNull();
  rerender(<Image src={source} alt="Controlled" preview={{ open: true }} />);
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
});

test('group previews navigate registered images and emit current indices', async () => {
  const onChange = rstest.fn();
  const onOpenChange = rstest.fn();
  render(
    <Image.PreviewGroup preview={{ onChange, onOpenChange }}>
      <Image src={`${source}#first`} alt="First" />
      <Image src={`${source}#second`} alt="Second" />
    </Image.PreviewGroup>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'First' }));
  const dialog = await screen.findByRole('dialog');
  expect(onOpenChange).toHaveBeenCalledWith(true, { current: 0 });
  fireEvent.click(dialog.querySelector('.tao-image-preview-switch-next')!);
  expect(onChange).toHaveBeenCalledWith(1, 0);
  expect(dialog.querySelector('img')).toHaveAttribute(
    'src',
    `${source}#second`,
  );
  expect(screen.getByText('2 / 2')).toBeInTheDocument();
});

test('image load errors are forwarded', () => {
  const onError = rstest.fn();
  render(
    <Image
      src="bad-image.png"
      fallback={source}
      alt="Fallback"
      onError={onError}
      preview={false}
    />,
  );
  const image = screen.getByRole('img');
  fireEvent.error(image);
  expect(onError).toHaveBeenCalledTimes(1);
});

test('progress placeholder clamps percentages and renders custom progress content', () => {
  render(
    <Image
      width={200}
      height={120}
      placeholder={{
        progress: {
          percent: 140,
          render: (bar, percent) => (
            <>
              {bar}
              <span>Uploaded {percent}</span>
            </>
          ),
        },
      }}
      styles={{ placeholder: { progress: { root: { borderRadius: 12 } } } }}
    />,
  );
  expect(screen.getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow',
    '100',
  );
  expect(screen.getByRole('progressbar')).toHaveStyle({
    width: '200px',
    borderRadius: '12px',
  });
  expect(screen.getByText('Uploaded 100')).toBeInTheDocument();
});

test('placeholder without a source is rendered as an overlay', () => {
  render(<Image width={120} placeholder={<span>Loading photo</span>} />);
  expect(screen.getByText('Loading photo')).toBeInTheDocument();
  expect(screen.queryByRole('img')).toBeNull();
});

test('semantics, inline containers and portal theme are preserved', async () => {
  const { unmount } = render(
    <TaoProvider theme={{ mode: 'dark', token: { colorPrimary: '#9460ff' } }}>
      <Image
        src={source}
        alt="Styled"
        classNames={({ props }) => ({
          root: props.alt,
          popup: { body: 'preview-body' },
        })}
        styles={{ root: { padding: 3 } }}
        preview={{ open: true, mask: false }}
      />
    </TaoProvider>,
  );
  const dialog = await screen.findByRole('dialog');
  expect(screen.getByRole('button', { name: 'Styled' })).toHaveClass('Styled');
  expect(dialog.querySelector('.preview-body')).toBeInTheDocument();
  expect(dialog.closest('[data-tao-image-popup]')).toHaveAttribute(
    'data-tao-theme',
    'dark',
  );
  expect(dialog.querySelector('.tao-image-preview-mask')).toHaveStyle({
    background: 'transparent',
  });
  unmount();
  expect(document.querySelector('[data-tao-image-popup]')).toBeNull();
  const inline = render(
    <Image
      src={source}
      alt="Inline"
      preview={{ open: true, getContainer: false }}
    />,
  );
  await waitFor(() =>
    expect(inline.container.querySelector('[role="dialog"]')).not.toBeNull(),
  );
});
