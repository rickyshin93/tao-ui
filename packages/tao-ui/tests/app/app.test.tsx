import { expect, rstest, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createContext, createRef, useContext } from 'react';
import {
  App,
  type AppInstance,
  type AppMessageType,
} from '../../src/components/app/app';
import { Popover } from '../../src/components/popover/popover';
import { TaoProvider, zhCN } from '../../src/provider/tao-provider';

function Capture({ capture }: { capture: (value: AppInstance) => void }) {
  capture(App.useApp());
  return null;
}

test('message APIs are scoped, update by key, and return a callable thenable', async () => {
  let first!: AppInstance;
  let second!: AppInstance;
  const closed = rstest.fn();
  render(
    <>
      <App>
        <Capture
          capture={(api) => {
            first = api;
          }}
        />
      </App>
      <App>
        <Capture
          capture={(api) => {
            second = api;
          }}
        />
      </App>
    </>,
  );
  let close!: AppMessageType;
  act(() => {
    close = first.message.loading({
      key: 'task',
      content: 'First task',
      duration: 0,
      onClose: closed,
    });
    second.message.info({ key: 'task', content: 'Second task', duration: 0 });
  });
  expect(screen.getByText('First task')).toBeTruthy();
  expect(screen.getByText('Second task')).toBeTruthy();
  act(() =>
    first.message.success({
      key: 'task',
      content: 'Updated task',
      duration: 0,
      onClose: closed,
    }),
  );
  expect(screen.queryByText('First task')).toBeNull();
  expect(screen.getByText('Updated task')).toBeTruthy();
  act(() => close());
  await waitFor(() => expect(screen.queryByText('Updated task')).toBeNull());
  expect(closed).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Second task')).toBeTruthy();
  act(() => second.message.destroy());
});

test('a failed keyed message update leaves the existing close callback intact', async () => {
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
  const onClose = rstest.fn();
  const failedOnClose = rstest.fn();
  let result!: AppMessageType;
  act(() => {
    result = api.message.open({
      key: 'task',
      content: 'Active task',
      duration: 0,
      onClose,
    });
  });
  expect(() =>
    api.message.open({
      key: 'task',
      content: 'Failed update',
      duration: 0,
      onClose: failedOnClose,
      classNames: () => {
        throw new Error('Invalid message styling');
      },
    }),
  ).toThrow('Invalid message styling');
  expect(screen.getByText('Active task')).toBeVisible();
  act(() => result());
  expect(await result).toBe(true);
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(failedOnClose).not.toHaveBeenCalled();
});

test('a closed message handle cannot close a future message with the same key', async () => {
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
  let first!: AppMessageType;
  act(() => {
    first = api.message.loading({
      key: 'task',
      content: 'First task',
      duration: 0,
    });
  });
  act(() => first());
  expect(await first).toBe(true);

  act(() => {
    api.message.info({ key: 'task', content: 'Next task', duration: 0 });
  });
  expect(screen.getByText('Next task')).toBeVisible();
  act(() => first());
  expect(screen.getByText('Next task')).toBeVisible();
});

test('shrinking maxCount settles every message evicted by the next open', async () => {
  let api!: AppInstance;
  const holder = (maxCount: number) => (
    <App message={{ maxCount, duration: 0 }}>
      <Capture
        capture={(value) => {
          api = value;
        }}
      />
    </App>
  );
  const view = render(holder(3));
  const settled = rstest.fn();
  act(() => {
    for (const content of ['First', 'Second', 'Third']) {
      api.message.info(content).then(settled);
    }
  });
  view.rerender(holder(1));
  act(() => {
    api.message.info('Current');
  });
  expect(screen.getByText('Current')).toBeVisible();
  expect(screen.queryByText('Second')).toBeNull();
  await waitFor(() => expect(settled).toHaveBeenCalledTimes(3));
});

test('message close callback and Promise resolve after duration', async () => {
  let api!: AppInstance;
  const closed = rstest.fn();
  render(
    <App message={{ duration: 0.03 }}>
      <Capture
        capture={(value) => {
          api = value;
        }}
      />
    </App>,
  );
  let result!: AppMessageType;
  act(() => {
    result = api.message.success('Saved', closed);
  });
  await act(async () => {
    await result;
  });
  expect(closed).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('Saved')).toBeNull();
});

