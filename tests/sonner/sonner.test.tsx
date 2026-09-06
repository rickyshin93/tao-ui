import { afterEach, describe, expect, test } from '@rstest/core';
import { act, render, screen, waitFor } from '@testing-library/react';
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
  await waitFor(() => {
    expect(screen.queryByText('Uploading')).toBeNull();
  });
});

test('recreating an exiting id is not removed by the stale exit timer', async () => {
  render(<Sonner />);
  toast({ id: 'stable', title: 'Old', duration: 0 });
  toast.dismiss('stable');
  toast({ id: 'stable', title: 'New', duration: 0 });

  await new Promise((resolve) => setTimeout(resolve, 260));
  expect(screen.getByText('New')).toBeTruthy();
  toast.dismiss();
  await new Promise((resolve) => setTimeout(resolve, 240));
});

test('front height follows toast id after its content changes', async () => {
  const original = HTMLElement.prototype.getBoundingClientRect;
  HTMLElement.prototype.getBoundingClientRect =
    function getBoundingClientRect() {
      const height = this.textContent?.includes('Front updated')
        ? 90
        : this.textContent?.includes('Front')
          ? 20
          : 40;
      return {
        width: 100,
        height,
        top: 0,
        right: 100,
        bottom: height,
        left: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      };
    };

  try {
    const { container } = render(<Sonner visibleToasts={2} />);
    toast({ id: 'back', title: 'Back', duration: 0 });
    toast({ id: 'front', title: 'Front', duration: 0 });
    toast({ id: 'front', title: 'Front updated', duration: 0 });

    await waitFor(() =>
      expect(
        (
          container.querySelector('[data-tao-sonner-viewport]') as HTMLElement
        ).style.getPropertyValue('--tao-sonner-front-height'),
      ).toBe('90px'),
    );
  } finally {
    HTMLElement.prototype.getBoundingClientRect = original;
    toast.dismiss();
    await new Promise((resolve) => setTimeout(resolve, 240));
  }
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
  const closeButton = screen.getAllByLabelText('Close notification').at(-1);
  expect(closeButton).toBeTruthy();
  expect(closeButton?.getAttribute('data-tao-sonner-close')).toBe('');
  await userEvent.click(closeButton!);
  await waitFor(() => {
    expect(screen.queryByText('Closable')).toBeNull();
  });
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
  await waitFor(() => {
    expect(screen.queryByText('Undoable')).toBeNull();
  });
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

test('promise result id does not orphan the loading toast', async () => {
  render(<Sonner />);
  await toast.promise(Promise.resolve('done'), {
    loading: { title: 'Still loading' },
    success: { id: 'result-id', title: 'Finished' },
  });

  expect(await screen.findByText('Finished')).toBeTruthy();
  expect(screen.queryByText('Still loading')).toBeNull();
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

describe('promise toast lifecycle', () => {
  afterEach(() => {
    act(() => toast.dismiss());
  });

  test.each([
    { rejects: false, withMessage: true },
    { rejects: true, withMessage: true },
    { rejects: false, withMessage: false },
    { rejects: true, withMessage: false },
  ])('preserves newer toast: rejects=$rejects, withMessage=$withMessage', async ({
    rejects,
    withMessage,
  }) => {
    render(<Sonner />);
    const failure = new Error('Old task failed');
    let settle!: () => void;
    const task = new Promise<string>((resolve, reject) => {
      settle = () => (rejects ? reject(failure) : resolve('old result'));
    });
    let result!: Promise<string>;
    act(() => {
      result = toast.promise(task, {
        loading: { id: 'replaced-promise', title: 'Old task loading' },
        success: withMessage ? 'Old task succeeded' : undefined,
        error: withMessage ? 'Old task failed' : undefined,
      });
      toast.success({
        id: 'replaced-promise',
        title: 'New task succeeded',
        duration: 0,
      });
    });

    await act(async () => {
      settle();
      if (rejects) await expect(result).rejects.toBe(failure);
      else await expect(result).resolves.toBe('old result');
    });

    expect(
      screen.getByText('New task succeeded').closest('[data-tao-sonner-toast]'),
    ).toHaveAttribute('data-tao-removing', 'false');
    expect(screen.queryByText('Old task succeeded')).toBeNull();
    expect(screen.queryByText('Old task failed')).toBeNull();
  });

  test.each([
    { rejects: false, removed: false },
    { rejects: true, removed: false },
    { rejects: false, removed: true },
    { rejects: true, removed: true },
  ])('keeps dismissed toast closed: rejects=$rejects, removed=$removed', async ({
    rejects,
    removed,
  }) => {
    render(<Sonner />);
    const failure = new Error('Dismissed task failed');
    let settle!: () => void;
    const task = new Promise<string>((resolve, reject) => {
      settle = () => (rejects ? reject(failure) : resolve('dismissed result'));
    });
    let result!: Promise<string>;
    act(() => {
      result = toast.promise(task, {
        loading: { id: 'dismissed-promise', title: 'Dismissed task loading' },
        success: 'Dismissed task succeeded',
        error: 'Dismissed task failed',
      });
      toast.dismiss('dismissed-promise');
    });

    if (removed) {
      await waitFor(() =>
        expect(screen.queryByText('Dismissed task loading')).toBeNull(),
      );
    } else {
      expect(
        screen
          .getByText('Dismissed task loading')
          .closest('[data-tao-sonner-toast]'),
      ).toHaveAttribute('data-tao-removing', 'true');
    }

    await act(async () => {
      settle();
      if (rejects) await expect(result).rejects.toBe(failure);
      else await expect(result).resolves.toBe('dismissed result');
    });

    expect(screen.queryByText('Dismissed task succeeded')).toBeNull();
    expect(screen.queryByText('Dismissed task failed')).toBeNull();
  });
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
