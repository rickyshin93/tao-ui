import { afterEach, expect, rstest, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createContext, StrictMode, useContext } from 'react';
import { Modal } from '../../src/components/modal';
import {
  destroyFns,
  type ModalFuncReturn,
} from '../../src/components/modal/confirm';
import type { ModalHookApi } from '../../src/components/modal/use-modal';
import { restoreViewport, setViewportWidth } from '../utils/mock-viewport';

afterEach(() => {
  act(() => Modal.destroyAll());
  restoreViewport();
});

test('renders children when open', () => {
  render(<Modal open>hello modal</Modal>);
  expect(screen.getByText('hello modal')).toBeTruthy();
});

test.each(['missing', 'disabled'] as const)(
  'autofocus falls back to a usable control when its requested button is %s',
  (kind) => {
    const view = (open: boolean) => (
      <>
        <button type="button">Launch</button>
        <Modal
          open={open}
          closable={false}
          title="Details"
          autoFocusButton="ok"
          footer={kind === 'missing' ? null : undefined}
          okButtonProps={kind === 'disabled' ? { disabled: true } : undefined}
        >
          <input aria-label="Details input" />
        </Modal>
      </>
    );
    const { rerender } = render(view(false));
    act(() => screen.getByRole('button', { name: 'Launch' }).focus());
    rerender(view(true));
    expect(
      screen.getByRole('textbox', { name: 'Details input' }),
    ).toHaveFocus();
  },
);

test('does not render children when closed', () => {
  render(<Modal open={false}>hidden</Modal>);
  expect(screen.queryByText('hidden')).toBeNull();
});

test('renders title', () => {
  render(
    <Modal open title="Confirm">
      body
    </Modal>,
  );
  expect(screen.getByText('Confirm')).toBeTruthy();
});

test('centered by default', () => {
  render(<Modal open>body</Modal>);
  const wrap = document.querySelector('[data-tao-modal-wrap]') as HTMLElement;
  expect(wrap.dataset.taoCentered).toBe('');
});

test('centered=false drops attribute', () => {
  render(
    <Modal open centered={false}>
      body
    </Modal>,
  );
  const wrap = document.querySelector('[data-tao-modal-wrap]') as HTMLElement;
  expect(wrap.dataset.taoCentered).toBeUndefined();
});

test('width prop applies', () => {
  render(
    <Modal open width={640}>
      body
    </Modal>,
  );
  const content = screen.getByRole('dialog');
  expect(content.style.width).toBe('640px');
});

test('close button triggers onClose', async () => {
  let closed = false;
  render(
    <Modal
      open
      onClose={() => {
        closed = true;
      }}
    >
      body
    </Modal>,
  );
  await userEvent.click(screen.getByLabelText('Close'));
  expect(closed).toBe(true);
});

test('overlay click triggers onClose', async () => {
  let closed = false;
  render(
    <Modal
      open
      onClose={() => {
        closed = true;
      }}
    >
      body
    </Modal>,
  );

  const overlay = document.querySelector('[data-tao-modal-overlay]');
  expect(overlay).toBeTruthy();
  if (overlay) await userEvent.click(overlay);

  expect(closed).toBe(true);
});

test('interaction outside the content does not close the modal', async () => {
  let closed = false;
  render(
    <Modal
      open
      onClose={() => {
        closed = true;
      }}
    >
      body
    </Modal>,
  );
  const outsideAction = document.createElement('button');
  outsideAction.style.pointerEvents = 'auto';
  document.body.append(outsideAction);

  await userEvent.click(outsideAction);

  expect(closed).toBe(false);
  outsideAction.remove();
});