test('notification inherits React context and theme, honors placement, semantic styles and close', async () => {
  const Context = createContext('missing');
  function Content() {
    return <span>{useContext(Context)}</span>;
  }
  let api!: AppInstance;
  const closed = rstest.fn();
  render(
    <TaoProvider theme={{ mode: 'dark', token: { colorPrimary: '#123456' } }}>
      <Context.Provider value="Context preserved">
        <App notification={{ placement: 'bottomLeft', duration: false }}>
          <Capture
            capture={(value) => {
              api = value;
            }}
          />
        </App>
      </Context.Provider>
    </TaoProvider>,
  );
  act(() =>
    api.notification.success({
      key: 'saved',
      title: 'Saved',
      description: <Content />,
      role: 'status',
      props: { 'data-testid': 'notice' },
      onClose: closed,
      classNames: { title: 'custom-title' },
      styles: { title: { color: 'red' } },
    }),
  );
  expect(screen.getByText('Context preserved')).toBeTruthy();
  expect(screen.getByText('Saved').className).toContain('custom-title');
  expect(screen.getByText('Saved').style.color).toBe('red');
  const notice = screen.getByTestId('notice');
  expect(notice.getAttribute('role')).toBe('status');
  expect(
    notice.closest('[data-tao-theme]')?.getAttribute('data-tao-theme'),
  ).toBe('dark');
  expect(
    notice
      .closest('[data-tao-app-notices]')
      ?.getAttribute('data-tao-placement'),
  ).toBe('bottomLeft');
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(screen.queryByText('Saved')).toBeNull());
  expect(closed).toHaveBeenCalledTimes(1);
});

test('nested App configuration merges and maxCount limits each instance', () => {
  let api!: AppInstance;
  const host = document.createElement('div');
  document.body.append(host);
  const { unmount } = render(
    <App message={{ duration: 0, maxCount: 1, getContainer: () => host }}>
      <App message={{ top: 40 }}>
        <Capture
          capture={(value) => {
            api = value;
          }}
        />
      </App>
    </App>,
  );
  act(() => {
    api.message.info('Old');
    api.message.info('New');
  });
  expect(screen.queryByText('Old')).toBeNull();
  expect(host.textContent).toContain('New');
  expect(
    host.querySelector<HTMLElement>('[data-tao-app-notices]')?.style.top,
  ).toBe('40px');
  unmount();
  expect(host.textContent).toBe('');
  host.remove();
});

