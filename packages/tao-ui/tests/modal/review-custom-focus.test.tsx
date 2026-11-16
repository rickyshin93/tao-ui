import { expect, test } from '@rstest/core';
import { act, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { Modal } from '../../src/components/modal/modal';

for (const destroyOnHidden of [false, true]) {
  test.each([
    { scrollLock: false, trap: true },
    { scrollLock: false, trap: false },
    { scrollLock: true, trap: false },
  ])(
    `custom interaction focuses every open cycle (destroyOnHidden=${destroyOnHidden}, %j)`,
    async ({ scrollLock, trap }) => {
      function Example() {
        const [open, setOpen] = useState(false);
        return (
          <>
            <button type="button" onClick={() => setOpen(true)}>
              Open modal
            </button>
            <Modal
              open={open}
              title="Custom focus"
              destroyOnHidden={destroyOnHidden}
              scrollLock={scrollLock}
              focusable={{
                trap,
                autoFocusButton: 'ok',
                focusTriggerAfterClose: true,
              }}
              onClose={() => setOpen(false)}
            >
              <input aria-label="Name" />
            </Modal>
          </>
        );
      }
      render(<Example />);
      const trigger = screen.getByRole('button', { name: 'Open modal' });
      await userEvent.click(trigger);
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'OK' })).toHaveFocus(),
      );
      if (trap) {
        act(() => trigger.focus());
        expect(
          screen.getByRole('dialog').contains(document.activeElement),
        ).toBe(true);
      }
      await userEvent.type(
        screen.getByRole('textbox', { name: 'Name' }),
        'Retained value',
      );
      await userEvent.click(screen.getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(trigger).toHaveFocus());
      await userEvent.click(trigger);
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'OK' })).toHaveFocus(),
      );
      if (trap) {
        act(() => trigger.focus());
        expect(
          screen.getByRole('dialog').contains(document.activeElement),
        ).toBe(true);
        screen.getByRole('button', { name: 'OK' }).focus();
        await userEvent.tab();
        expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
      }
      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(
        destroyOnHidden ? '' : 'Retained value',
      );
      await userEvent.click(screen.getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(trigger).toHaveFocus());
    },
  );
}

test.each([undefined, false])(
  'custom interaction respects focusTriggerAfterClose=%s',
  async (focusTriggerAfterClose) => {
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open modal
          </button>
          <Modal
            open={open}
            title="Restoring focus"
            destroyOnHidden={false}
            scrollLock={false}
            focusTriggerAfterClose={focusTriggerAfterClose}
            onClose={() => setOpen(false)}
          />
        </>
      );
    }
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Open modal' });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    if (focusTriggerAfterClose === false) expect(trigger).not.toHaveFocus();
    else await waitFor(() => expect(trigger).toHaveFocus());
  },
);