test('a secondary pointer does not close the custom Modal mask', () => {
  const onClose = rstest.fn();
  render(<Modal open maskClosable scrollLock={false} onClose={onClose} />);
  const mask = document.querySelector('[data-tao-modal-overlay]')!;

  fireEvent.pointerDown(mask, { button: 2 });
  expect(onClose).not.toHaveBeenCalled();

  fireEvent.pointerDown(mask, { button: 0 });
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('overlay click does not close when maskClosable=false', async () => {
  let closed = false;
  render(
    <Modal
      open
      maskClosable={false}
      onClose={() => {
        closed = true;
      }}
    >
      body
    </Modal>,
  );

  const overlay = document.querySelector('[data-tao-modal-overlay]');
  expect(overlay).toBeTruthy();
  if (overlay) await userEvent.click(overlay);

  expect(closed).toBe(false);
});

test('closable=false hides close button', () => {
  render(
    <Modal open closable={false} title="No Close">
      body
    </Modal>,
  );
  expect(screen.queryByLabelText('Close')).toBeNull();
});

test('renders default OK/Cancel footer', () => {
  render(<Modal open>body</Modal>);
  expect(screen.getByText('OK')).toBeTruthy();
  expect(screen.getByText('Cancel')).toBeTruthy();
});

test('footer=null renders no footer', () => {
  render(
    <Modal open footer={null}>
      body
    </Modal>,
  );
  expect(document.querySelector('[data-tao-modal-footer]')).toBeNull();
});

test('custom footer renders', () => {
  render(
    <Modal open footer={<span>custom footer</span>}>
      body
    </Modal>,
  );
  expect(screen.getByText('custom footer')).toBeTruthy();
});

test('onOk triggers on OK click', async () => {
  let ok = false;
  render(
    <Modal
      open
      onOk={() => {
        ok = true;
      }}
    >
      body
    </Modal>,
  );
  await userEvent.click(screen.getByText('OK'));
  expect(ok).toBe(true);
});

test('custom okText/cancelText', () => {
  render(
    <Modal open okText="Submit" cancelText="Dismiss">
      body
    </Modal>,
  );
  expect(screen.getByText('Submit')).toBeTruthy();
  expect(screen.getByText('Dismiss')).toBeTruthy();
});

test('footer render fn composes around default buttons', () => {
  render(
    <Modal
      open
      footer={(origin, { OkBtn }) => (
        <>
          <span>extra</span>
          <OkBtn />
          {origin}
        </>
      )}
    >
      body
    </Modal>,
  );
  expect(screen.getByText('extra')).toBeTruthy();
  // origin contributes OK + Cancel, plus the standalone OkBtn => two OK buttons
  expect(screen.getAllByText('OK')).toHaveLength(2);
  expect(screen.getByText('Cancel')).toBeTruthy();
});

test('okButtonProps / cancelButtonProps forwarded', () => {
  render(
    <Modal
      open
      okButtonProps={{ disabled: true, 'data-testid': 'ok' }}
      cancelButtonProps={{ 'data-testid': 'cancel' }}
    >
      body
    </Modal>,
  );
  expect((screen.getByTestId('ok') as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByTestId('cancel')).toBeTruthy();
});

test('close semantic part applies className/style', () => {
  render(
    <Modal
      open
      classNames={{ close: 'my-close' }}
      styles={{ close: { color: 'rgb(1, 2, 3)' } }}
    >
      body
    </Modal>,
  );
  const close = screen.getByLabelText('Close');
  expect(close.className).toContain('my-close');
  expect(close.style.color).toBe('rgb(1, 2, 3)');
});

test('afterClose fires when open goes true -> false', () => {
  let calls = 0;
  const { rerender } = render(
    <Modal open afterClose={() => calls++}>
      body
    </Modal>,
  );
  expect(calls).toBe(0);
  rerender(
    <Modal open={false} afterClose={() => calls++}>
      body
    </Modal>,
  );
  expect(calls).toBe(1);
});

test('destroyOnHidden=false keeps content mounted when closed', () => {
  const { rerender } = render(
    <Modal open destroyOnHidden={false}>
      kept alive
    </Modal>,
  );
  expect(screen.getByText('kept alive')).toBeTruthy();
  rerender(
    <Modal open={false} destroyOnHidden={false}>
      kept alive
    </Modal>,
  );
  // still in the DOM (force-mounted), just hidden via CSS
  expect(screen.queryByText('kept alive')).not.toBeNull();
});

test('default destroyOnHidden unmounts content when closed', () => {
  const { rerender } = render(<Modal open>gone after close</Modal>);
  expect(screen.getByText('gone after close')).toBeTruthy();
  rerender(<Modal open={false}>gone after close</Modal>);
  expect(screen.queryByText('gone after close')).toBeNull();
});

test('Modal.confirm renders title/content and OK+Cancel', async () => {
  Modal.confirm({ title: 'Delete item?', content: 'Cannot be undone.' });
  expect(await screen.findByText('Delete item?')).toBeTruthy();
  expect(screen.getByText('Cannot be undone.')).toBeTruthy();
  expect(screen.getByText('OK')).toBeTruthy();
  expect(screen.getByText('Cancel')).toBeTruthy();
  Modal.destroyAll();
});

test('Modal.info shows only OK button', async () => {
  Modal.info({ title: 'Heads up' });
  expect(await screen.findByText('Heads up')).toBeTruthy();
  expect(screen.getByText('OK')).toBeTruthy();
  expect(screen.queryByText('Cancel')).toBeNull();
  Modal.destroyAll();
});

test('Modal.confirm onOk fires on OK click', async () => {
  let ok = false;
  Modal.confirm({
    title: 'Sure?',
    onOk: () => {
      ok = true;
    },
  });
  await screen.findByText('Sure?');
  await userEvent.click(screen.getByText('OK'));
  expect(ok).toBe(true);
  Modal.destroyAll();
});

test('destroyAll closes every existing modal and preserves replacements opened by afterClose', async () => {
  const queuedAfterClose = rstest.fn();
  const afterClose = rstest.fn(() => {
    Modal.info({ title: 'Replacement dialog' });
  });
  Modal.confirm({ title: 'Existing dialog', afterClose });
  await screen.findByText('Existing dialog');
  act(() => {
    Modal.confirm({ title: 'Queued dialog', afterClose: queuedAfterClose });
    Modal.destroyAll();
  });
  expect(afterClose).toHaveBeenCalledTimes(1);
  expect(queuedAfterClose).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('Existing dialog')).toBeNull();
  expect(screen.queryByText('Queued dialog')).toBeNull();
  expect(await screen.findByText('Replacement dialog')).toBeVisible();
});

test('destroyAll still closes other dialogs when an afterClose callback throws', async () => {
  const onClose = rstest.fn();
  Modal.confirm({ title: 'First dialog', afterClose: onClose });
  Modal.confirm({
    title: 'Throwing dialog',
    afterClose: () => {
      throw new Error('Close failed');
    },
  });
  await screen.findByText('Throwing dialog');
  act(() => {
    expect(() => Modal.destroyAll()).toThrow('Close failed');
  });
  expect(screen.queryByText('First dialog')).toBeNull();
  expect(screen.queryByText('Throwing dialog')).toBeNull();
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('static modal handles are harmless after destroyAll', async () => {
  const instance = Modal.confirm({ title: 'Handle lifecycle' });
  await screen.findByText('Handle lifecycle');
  act(() => Modal.destroyAll());
  const update = rstest.fn((config) => config);
  expect(() => instance.update(update)).not.toThrow();
  expect(() => instance.destroy()).not.toThrow();
  expect(update).not.toHaveBeenCalled();
});

test('immediate static modal destruction releases the root exactly once', async () => {
  const afterClose = rstest.fn();
  const before = destroyFns.length;
  await act(async () => {
    const instance = Modal.confirm({ title: 'Immediate cleanup', afterClose });
    instance.destroy();
    instance.destroy();
    instance.update({ content: 'Late content' });
  });
  expect(destroyFns.length).toBe(before);
  expect(afterClose).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('Late content')).toBeNull();
});

test('mounted static modal preserves afterClose and makes repeated cleanup safe', async () => {
  const afterClose = rstest.fn();
  const before = destroyFns.length;
  const instance = Modal.confirm({ title: 'Mounted cleanup', afterClose });
  await screen.findByText('Mounted cleanup');
  expect(afterClose).not.toHaveBeenCalled();
  act(() => instance.destroy());
  await waitFor(() => expect(afterClose).toHaveBeenCalledTimes(1));
  expect(destroyFns.length).toBe(before);
  expect(() => instance.destroy()).not.toThrow();
  expect(() => instance.update({ content: 'Too late' })).not.toThrow();
  expect(afterClose).toHaveBeenCalledTimes(1);
});

function renderHookModal(strict = false) {
  let api!: ModalHookApi;
  function Harness() {
    const [modal, holder] = Modal.useModal();
    api = modal;
    return holder;
  }
  render(
    strict ? (
      <StrictMode>
        <Harness />
      </StrictMode>
    ) : (
      <Harness />
    ),
  );
  return api;
}

test.each([false, true])(
  'immediately destroyed hook modal is released once (StrictMode=%s)',
  (strict) => {
    const modal = renderHookModal(strict);
    const afterClose = rstest.fn();
    const staleUpdate = rstest.fn((config) => config);
    let instance!: ModalFuncReturn;
    act(() => {
      instance = modal.confirm({ title: 'Immediate hook cleanup', afterClose });
      instance.destroy();
      instance.destroy();
      instance.update(staleUpdate);
    });
    act(() => instance.update(staleUpdate));
    expect(afterClose).toHaveBeenCalledTimes(1);
    expect(staleUpdate).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  },
);

test('mounted hook modal uses its latest config and ignores updates after destroy', () => {
  const modal = renderHookModal(true);
  const originalAfterClose = rstest.fn();
  const latestAfterClose = rstest.fn();
  const staleUpdate = rstest.fn((config) => config);
  let instance!: ModalFuncReturn;
  act(() => {
    instance = modal.confirm({
      title: 'Hook cleanup',
      afterClose: originalAfterClose,
    });
  });
  act(() =>
    instance.update({
      afterClose: latestAfterClose,
      content: 'Updated content',
    }),
  );
  expect(screen.getByText('Updated content')).toBeTruthy();
  act(() => {
    instance.destroy();
    instance.update(staleUpdate);
    instance.destroy();
  });
  expect(originalAfterClose).not.toHaveBeenCalled();
  expect(latestAfterClose).toHaveBeenCalledTimes(1);
  expect(staleUpdate).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).toBeNull();
});

test('hook modal content retains the surrounding React context', () => {
  const Context = createContext('default');
  let modal!: ModalHookApi;
  function Content() {
    return <span>{useContext(Context)}</span>;
  }
  function Harness() {
    const [api, holder] = Modal.useModal();
    modal = api;
    return holder;
  }
  render(
    <Context.Provider value="surrounding context">
      <Harness />
    </Context.Provider>,
  );
  act(() => {
    modal.info({ content: <Content /> });
  });
  expect(screen.getByText('surrounding context')).toBeTruthy();
});

test.each(['hook', 'static'])(
  '%s modal deduplicates pending cancellation and allows retry after rejection',
  async (kind) => {
    const modal = kind === 'hook' ? renderHookModal() : Modal;
    let rejectFirst!: (reason: Error) => void;
    const first = new Promise<void>((_, reject) => {
      rejectFirst = reject;
    });
    const onCancel = rstest.fn().mockReturnValue(first);
    const onOk = rstest.fn();
    const afterClose = rstest.fn();
    act(() => {
      modal.confirm({
        title: 'Pending cancellation',
        maskClosable: true,
        onCancel,
        onOk,
        afterClose,
      });
    });

    const cancel = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancel);
    const ok = screen.getByRole('button', { name: 'OK' });
    expect(ok).toBeDisabled();
    fireEvent.click(ok);
    expect(onOk).not.toHaveBeenCalled();
    fireEvent.click(cancel);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    const overlay = document.querySelector('[data-tao-modal-overlay]');
    expect(overlay).toBeTruthy();
    if (overlay) fireEvent.click(overlay);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      rejectFirst(new Error('Try again'));
      await first.catch(() => {});
    });
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(cancel).not.toBeDisabled();
    expect(ok).not.toBeDisabled();
    expect(afterClose).not.toHaveBeenCalled();
    onCancel.mockResolvedValueOnce(undefined);
    await userEvent.click(cancel);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(afterClose).toHaveBeenCalledTimes(1);
  },
);