test('modal hooks await confirmation, keep async failures open, then resolve after successful retry', async () => {
  let api!: AppInstance;
  let resolve!: () => void;
  const onOk = rstest
    .fn()
    .mockImplementationOnce(() => Promise.reject(new Error('Retry')))
    .mockImplementationOnce(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
  render(
    <App>
      <Capture
        capture={(value) => {
          api = value;
        }}
      />
    </App>,
  );
  let result!: ReturnType<AppInstance['modal']['confirm']>;
  act(() => {
    result = api.modal.confirm({
      title: 'Confirm save',
      content: 'Draft',
      onOk,
    });
  });
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  await waitFor(() => expect(onOk).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('dialog')).toBeTruthy();
  await act(async () => {
    await Promise.resolve();
  });
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  await waitFor(() => expect(onOk).toHaveBeenCalledTimes(2));
  await act(async () => {
    resolve();
  });
  expect(await result).toBe(true);
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

test('modal update supports functions and destroy resolves false; close callback controls completion', async () => {
  let api!: AppInstance;
  const afterClose = rstest.fn();
  const onOk = rstest.fn();
  render(
    <App>
      <Capture
        capture={(value) => {
          api = value;
        }}
      />
    </App>,
  );
  let result!: ReturnType<AppInstance['modal']['confirm']>;
  act(() => {
    result = api.modal.confirm({
      title: 'Before',
      onOk: (close) => {
        onOk();
        close();
      },
      afterClose,
    });
  });
  act(() => result.update((prev) => ({ ...prev, title: 'After' })));
  expect(screen.queryByText('Before')).toBeNull();
  expect(screen.getByText('After')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(await result).toBe(true);
  expect(onOk).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(afterClose).toHaveBeenCalledTimes(1));
  act(() => {
    result = api.modal.info({ title: 'Destroy me' });
  });
  act(() => result.destroy());
  expect(await result).toBe(false);
  expect(screen.queryByText('Destroy me')).toBeNull();
});

test('an initially hidden App modal can be updated and then opened', async () => {
  let api!: AppInstance;
  const afterClose = rstest.fn();
  render(
    <App>
      <Capture
        capture={(value) => {
          api = value;
        }}
      />
    </App>,
  );
  let result!: ReturnType<AppInstance['modal']['confirm']>;
  act(() => {
    result = api.modal.confirm({ open: false, title: 'Hidden', afterClose });
  });
  expect(screen.queryByRole('dialog')).toBeNull();
  act(() => result.update({ title: 'Updated while hidden' }));
  act(() => result.update(() => ({ title: 'Ready to open', afterClose })));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(afterClose).not.toHaveBeenCalled();
  act(() => result.update({ open: true }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Ready to open');
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(await result).toBe(true);
  expect(afterClose).toHaveBeenCalledTimes(1);
});

test.each(['destroy', 'queued open', 'update'] as const)(
  '%s settles a hidden App modal and calls afterClose once',
  async (method) => {
    let api!: AppInstance;
    const afterClose = rstest.fn();
    render(
      <App>
        <Capture
          capture={(value) => {
            api = value;
          }}
        />
      </App>,
    );
    let result!: ReturnType<AppInstance['modal']['confirm']>;
    act(() => {
      result = api.modal.confirm({ open: false, title: 'Hidden', afterClose });
    });
    act(() => {
      if (method === 'queued open') result.update({ open: true });
      if (method === 'update') result.update({ open: false });
      else result.destroy();
    });
    expect(afterClose).toHaveBeenCalledTimes(1);
    act(() => result.destroy());
    expect(await result).toBe(false);
    expect(afterClose).toHaveBeenCalledTimes(1);
  },
);

test('App supports custom and absent roots and forwards native ref', () => {
  const ref = createRef<HTMLElement>();
  const { container, rerender } = render(
    <App
      ref={ref}
      component="section"
      className="custom"
      classNames={{ root: 'semantic' }}
      styles={{ root: { color: 'red' } }}
    >
      Child
    </App>,
  );
  expect(ref.current?.tagName).toBe('SECTION');
  expect(ref.current?.className).toContain('semantic');
  expect(ref.current?.className).toContain('custom');
  expect(ref.current?.style.color).toBe('red');
  rerender(
    <App component={false}>
      <span>Unwrapped</span>
    </App>,
  );
  expect(container.children.length).toBe(1);
  expect(container.firstElementChild?.tagName).toBe('SPAN');
});

test('nested App feedback inherits localized labels and honors local overrides', () => {
  let api!: AppInstance;
  render(
    <TaoProvider locale={zhCN}>
      <App>
        <App>
          <Capture
            capture={(value) => {
              api = value;
            }}
          />
        </App>
      </App>
    </TaoProvider>,
  );
  act(() => api.notification.info({ title: '已保存', duration: 0 }));
  expect(screen.getByRole('button', { name: '关闭' })).toBeTruthy();
  act(() => api.notification.destroy());
  let result!: ReturnType<AppInstance['modal']['confirm']>;
  act(() => {
    result = api.modal.confirm({ title: '确认保存', closable: true });
  });
  expect(screen.getByRole('button', { name: '确定' })).toBeTruthy();
  expect(screen.getByRole('button', { name: '取消' })).toBeTruthy();
  expect(screen.getByRole('button', { name: '关闭' })).toBeTruthy();
  act(() => result.update({ okText: '继续' }));
  expect(screen.getByRole('button', { name: '继续' })).toBeTruthy();
  act(() => result.destroy());
});

test('notification updates the same key, supports hidden close controls and clears its own scope', () => {
  let api!: AppInstance;
  render(
    <App notification={{ duration: false }}>
      <Capture
        capture={(value) => {
          api = value;
        }}
      />
    </App>,
  );
  act(() =>
    api.notification.open({
      key: 'task',
      title: 'Processing',
      closeIcon: null,
    }),
  );
  expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  act(() =>
    api.notification.open({
      key: 'task',
      message: 'Complete',
      btn: <button type="button">View</button>,
      duration: 3,
      showProgress: true,
      closable: { disabled: true, 'aria-label': 'Dismiss task' },
    }),
  );
  expect(screen.queryByText('Processing')).toBeNull();
  expect(screen.getAllByRole('alert').length).toBe(1);
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Dismiss task' })
      .disabled,
  ).toBe(true);
  expect(screen.getByRole('button', { name: 'View' })).toBeTruthy();
  expect(screen.getByRole('progressbar')).toBeTruthy();
  act(() => api.notification.destroy('task'));
  expect(screen.queryByText('Complete')).toBeNull();
});

test('hover pauses timed notifications and resumes on leave', async () => {
  let api!: AppInstance;
  const closed = rstest.fn();
  render(
    <App>
      <Capture
        capture={(value) => {
          api = value;
        }}
      />
    </App>,
  );
  act(() =>
    api.notification.info({
      title: 'Read this update',
      duration: 0.05,
      pauseOnHover: true,
      onClose: closed,
    }),
  );
  const notice = screen.getByRole('alert');
  fireEvent.mouseEnter(notice);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 90));
  });
  expect(screen.getByText('Read this update')).toBeTruthy();
  expect(closed).not.toHaveBeenCalled();
  fireEvent.mouseLeave(notice);
  await waitFor(() =>
    expect(screen.queryByText('Read this update')).toBeNull(),
  );
  expect(closed).toHaveBeenCalledTimes(1);
});

