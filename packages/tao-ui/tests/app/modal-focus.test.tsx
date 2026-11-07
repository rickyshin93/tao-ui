import { expect, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { App, type AppInstance } from '../../src/components/app/app';

test.each([false, true])(
  'modal update preserves button identity and focus (custom footer=%s)',
  (custom) => {
    let api!: AppInstance;
    function Capture() {
      api = App.useApp();
      return null;
    }
    render(
      <App>
        <Capture />
      </App>,
    );
    let instance!: ReturnType<AppInstance['modal']['confirm']>;
    act(() => {
      instance = api.modal.confirm({
        title: 'Save',
        content: 'Before',
        footer: custom
          ? (_, { OkBtn, CancelBtn }) => (
              <>
                <CancelBtn />
                <OkBtn />
              </>
            )
          : undefined,
      });
    });
    const button = screen.getByRole('button', { name: 'OK' });
    act(() => button.focus());
    act(() => instance.update({ content: 'After', okText: 'Retry' }));
    expect(screen.getByRole('button', { name: 'Retry' })).toBe(button);
    expect(button).toHaveFocus();
  },
);

test('async confirmation retains focus for retry after rejection', async () => {
  let api!: AppInstance;
  let reject!: (error: Error) => void;
  function Capture() {
    api = App.useApp();
    return null;
  }
  render(
    <App>
      <Capture />
    </App>,
  );
  act(() => {
    api.modal.confirm({
      title: 'Save',
      onOk: () =>
        new Promise((_, rejectPromise) => {
          reject = rejectPromise;
        }),
    });
  });
  const button = screen.getByRole('button', { name: 'OK' });
  act(() => button.focus());
  fireEvent.click(button);
  await act(async () => reject(new Error('Retry')));
  expect(screen.getByRole('button', { name: 'OK' })).toBe(button);
  expect(button).toHaveFocus();
});
