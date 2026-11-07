import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Image } from '../../src/components/image/image';
import { TaoProvider, zhCN } from '../../src/provider/tao-provider';

const source =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"/>';

test('closed image previews allocate a container only when first opened', async () => {
  render(
    <>
      <Image src={source} alt="Photo" />
      <Image.PreviewGroup preview={false}>
        <Image src={source} alt="Disabled gallery photo" />
      </Image.PreviewGroup>
    </>,
  );
  expect(document.querySelector('[data-tao-image-popup]')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Photo' }));
  expect(await screen.findByRole('dialog', { name: 'Photo' })).toBeVisible();
  expect(document.querySelectorAll('[data-tao-image-popup]')).toHaveLength(1);
});

test.each(['image', 'group'] as const)(
  'disabling an open %s preview removes its portal and resets uncontrolled visibility',
  async (kind) => {
    const view = (preview: boolean) =>
      kind === 'image' ? (
        <Image src={source} alt="Photo" preview={preview} />
      ) : (
        <Image.PreviewGroup preview={preview}>
          <Image src={source} alt="Photo" />
        </Image.PreviewGroup>
      );
    const { rerender } = render(view(true));
    fireEvent.click(screen.getByRole('button', { name: 'Photo' }));
    expect(await screen.findByRole('dialog')).toBeVisible();

    rerender(view(false));
    await waitFor(() =>
      expect(document.querySelector('[data-tao-image-popup]')).toBeNull(),
    );
    rerender(view(true));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.querySelector('[data-tao-image-popup]')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Photo' }));
    expect(await screen.findByRole('dialog')).toBeVisible();
  },
);

test('localizes actual image action buttons before custom toolbar composition', async () => {
  const onTransform = rstest.fn();
  render(
    <TaoProvider locale={zhCN}>
      <Image
        src={source}
        alt="Photo"
        preview={{
          open: true,
          onTransform,
          actionsRender: (original, info) => (
            <>
              {original}
              <div data-testid="custom-action">
                {info.icons.rotateRightIcon}
              </div>
              <button type="button" onClick={info.actions.onReset}>
                Owner reset
              </button>
            </>
          ),
        }}
      />
    </TaoProvider>,
  );
  expect(await screen.findByRole('button', { name: '放大' })).toHaveAttribute(
    'aria-label',
    '放大',
  );
  expect(screen.getByRole('button', { name: '缩小' })).toBeDisabled();
  expect(screen.queryByRole('button', { name: 'zoomIn' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '放大' }));
  await waitFor(() =>
    expect(onTransform.mock.calls.at(-1)?.[0]).toMatchObject({
      action: 'zoomIn',
    }),
  );
  const custom = screen.getByTestId('custom-action').querySelector('button')!;
  expect(custom).toHaveAttribute('aria-label', '向右旋转');
  fireEvent.click(custom);
  await waitFor(() =>
    expect(onTransform.mock.calls.at(-1)?.[0]).toMatchObject({
      action: 'rotateRight',
    }),
  );
  expect(
    screen.getByRole('button', { name: 'Owner reset' }),
  ).toBeInTheDocument();
});

test('loading labels and legacy toolbar callbacks inherit provider overrides', async () => {
  const toolbar = rstest.fn((node) => node);
  render(
    <TaoProvider
      locale={{ messages: { loading: 'Chargement', zoomIn: 'Agrandir' } }}
    >
      <Image placeholder={{ progress: true }} />
      <Image
        src={source}
        alt="Legacy"
        preview={{ open: true, toolbarRender: toolbar }}
      />
    </TaoProvider>,
  );
  expect(
    screen.getByRole('status', { name: 'Chargement' }),
  ).toBeInTheDocument();
  expect(
    await screen.findByRole('button', { name: 'Agrandir' }),
  ).toBeInTheDocument();
  expect(toolbar).toHaveBeenCalled();
});

test('progress localizes displayed percentages while keeping numeric values and caller labels', () => {
  const { rerender } = render(
    <TaoProvider locale={{ numberLocale: 'ar-EG' }}>
      <Image placeholder={{ progress: { percent: 50 } }} />
    </TaoProvider>,
  );
  const progress = screen.getByRole('progressbar');
  const label = new Intl.NumberFormat('ar-EG', { style: 'percent' }).format(
    0.5,
  );
  expect(progress).toHaveAccessibleName(label);
  expect(progress).toHaveTextContent(label);
  expect(progress).toHaveAttribute('aria-valuenow', '50');
  rerender(
    <TaoProvider locale={{ numberLocale: 'ar-EG' }}>
      <Image
        aria-label="Owner progress"
        placeholder={{ progress: { percent: 50 } }}
      />
    </TaoProvider>,
  );
  expect(
    screen.getByRole('progressbar', { name: 'Owner progress' }),
  ).toHaveAttribute('aria-valuenow', '50');
});

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
  fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
  await waitFor(() =>
    expect(onTransform.mock.calls.at(-1)?.[0]).toMatchObject({
      action: 'zoomIn',
      transform: { scale: 1.5 },
    }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Rotate right' }));
  await waitFor(() =>
    expect(onTransform.mock.calls.at(-1)?.[0]).toMatchObject({
      action: 'rotateRight',
      transform: { rotate: 90 },
    }),
  );
  fireEvent.click(dialog.querySelector('.tao-image-preview-close')!);
  expect(onOpenChange).toHaveBeenLastCalledWith(false);
});

test('a progress placeholder names the image it is loading', () => {
  const { rerender } = render(
    <Image alt="Profile photo" placeholder={{ progress: { percent: 25 } }} />,
  );
  expect(
    screen.getByRole('progressbar', { name: 'Profile photo' }),
  ).toHaveAttribute('aria-valuenow', '25');
  rerender(<Image alt="Profile photo" placeholder={{ progress: true }} />);
  expect(screen.getByRole('status', { name: 'Profile photo' })).toHaveAttribute(
    'aria-busy',
    'true',
  );
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

test('a preview group cannot revive its old open state after control is released', async () => {
  const view = (open?: boolean) => (
    <Image.PreviewGroup preview={open === undefined ? {} : { open }}>
      <Image src={source} alt="Shared image" />
    </Image.PreviewGroup>
  );
  const { rerender } = render(view());
  fireEvent.click(screen.getByRole('button', { name: 'Shared image' }));
  const dialog = await screen.findByRole('dialog');
  rerender(view(false));
  await waitFor(() =>
    expect(dialog).toHaveClass('tao-image-preview-fade-leave-active'),
  );
  fireEvent.transitionEnd(dialog);
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  rerender(view());
  expect(screen.queryByRole('dialog')).toBeNull();
});

test('preview false disables a group and its nested image triggers', async () => {
  const view = (preview: boolean) => (
    <Image.PreviewGroup preview={preview}>
      <div>
        <Image src={source} alt="Nested image" />
      </div>
    </Image.PreviewGroup>
  );
  const { rerender } = render(view(false));
  const image = screen.getByRole('img', { name: 'Nested image' });
  expect(screen.queryByRole('button', { name: 'Nested image' })).toBeNull();
  fireEvent.click(image);
  expect(screen.queryByRole('dialog')).toBeNull();

  rerender(view(true));
  fireEvent.click(screen.getByRole('button', { name: 'Nested image' }));
  expect(await screen.findByRole('dialog')).toBeInTheDocument();

  rerender(view(false));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  rerender(view(true));
  expect(screen.queryByRole('dialog')).toBeNull();
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

test('progress placeholders retain the image accessible label and description references', () => {
  render(
    <>
      <span id="image-title">Preview upload</span>
      <span id="image-detail">A thumbnail is being generated</span>
      <Image
        placeholder={{ progress: { percent: 20 } }}
        aria-labelledby="image-title"
        aria-describedby="image-detail"
      />
    </>,
  );
  expect(
    screen.getByRole('progressbar', { name: 'Preview upload' }),
  ).toHaveAccessibleDescription('A thumbnail is being generated');
});

test('moving an open image preview leaves no unused portal in the old host', async () => {
  const first = document.createElement('div');
  const second = document.createElement('div');
  document.body.append(first, second);
  const view = (target: HTMLElement | false) => (
    <Image
      src={source}
      alt="Photo"
      preview={{ open: true, getContainer: target }}
    />
  );
  const { rerender, unmount } = render(view(first));
  try {
    await waitFor(() =>
      expect(first.querySelector('[role=dialog]')).not.toBeNull(),
    );
    rerender(view(second));
    await waitFor(() =>
      expect(second.querySelector('[role=dialog]')).not.toBeNull(),
    );
    expect(first.querySelector('[data-tao-image-popup]')).toBeNull();
    rerender(view(false));
    await waitFor(() =>
      expect(second.querySelector('[data-tao-image-popup]')).toBeNull(),
    );
  } finally {
    unmount();
    first.remove();
    second.remove();
  }
});

test('numeric zero can be rendered as an image placeholder before a source arrives', () => {
  render(<Image placeholder={0} />);
  expect(screen.getByRole('status')).toHaveTextContent('0');
});

test('a numeric preview mask is used as the image cover', () => {
  const { container } = render(<Image src={source} preview={{ mask: 0 }} />);
  expect(container.querySelector('.tao-image-cover')).toHaveTextContent('0');
});

test('an iterable preview mask is used as the image cover', () => {
  const { container } = render(
    <Image src={source} preview={{ mask: new Set(['Preview image']) }} />,
  );
  expect(container.querySelector('.tao-image-cover')).toHaveTextContent(
    'Preview image',
  );
});