test('modal portal, semantic slots, custom footer and cancel result are honored', async () => {
  let api!: AppInstance;
  const host = document.createElement('div');
  document.body.append(host);
  const { unmount } = render(
    <App>
      <Capture
        capture={(value) => {
          api = value;
        }}
      />
    </App>,
  );
  let result!: ReturnType<AppInstance['modal']['confirm']>;
  act(() => {
    result = api.modal.confirm({
      title: 'Custom confirmation',
      content: 'Custom content',
      getContainer: () => host,
      zIndex: 1500,
      mask: { enabled: false },
      autoFocusButton: 'cancel',
      footer: (_, { CancelBtn }) => <CancelBtn />,
      modalRender: (node) => <div data-custom-modal="">{node}</div>,
      styles: { container: { width: 360 } },
      classNames: { wrapper: 'dialog-wrapper', body: 'dialog-body' },
    });
  });
  expect(host.querySelector('[data-custom-modal]')).toBeTruthy();
  expect(host.querySelector<HTMLElement>('[data-tao-modal]')?.style.width).toBe(
    '360px',
  );
  expect(
    host.querySelector<HTMLElement>('[data-tao-modal-overlay]')?.style
      .background,
  ).toBe('transparent');
  expect(
    host.querySelector<HTMLElement>('[data-tao-modal-wrap]')?.style.zIndex,
  ).toBe('1501');
  expect(screen.queryByRole('button', { name: 'OK' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(await result).toBe(false);
  unmount();
  host.remove();
});

test('unmounting App settles outstanding handles and removes its feedback', async () => {
  let api!: AppInstance;
  const { unmount } = render(
    <App>
      <Capture
        capture={(value) => {
          api = value;
        }}
      />
    </App>,
  );
  let message!: AppMessageType;
  let modal!: ReturnType<AppInstance['modal']['confirm']>;
  act(() => {
    message = api.message.loading('Pending', 0);
    modal = api.modal.confirm({ title: 'Pending confirmation' });
  });
  unmount();
  expect(await message).toBe(true);
  expect(await modal).toBe(false);
  expect(screen.queryByText('Pending')).toBeNull();
  expect(screen.queryByRole('dialog')).toBeNull();
});

test('a message opened through an unmounted App settles immediately', async () => {
  let api!: AppInstance;
  const view = render(
    <App>
      <Capture
        capture={(value) => {
          api = value;
        }}
      />
    </App>,
  );
  view.unmount();
  const settled = rstest.fn();
  api.message.loading('Late upload result', 0).then(settled);
  await Promise.resolve();
  expect(settled).toHaveBeenCalledExactlyOnceWith(true);
  expect(screen.queryByText('Late upload result')).toBeNull();
});

test('a confirmation requested through an unmounted App resolves false', async () => {
  let api!: AppInstance;
  const view = render(
    <App>
      <Capture
        capture={(value) => {
          api = value;
        }}
      />
    </App>,
  );
  view.unmount();
  const settled = rstest.fn();
  const result = api.modal.confirm({ title: 'Late confirmation' });
  result.then(settled);
  await Promise.resolve();
  expect(settled).toHaveBeenCalledExactlyOnceWith(false);
  expect(screen.queryByRole('dialog')).toBeNull();
});

test('modal scroll locking and focus trapping can be configured independently', async () => {
  let api!: AppInstance;
  render(
    <App>
      <button type="button">Outside focus</button>
      <Capture
        capture={(value) => {
          api = value;
        }}
      />
    </App>,
  );
  let result!: ReturnType<AppInstance['modal']['confirm']>;
  act(() => {
    result = api.modal.confirm({
      title: 'Unlocked',
      content: (
        <Popover
          trigger="click"
          destroyOnHidden
          content={<button type="button">Portal action</button>}
        >
          <button type="button">Open popover</button>
        </Popover>
      ),
      scrollLock: false,
      focusable: { trap: true, autoFocusButton: 'cancel' },
    });
  });
  expect(document.body.hasAttribute('data-scroll-locked')).toBe(false);
  act(() => screen.getByRole('button', { name: 'Outside focus' }).focus());
  await waitFor(() =>
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(
      true,
    ),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
  const portalAction = await screen.findByRole('button', {
    name: 'Portal action',
  });
  act(() => portalAction.focus());
  expect(document.activeElement).toBe(portalAction);
  act(() => result.destroy());
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  act(() => {
    result = api.modal.confirm({
      title: 'Untrapped',
      scrollLock: true,
      focusable: { trap: false },
      mask: false,
    });
  });
  expect(document.body.hasAttribute('data-scroll-locked')).toBe(true);
  act(() => screen.getByRole('button', { name: 'Outside focus' }).focus());
  expect(document.activeElement).toBe(
    screen.getByRole('button', { name: 'Outside focus' }),
  );
  act(() => result.destroy());
});
