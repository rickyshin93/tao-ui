import { afterEach, beforeEach, expect, rstest, test } from '@rstest/core';
import { act, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { Drawer } from '../../src/components/drawer/drawer';
import { Modal } from '../../src/components/modal/modal';
import {
  Watermark,
  type WatermarkRef,
} from '../../src/components/watermark/watermark';

let context: CanvasRenderingContext2D;
beforeEach(() => {
  context = {
    font: '',
    fillStyle: '',
    textAlign: 'center',
    textBaseline: 'top',
    measureText: rstest.fn((value: string) => ({
      width: value.length * 8,
      fontBoundingBoxAscent: 12,
      fontBoundingBoxDescent: 4,
    })),
    scale: rstest.fn(),
    translate: rstest.fn(),
    rotate: rstest.fn(),
    fillText: rstest.fn(),
    drawImage: rstest.fn(),
  } as unknown as CanvasRenderingContext2D;
  rstest
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(context);
  rstest
    .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
    .mockReturnValue('data:image/png;base64,dGVzdA==');
});
afterEach(() => rstest.restoreAllMocks());

test('draws multi-line text with per-line font settings and applies dimensions/offsets', async () => {
  const ref = createRef<WatermarkRef>();
  render(
    <Watermark
      ref={ref}
      content={[
        'Team',
        { text: 'Private', font: { color: 'red', fontSize: 20 } },
      ]}
      rotate={0}
      width={120}
      height={60}
      gap={[80, 40]}
      offset={[50, 30]}
      zIndex={17}
      className="custom"
      classNames={{ root: 'root', mark: 'mark' }}
    >
      <div>Content</div>
    </Watermark>,
  );
  await waitFor(() =>
    expect(
      ref.current?.nativeElement.querySelector('[data-tao-watermark-mark]'),
    ).toBeTruthy(),
  );
  const mark = ref.current!.nativeElement.querySelector<HTMLElement>(
    '[data-tao-watermark-mark]',
  )!;
  expect(ref.current?.nativeElement).toHaveClass('custom', 'root');
  expect(mark).toHaveClass('mark');
  expect(mark).toHaveStyle({
    backgroundSize: '200px 100px',
    left: '10px',
    top: '10px',
    zIndex: '17',
    pointerEvents: 'none',
  });
  expect(context.fillText).toHaveBeenCalledWith('Team', 0, -30);
  expect(context.fillText).toHaveBeenCalledWith('Private', 0, -11);
  expect(context.fillStyle).toBe('red');
  expect(mark).toHaveAttribute('aria-hidden', 'true');
});
test('restores removed and modified marks without trapping unrelated content mutations', async () => {
  const remove = rstest.fn();
  const { container } = render(
    <Watermark content="Private" onRemove={remove}>
      <span>Content</span>
    </Watermark>,
  );
  const root = container.firstElementChild as HTMLElement;
  const mark = root.querySelector<HTMLElement>('[data-tao-watermark-mark]')!;
  const original = mark.style.cssText;
  mark.remove();
  await waitFor(() => expect(root).toContainElement(mark));
  expect(remove).toHaveBeenCalledTimes(1);
  mark.style.display = 'none';
  mark.hidden = true;
  mark.className = 'tampered';
  root.style.position = 'static';
  root.style.overflow = 'visible';
  await waitFor(() => expect(mark.style.cssText).toBe(original));
  expect(mark.hidden).toBe(false);
  expect(mark.className).toBe('');
  expect(root).toHaveStyle({ position: 'relative', overflow: 'hidden' });
  screen.getByText('Content').setAttribute('title', 'Updated');
  await act(async () => {});
  expect(remove).toHaveBeenCalledTimes(1);
});
test('inherits into real Modal and Drawer portals and removes marks when portals close', async () => {
  const { rerender, unmount } = render(
    <Watermark content="Private">
      <Modal open title="Modal">
        Dialog content
      </Modal>
      <Drawer open title="Drawer">
        Drawer content
      </Drawer>
    </Watermark>,
  );
  await waitFor(() =>
    expect(document.querySelectorAll('[data-tao-watermark-mark]')).toHaveLength(
      3,
    ),
  );
  expect(
    screen
      .getByText('Dialog content')
      .closest('[role="dialog"]')
      ?.querySelector('[data-tao-watermark-mark]'),
  ).toBeTruthy();
  expect(
    screen
      .getByText('Drawer content')
      .closest('[role="dialog"]')
      ?.querySelector('[data-tao-watermark-mark]'),
  ).toBeTruthy();
  rerender(
    <Watermark content="Private">
      <Modal open={false} />
      <Drawer open={false} />
    </Watermark>,
  );
  await waitFor(() =>
    expect(document.querySelectorAll('[data-tao-watermark-mark]')).toHaveLength(
      1,
    ),
  );
  unmount();
  expect(document.querySelector('[data-tao-watermark-mark]')).toBeNull();
});
test('inherit=false keeps portaled dialog content unmarked', () => {
  render(
    <Watermark content="Private" inherit={false}>
      <Modal open title="Public">
        Dialog
      </Modal>
    </Watermark>,
  );
  expect(document.querySelectorAll('[data-tao-watermark-mark]')).toHaveLength(
    1,
  );
  expect(
    screen.getByRole('dialog').querySelector('[data-tao-watermark-mark]'),
  ).toBeNull();
});
test('image load uses real drawing, failed image falls back to text and unmount cancels callbacks', () => {
  const images: HTMLImageElement[] = [];
  const OriginalImage = globalThis.Image;
  globalThis.Image = class {
    crossOrigin = '';
    referrerPolicy = '';
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    src = '';
    constructor() {
      images.push(this as unknown as HTMLImageElement);
    }
  } as unknown as typeof Image;
  try {
    const { rerender, unmount } = render(
      <Watermark image="one.png" content="Fallback" />,
    );
    act(() => images[0].onload?.(new Event('load')));
    expect(context.drawImage).toHaveBeenCalled();
    expect(context.fillText).not.toHaveBeenCalled();
    rerender(<Watermark image="two.png" content="Fallback" />);
    expect(images[0].onload).toBeNull();
    act(() => images[1].onerror?.(new Event('error')));
    expect(context.fillText).toHaveBeenCalledWith('Fallback', 0, -32);
    unmount();
    expect(images[1].onload).toBeNull();
    expect(images[1].onerror).toBeNull();
  } finally {
    globalThis.Image = OriginalImage;
  }
});
