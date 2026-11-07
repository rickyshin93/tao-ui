import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { Drawer } from '../../src/components/drawer/drawer';

test('renders children when open', () => {
  render(<Drawer open>hello drawer</Drawer>);
  expect(screen.getByText('hello drawer')).toBeTruthy();
});

test('does not render children when closed', () => {
  render(<Drawer open={false}>hidden</Drawer>);
  expect(screen.queryByText('hidden')).toBeNull();
});

test('closing a Drawer restores focus to its external launch button', async () => {
  function Example() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Launch drawer
        </button>
        <Drawer open={open} onClose={() => setOpen(false)} title="Drawer" />
      </>
    );
  }
  render(<Example />);
  const launcher = screen.getByRole('button', { name: 'Launch drawer' });
  await userEvent.click(launcher);
  await userEvent.click(screen.getByRole('button', { name: 'Close' }));

  await waitFor(() => expect(launcher).toHaveFocus());
});

test('renders title', () => {
  render(
    <Drawer open title="Settings">
      body
    </Drawer>,
  );
  expect(screen.getByText('Settings')).toBeTruthy();
});

test('placement defaults to right', () => {
  render(<Drawer open>body</Drawer>);
  const content = screen.getByRole('dialog');
  expect(content.dataset.taoPlacement).toBe('right');
});

test('placement=bottom sets data attribute', () => {
  render(
    <Drawer open placement="bottom">
      body
    </Drawer>,
  );
  const content = screen.getByRole('dialog');
  expect(content.dataset.taoPlacement).toBe('bottom');
});

test('close button triggers onClose', async () => {
  let closed = false;
  render(
    <Drawer
      open
      onClose={() => {
        closed = true;
      }}
    >
      body
    </Drawer>,
  );
  const closeBtn = screen.getByLabelText('Close');
  await userEvent.click(closeBtn);
  expect(closed).toBe(true);
});

test('overlay click triggers onClose', async () => {
  let closed = false;
  render(
    <Drawer
      open
      onClose={() => {
        closed = true;
      }}
    >
      body
    </Drawer>,
  );
  const overlay = document.querySelector('[data-tao-drawer-overlay]')!;
  await userEvent.click(overlay);
  expect(closed).toBe(true);
});

test('interaction outside the content does not close the drawer', async () => {
  let closed = false;
  render(
    <Drawer
      open
      onClose={() => {
        closed = true;
      }}
    >
      body
    </Drawer>,
  );
  const outsideAction = document.createElement('button');
  outsideAction.style.pointerEvents = 'auto';
  document.body.append(outsideAction);

  await userEvent.click(outsideAction);

  expect(closed).toBe(false);
  outsideAction.remove();
});

test('overlay click does not close when maskClosable=false', async () => {
  let closed = false;
  render(
    <Drawer
      open
      maskClosable={false}
      onClose={() => {
        closed = true;
      }}
    >
      body
    </Drawer>,
  );

  const overlay = document.querySelector('[data-tao-drawer-overlay]');
  expect(overlay).toBeTruthy();
  if (overlay) await userEvent.click(overlay);

  expect(closed).toBe(false);
});

test('width prop applies to right placement', () => {
  render(
    <Drawer open placement="right" width={400}>
      body
    </Drawer>,
  );
  const content = screen.getByRole('dialog');
  expect(content.style.width).toBe('400px');
});

test('height prop applies to bottom placement', () => {
  render(
    <Drawer open placement="bottom" height="70vh">
      body
    </Drawer>,
  );
  const content = screen.getByRole('dialog');
  expect(content.style.height).toBe('70vh');
});

test('closable defaults to true (close button shown)', () => {
  render(
    <Drawer open title="X">
      body
    </Drawer>,
  );
  expect(screen.getByLabelText('Close')).toBeTruthy();
});

test('closable=false hides close button', () => {
  render(
    <Drawer open closable={false} title="X">
      body
    </Drawer>,
  );
  expect(screen.queryByLabelText('Close')).toBeNull();
});

test('a false close icon hides the Drawer close control', () => {
  render(
    <Drawer open closeIcon={false}>
      Drawer body
    </Drawer>,
  );

  const dialog = screen.getByRole('dialog');
  expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  expect(dialog.querySelector('[data-tao-drawer-header]')).toBeNull();
});