test.each(['hook', 'static'])(
  '%s modal preserves asynchronous OK loading and retry',
  async (kind) => {
    const modal = kind === 'hook' ? renderHookModal() : Modal;
    let rejectFirst!: (reason: Error) => void;
    const first = new Promise<void>((_, reject) => {
      rejectFirst = reject;
    });
    const onOk = rstest
      .fn()
      .mockReturnValueOnce(first)
      .mockResolvedValueOnce(undefined);
    act(() => {
      modal.confirm({ title: 'Pending confirmation', onOk });
    });

    const ok = screen.getByRole('button', { name: 'OK' });
    fireEvent.click(ok);
    expect(ok).toHaveAttribute('aria-busy', 'true');
    expect(ok).toBeDisabled();
    await act(async () => {
      rejectFirst(new Error('Try again'));
      await first.catch(() => {});
    });
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(ok).not.toBeDisabled();
    await userEvent.click(ok);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onOk).toHaveBeenCalledTimes(2);
  },
);

test.each(['hook', 'static'])(
  '%s modal can cancel pending OK without closing twice when it settles',
  async (kind) => {
    const modal = kind === 'hook' ? renderHookModal() : Modal;
    let resolveOk!: () => void;
    const pending = new Promise<void>((resolve) => {
      resolveOk = resolve;
    });
    const afterClose = rstest.fn();
    const onCancel = rstest.fn();
    act(() => {
      modal.confirm({
        title: 'Cancel pending OK',
        onOk: () => pending,
        onCancel,
        afterClose,
      });
    });
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(afterClose).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveOk();
      await pending;
    });
    expect(afterClose).toHaveBeenCalledTimes(1);
  },
);

test('responsive width resolves the largest matching breakpoint', async () => {
  setViewportWidth(1024);
  render(
    <Modal open width={{ xs: '100%', md: 640 }}>
      body
    </Modal>,
  );
  const content = screen.getByRole('dialog');
  await waitFor(() => expect(content.style.width).toBe('640px'));
});

test('responsive width falls back to the 520px default without a match', async () => {
  setViewportWidth(400);
  render(
    <Modal open width={{ md: 640 }}>
      body
    </Modal>,
  );
  const content = screen.getByRole('dialog');
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(content.style.width).toBe('520px');
});
