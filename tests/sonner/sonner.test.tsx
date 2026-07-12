import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Sonner, toast } from '../../src/components/sonner';
import { TaoProvider } from '../../src/provider/tao-provider';

test('renders toast title and description', async () => {
  render(<Sonner />);
  toast({ title: 'Saved', description: 'Changes synced.' });
  expect(await screen.findByText('Saved')).toBeTruthy();
  expect(screen.getByText('Changes synced.')).toBeTruthy();
  toast.dismiss();
});

test('success toast uses success type when richColors enabled', async () => {
  render(<Sonner richColors />);
  toast.success({ title: 'Done' });
  const node = await screen.findByText('Done');
  expect(
    node.closest('[data-tao-sonner-toast]')?.getAttribute('data-tao-type'),
  ).toBe('success');
  toast.dismiss();
});

test('loading toast stays visible until dismissed', async () => {
  render(<Sonner richColors />);
  const id = toast.loading({ title: 'Uploading' });
  const node = await screen.findByText('Uploading');
  expect(
    node.closest('[data-tao-sonner-toast]')?.getAttribute('data-tao-type'),
  ).toBe('loading');
  toast.dismiss(id);
  await Promise.resolve();
  expect(screen.queryByText('Uploading')).toBeNull();
});

test('custom toast renders arbitrary react node', async () => {
  render(<Sonner />);
  toast.custom(
    <div>
      <strong>Custom body</strong>
      <span>Inline content</span>
    </div>,
  );
  expect(await screen.findByText('Custom body')).toBeTruthy();
  expect(screen.getByText('Inline content')).toBeTruthy();
  toast.dismiss();
});

test('close button dismisses toast', async () => {
  render(<Sonner closeButton />);
  toast({ title: 'Closable' });
  await screen.findByText('Closable');
  await userEvent.click(screen.getByLabelText('Close notification'));
  expect(screen.queryByText('Closable')).toBeNull();
});

test('action click triggers callback and dismisses', async () => {
  let called = false;
  render(<Sonner />);
  toast({
    title: 'Undoable',
    action: {
      label: 'Undo',
      onClick: () => {
        called = true;
      },
    },
  });
  await userEvent.click(await screen.findByText('Undo'));
  expect(called).toBe(true);
  expect(screen.queryByText('Undoable')).toBeNull();
});

test('promise toast resolves to success state', async () => {
  render(<Sonner richColors />);
  await toast.promise(Promise.resolve('v1.2.3'), {
    loading: { title: 'Publishing' },
    success: (value) => ({ title: `Published ${value}` }),
  });
  expect(await screen.findByText('Published v1.2.3')).toBeTruthy();
  toast.dismiss();
});

test('promise toast rejects to error state', async () => {
  render(<Sonner richColors />);
  await expect(
    toast.promise(Promise.reject(new Error('boom')), {
      loading: { title: 'Publishing' },
      error: (error) => ({ title: (error as Error).message }),
    }),
  ).rejects.toThrow('boom');
  expect(await screen.findByText('boom')).toBeTruthy();
  toast.dismiss();
});

test('inherits provider token styles through portal scope', async () => {
  render(
    <TaoProvider theme={{ token: { colorPrimary: 'rgb(1, 2, 3)' } }}>
      <Sonner richColors />
    </TaoProvider>,
  );
  toast.info({ title: 'Branded' });
  await screen.findByText('Branded');
  const scopes = document.querySelectorAll('[data-tao-provider]');
  const scoped = scopes[scopes.length - 1] as HTMLElement;
  expect(scoped.style.getPropertyValue('--tao-color-primary')).toBe(
    'rgb(1, 2, 3)',
  );
  toast.dismiss();
});