test('custom closeIcon renders', () => {
  render(
    <Drawer open closeIcon={<span>x-icon</span>}>
      body
    </Drawer>,
  );
  expect(screen.getByText('x-icon')).toBeTruthy();
});

test('renders extra in header', () => {
  render(
    <Drawer open title="X" extra={<button type="button">act</button>}>
      body
    </Drawer>,
  );
  expect(screen.getByText('act')).toBeTruthy();
  expect(document.querySelector('[data-tao-drawer-extra]')).not.toBeNull();
});

test('renders footer when provided', () => {
  render(
    <Drawer open footer={<span>foot</span>}>
      body
    </Drawer>,
  );
  expect(screen.getByText('foot')).toBeTruthy();
  expect(document.querySelector('[data-tao-drawer-footer]')).not.toBeNull();
});

test('no footer node when footer omitted', () => {
  render(<Drawer open>body</Drawer>);
  expect(document.querySelector('[data-tao-drawer-footer]')).toBeNull();
});

test('size=large applies preset width to right placement', () => {
  render(
    <Drawer open size="large">
      body
    </Drawer>,
  );
  expect(screen.getByRole('dialog').style.width).toBe('736px');
});

test('explicit width overrides size preset', () => {
  render(
    <Drawer open size="large" width={500}>
      body
    </Drawer>,
  );
  expect(screen.getByRole('dialog').style.width).toBe('500px');
});

test('size=default applies preset height to bottom placement', () => {
  render(
    <Drawer open placement="bottom" size="default">
      body
    </Drawer>,
  );
  expect(screen.getByRole('dialog').style.height).toBe('378px');
});

test('mask=false renders no overlay', () => {
  render(
    <Drawer open mask={false}>
      body
    </Drawer>,
  );
  expect(document.querySelector('[data-tao-drawer-overlay]')).toBeNull();
});

test('afterClose fires on open true -> false', () => {
  let calls = 0;
  const { rerender } = render(
    <Drawer open afterClose={() => calls++}>
      body
    </Drawer>,
  );
  expect(calls).toBe(0);
  rerender(
    <Drawer open={false} afterClose={() => calls++}>
      body
    </Drawer>,
  );
  expect(calls).toBe(1);
});

test('afterOpenChange fires with the new open state', () => {
  const seen: boolean[] = [];
  const { rerender } = render(
    <Drawer open={false} afterOpenChange={(o) => seen.push(o)}>
      body
    </Drawer>,
  );
  rerender(
    <Drawer open afterOpenChange={(o) => seen.push(o)}>
      body
    </Drawer>,
  );
  expect(seen).toEqual([true]);
});

test('afterOpenChange reports an initially open Drawer once', () => {
  const afterOpenChange = rstest.fn();
  const view = render(<Drawer open afterOpenChange={afterOpenChange} />);
  view.rerender(<Drawer open afterOpenChange={afterOpenChange} />);

  expect(afterOpenChange).toHaveBeenCalledExactlyOnceWith(true);
});

test('destroyOnHidden=false keeps content mounted when closed', () => {
  const { rerender } = render(
    <Drawer open destroyOnHidden={false}>
      kept
    </Drawer>,
  );
  expect(screen.getByText('kept')).toBeTruthy();
  rerender(
    <Drawer open={false} destroyOnHidden={false}>
      kept
    </Drawer>,
  );
  expect(screen.queryByText('kept')).not.toBeNull();
});

test('no dragger by default', () => {
  render(<Drawer open>body</Drawer>);
  expect(document.querySelector('[data-tao-drawer-dragger]')).toBeNull();
});

test('resizable renders a dragger matching placement', () => {
  render(
    <Drawer open resizable placement="left">
      body
    </Drawer>,
  );
  const dragger = document.querySelector(
    '[data-tao-drawer-dragger]',
  ) as HTMLElement;
  expect(dragger).not.toBeNull();
  expect(dragger.dataset.taoPlacement).toBe('left');
});

