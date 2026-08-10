import { afterEach, expect, test } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Modal } from '../../src/components/modal';
import { restoreViewport, setViewportWidth } from '../utils/mock-viewport';

afterEach(() => {
  restoreViewport();
});

test('renders children when open', () => {
  render(<Modal open>hello modal</Modal>);
  expect(screen.getByText('hello modal')).toBeTruthy();
});

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
  render(<Modal open width={{ md: 640 }}>body</Modal>);
  const content = screen.getByRole('dialog');
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(content.style.width).toBe('520px');
});
