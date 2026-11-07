import { afterEach, expect, rs, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { MouseEvent } from 'react';
import { Modal } from '../../src/components/modal';

afterEach(() => {
  act(() => Modal.destroyAll());
});

function hookModal() {
  let modal!: ReturnType<typeof Modal.useModal>[0];
  function Demo() {
    const [api, holder] = Modal.useModal();
    modal = api;
    return holder;
  }
  render(<Demo />);
  return modal;
}

for (const kind of ['hook', 'static'] as const) {
  for (const action of ['ok', 'cancel'] as const) {
    const buttonName = action === 'ok' ? 'OK' : 'Cancel';
    test(`${kind} ${action} composes button events with the close lifecycle`, async () => {
      const modal = kind === 'hook' ? hookModal() : Modal;
      const events: string[] = [];
      const afterClose = rs.fn();
      const config = {
        title: 'Confirm',
        afterClose,
        [action === 'ok' ? 'onOk' : 'onCancel']: () => events.push('action'),
        [action === 'ok' ? 'okButtonProps' : 'cancelButtonProps']: {
          onClick: () => events.push('click'),
        },
      };
      act(() => {
        modal.confirm(config);
      });
      fireEvent.click(
        screen.getByRole('button', { name: buttonName, exact: true }),
      );
      expect(events).toEqual(['click', 'action']);
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(afterClose).toHaveBeenCalledTimes(1);
    });

    test(`${kind} ${action} respects preventDefault before running the action`, () => {
      const modal = kind === 'hook' ? hookModal() : Modal;
      const onAction = rs.fn();
      const onClick = rs.fn((event: MouseEvent<HTMLButtonElement>) =>
        event.preventDefault(),
      );
      act(() => {
        modal.confirm({
          title: 'Confirm',
          [action === 'ok' ? 'onOk' : 'onCancel']: onAction,
          [action === 'ok' ? 'okButtonProps' : 'cancelButtonProps']: {
            onClick,
          },
        });
      });
      fireEvent.click(
        screen.getByRole('button', { name: buttonName, exact: true }),
      );
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onAction).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test(`${kind} ${action} retains loading and retry with custom button props`, async () => {
      const modal = kind === 'hook' ? hookModal() : Modal;
      let reject!: (error: Error) => void;
      const pending = new Promise<void>((_, rejectPromise) => {
        reject = rejectPromise;
      });
      const onAction = rs
        .fn()
        .mockReturnValueOnce(pending)
        .mockResolvedValueOnce(undefined);
      const onClick = rs.fn();
      act(() => {
        modal.confirm({
          title: 'Confirm',
          [action === 'ok' ? 'onOk' : 'onCancel']: onAction,
          [action === 'ok' ? 'okButtonProps' : 'cancelButtonProps']: {
            onClick,
            loading: false,
          },
        });
      });
      const button = screen.getByRole('button', {
        name: buttonName,
        exact: true,
      });
      fireEvent.click(button);
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toBeDisabled();
      await act(async () => {
        reject(new Error('Retry'));
        await expect(pending).rejects.toThrow('Retry');
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(button).not.toBeDisabled();
      fireEvent.click(button);
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(onClick).toHaveBeenCalledTimes(2);
      expect(onAction).toHaveBeenCalledTimes(2);
    });
  }
}