test('a secondary mouse button cannot resize the drawer', () => {
  const onResizeStart = rstest.fn();
  render(<Drawer open resizable={{ onResizeStart }} />);
  const dragger = screen
    .getByRole('dialog')
    .querySelector<HTMLDivElement>('[data-tao-drawer-dragger]')!;
  dragger.setPointerCapture = rstest.fn();
  dragger.hasPointerCapture = () => false;

  fireEvent.pointerDown(dragger, { pointerId: 1, button: 2 });

  expect(dragger.setPointerCapture).not.toHaveBeenCalled();
  expect(onResizeStart).not.toHaveBeenCalled();
});

test.each([
  'close',
  'disable resizing',
  'placement change',
  'unmount',
] as const)(
  'ending a drawer drag via %s releases capture and calls onResizeEnd once',
  (action) => {
    const onResizeEnd = rstest.fn();
    const onResizeStart = rstest.fn();
    const view = render(
      <Drawer open resizable={{ onResizeStart, onResizeEnd }} />,
    );
    const dragger = screen
      .getByRole('dialog')
      .querySelector<HTMLDivElement>('[data-tao-drawer-dragger]')!;
    dragger.setPointerCapture = rstest.fn();
    dragger.hasPointerCapture = () => true;
    dragger.releasePointerCapture = rstest.fn();
    fireEvent.pointerDown(dragger, { pointerId: 1, clientX: 400 });
    expect(onResizeStart).toHaveBeenCalledTimes(1);
    if (action === 'unmount') view.unmount();
    else
      view.rerender(
        <Drawer
          open={action !== 'close'}
          placement={action === 'placement change' ? 'bottom' : 'right'}
          resizable={
            action === 'disable resizing'
              ? false
              : { onResizeStart, onResizeEnd }
          }
        />,
      );
    expect(dragger.releasePointerCapture).toHaveBeenCalledExactlyOnceWith(1);
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
    fireEvent.lostPointerCapture(dragger, { pointerId: 1 });
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
  },
);

test.each(['pointerCancel', 'lostPointerCapture'] as const)(
  'only the active pointer resizes the drawer and %s ends the drag',
  (cancel) => {
    const onResize = rstest.fn();
    const onResizeStart = rstest.fn();
    const onResizeEnd = rstest.fn();
    render(
      <Drawer
        open
        title="Resizable"
        width={300}
        resizable={{ onResize, onResizeStart, onResizeEnd }}
      >
        body
      </Drawer>,
    );
    const dialog = screen.getByRole('dialog');
    const dragger = dialog.querySelector<HTMLDivElement>(
      '[data-tao-drawer-dragger]',
    )!;
    let capturedPointer: number | undefined;
    dragger.setPointerCapture = (pointer) => {
      capturedPointer = pointer;
    };
    dragger.releasePointerCapture = (pointer) => {
      expect(pointer).toBe(capturedPointer);
      capturedPointer = undefined;
    };
    dragger.hasPointerCapture = (pointer) => capturedPointer === pointer;
    dialog.getBoundingClientRect = () => new DOMRect(0, 0, 300, 400);

    fireEvent.pointerDown(dragger, { pointerId: 1, clientX: 400 });
    fireEvent.pointerDown(dragger, { pointerId: 2, clientX: 450 });
    fireEvent.pointerMove(dragger, { pointerId: 2, clientX: 300 });
    fireEvent.pointerUp(dragger, { pointerId: 2 });
    expect(onResizeStart).toHaveBeenCalledTimes(1);
    expect(onResize).not.toHaveBeenCalled();
    expect(onResizeEnd).not.toHaveBeenCalled();

    fireEvent.pointerMove(dragger, { pointerId: 1, clientX: 350 });
    expect(onResize).toHaveBeenCalledExactlyOnceWith(350);
    if (cancel === 'lostPointerCapture') capturedPointer = undefined;
    fireEvent[cancel](dragger, { pointerId: 1 });
    fireEvent.lostPointerCapture(dragger, { pointerId: 1 });
    fireEvent.pointerMove(dragger, { pointerId: 1, clientX: 300 });
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(capturedPointer).toBeUndefined();
    expect(dialog).toHaveStyle({ width: '350px' });
  },
);
