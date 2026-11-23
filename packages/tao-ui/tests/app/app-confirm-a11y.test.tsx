import { expect, rstest, test } from '@rstest/core';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { App, type AppInstance } from '../../src/components/app/app';
import { TaoProvider } from '../../src/provider/tao-provider';

function Capture({ capture }: { capture: (value: AppInstance) => void }) {
  capture(App.useApp());
  return null;
}

test('App modal.confirm describes its dialog with the content', () => {
  let api!: AppInstance;
  render(
    <App>
      <Capture
        capture={(value) => {
          api = value;
        }}
      />
    </App>,
  );
  act(() => {
    api.modal.confirm({ title: 'Delete file?', content: 'This is permanent.' });
  });
  expect(
    screen.getByRole('dialog', { name: 'Delete file?' }),
  ).toHaveAccessibleDescription('This is permanent.');
});

test('App modal.confirm retains Cancel with a disabled provider', async () => {
  let api!: AppInstance;
  const onCancel = rstest.fn();
  render(
    <TaoProvider disabled>
      <App>
        <Capture
          capture={(value) => {
            api = value;
          }}
        />
      </App>
    </TaoProvider>,
  );
  act(() => {
    api.modal.confirm({ title: 'Review', onCancel });
  });
  expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
  const cancel = screen.getByRole('button', { name: 'Cancel' });
  expect(cancel).toBeEnabled();
  await userEvent.click(cancel);
  expect(onCancel).toHaveBeenCalledTimes(1);
});
