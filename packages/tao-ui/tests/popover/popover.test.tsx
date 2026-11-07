import { readFileSync } from 'node:fs';
import { expect, rstest, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRef, Fragment } from 'react';
import { Modal } from '../../src/components/modal/modal';
import { Popover } from '../../src/components/popover/popover';

test('click trigger opens and closes the popup', async () => {
  render(
    <Popover trigger="click" title="Title" content={<p>Body text</p>}>
      <button type="button">Open</button>
    </Popover>,
  );

  await userEvent.click(screen.getByRole('button', { name: 'Open' }));
  expect(screen.getByText('Title')).toBeTruthy();
  expect(screen.getByText('Body text')).toBeTruthy();
  const popup = document.querySelector('[data-tao-popover]') as HTMLElement;
  expect(popup.dataset.state).toBe('open');

  // Keep-alive (default): closed popup stays mounted with data-state="closed"
  await userEvent.click(screen.getByRole('button', { name: 'Open' }));
  expect(popup.dataset.state).toBe('closed');
});

test('a Fragment trigger opens the popup on click', async () => {
  render(
    <Popover trigger="click" content="Fragment popup">
      <Fragment key="trigger">
        <span aria-hidden="true">+</span>
        <button type="button">Fragment trigger</button>
      </Fragment>
    </Popover>,
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Fragment trigger' }),
  );
  expect(document.querySelector('[data-tao-popover]')).toHaveAttribute(
    'data-state',
    'open',
  );
});

test('a single Fragment trigger regains focus after keyboard dismissal', async () => {
  render(
    <Popover
      trigger="click"
      destroyOnHidden
      content={<button type="button">Popup action</button>}
    >
      <Fragment key="trigger">
        <button type="button">Keyboard trigger</button>
      </Fragment>
    </Popover>,
  );
  const trigger = screen.getByRole('button', { name: 'Keyboard trigger' });
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  await userEvent.tab();
  expect(screen.getByRole('button', { name: 'Popup action' })).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(trigger).toHaveFocus());
});

test('a retained closed Popover releases Escape to its parent modal', async () => {
  const onModalClose = rstest.fn();
  render(
    <Modal open title="Parent modal" onClose={onModalClose}>
      <Popover trigger="click" content={<input aria-label="Retained draft" />}>
        <button type="button">Open draft</button>
      </Popover>
    </Modal>,
  );
  const trigger = screen.getByRole('button', { name: 'Open draft' });
  const popup = document.querySelector('[data-tao-popover]')!;
  const draft = popup.querySelector('input')!;
  expect(popup).toHaveAttribute('data-state', 'closed');
  fireEvent.keyDown(trigger, { key: 'Escape' });
  expect(onModalClose).toHaveBeenCalledTimes(1);

  act(() => trigger.focus());
  fireEvent.click(trigger);
  expect(popup).toHaveAttribute('data-state', 'open');
  act(() => draft.focus());
  fireEvent.change(draft, { target: { value: 'Unsubmitted note' } });
  expect(draft).toHaveFocus();
  fireEvent.keyDown(draft, { key: 'Escape' });
  expect(onModalClose).toHaveBeenCalledTimes(1);
  expect(popup).toHaveAttribute('data-state', 'closed');
  await waitFor(() => expect(trigger).toHaveFocus());
  fireEvent.keyDown(trigger, { key: 'Escape' });
  expect(onModalClose).toHaveBeenCalledTimes(2);

  fireEvent.click(trigger);
  expect(document.querySelector('[data-tao-popover]')).toBe(popup);
  expect(popup.querySelector('input')).toBe(draft);
  expect(draft).toHaveValue('Unsubmitted note');
});

test('controlled open renders the popup', () => {
  render(
    <Popover open title="T" content="Controlled body">
      <button type="button">Open</button>
    </Popover>,
  );
  expect(screen.getByText('Controlled body')).toBeTruthy();
  const popup = document.querySelector('[data-tao-popover]') as HTMLElement;
  expect(popup.dataset.state).toBe('open');
});

test('controlled open={false} keeps the popup closed', async () => {
  render(
    <Popover trigger="click" open={false} title="T" content="Hidden body">
      <button type="button">Open</button>
    </Popover>,
  );
  const popup = document.querySelector('[data-tao-popover]') as HTMLElement;
  expect(popup.dataset.state).toBe('closed');
  await userEvent.click(screen.getByRole('button', { name: 'Open' }));
  expect(popup.dataset.state).toBe('closed');
});

test('onOpenChange fires when clicking the trigger', async () => {
  const onOpenChange = rstest.fn();
  render(
    <Popover trigger="click" title="T" content="C" onOpenChange={onOpenChange}>
      <button type="button">Open</button>
    </Popover>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Open' }));
  expect(onOpenChange).toHaveBeenCalledWith(true);
});

test('hover is the default trigger', () => {
  render(
    <Popover mouseEnterDelay={0} title="T" content="Hover body">
      <button type="button">Hover me</button>
    </Popover>,
  );
  fireEvent.pointerEnter(screen.getByRole('button', { name: 'Hover me' }));
  expect(
    document.querySelector('[data-tao-popover]')?.getAttribute('data-state'),
  ).toBe('open');
});

test('Popover honors a custom trigger that cancels the context menu event', () => {
  const onOpenChange = rstest.fn();
  render(
    <Popover
      trigger="contextMenu"
      content="Popover content"
      onOpenChange={onOpenChange}
    >
      <button type="button" onContextMenu={(event) => event.preventDefault()}>
        Custom action
      </button>
    </Popover>,
  );

  fireEvent.contextMenu(screen.getByRole('button', { name: 'Custom action' }));

  expect(onOpenChange).not.toHaveBeenCalled();
  expect(document.querySelector('[data-tao-popover]')).toHaveAttribute(
    'data-state',
    'closed',
  );
});

test('hover trigger opens on pointer enter and closes after pointer leave', async () => {
  render(
    <Popover trigger="hover" mouseEnterDelay={0} title="T" content="Hover body">
      <button type="button">Hover me</button>
    </Popover>,
  );
  const triggerEl = screen.getByRole('button', { name: 'Hover me' });

  fireEvent.pointerEnter(triggerEl);
  const popup = document.querySelector('[data-tao-popover]') as HTMLElement;
  expect(popup.dataset.state).toBe('open');
  expect(screen.getByText('Hover body')).toBeTruthy();

  fireEvent.pointerLeave(triggerEl);
  await waitFor(() => {
    expect(popup.dataset.state).toBe('closed');
  });
});

test('leaving before a Popover opens does not report a close', () => {
  rstest.useFakeTimers();
  try {
    const onOpenChange = rstest.fn();
    render(
      <Popover
        trigger="hover"
        content="Content"
        mouseEnterDelay={0.5}
        onOpenChange={onOpenChange}
      >
        <button type="button">Trigger</button>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.pointerEnter(trigger);
    fireEvent.pointerLeave(trigger);
    act(() => rstest.advanceTimersByTime(600));

    expect(onOpenChange).not.toHaveBeenCalled();
  } finally {
    rstest.useRealTimers();
  }
});

test('hover trigger stays open while the pointer moves into the content', () => {
  rstest.useFakeTimers();
  try {
    render(
      <Popover trigger="hover" title="T" content="Hover body">
        <button type="button">Hover me</button>
      </Popover>,
    );
    const triggerEl = screen.getByRole('button', { name: 'Hover me' });
    const popup = document.querySelector('[data-tao-popover]') as HTMLElement;

    fireEvent.pointerEnter(triggerEl);
    act(() => rstest.advanceTimersByTime(100));
    expect(popup.dataset.state).toBe('open');

    // Leaving the trigger starts the close delay; entering the content cancels it.
    fireEvent.pointerLeave(triggerEl);
    fireEvent.pointerEnter(popup);
    act(() => rstest.advanceTimersByTime(150));
    expect(popup.dataset.state).toBe('open');

    fireEvent.pointerLeave(popup);
    act(() => rstest.advanceTimersByTime(100));
    expect(popup.dataset.state).toBe('closed');
  } finally {
    rstest.useRealTimers();
  }
});

test('a controlled Popover reopen cancels the previous hover-close timer', () => {
  rstest.useFakeTimers();
  try {
    const onOpenChange = rstest.fn();
    const popover = (open: boolean) => (
      <Popover
        open={open}
        trigger="hover"
        content="Hover body"
        onOpenChange={onOpenChange}
      >
        <button type="button">Hover me</button>
      </Popover>
    );
    const view = render(popover(true));
    fireEvent.pointerLeave(screen.getByRole('button', { name: 'Hover me' }));
    view.rerender(popover(false));
    view.rerender(popover(true));
    act(() => rstest.advanceTimersByTime(200));

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toHaveAttribute('data-state', 'open');
  } finally {
    rstest.useRealTimers();
  }
});

test('destroyOnHidden unmounts the popup content when closed', async () => {
  render(
    <Popover destroyOnHidden trigger="click" title="T" content="Body">
      <button type="button">Open</button>
    </Popover>,
  );
  expect(screen.queryByText('Body')).toBeNull();

  await userEvent.click(screen.getByRole('button', { name: 'Open' }));
  expect(screen.getByText('Body')).toBeTruthy();

  await userEvent.click(screen.getByRole('button', { name: 'Open' }));
  expect(screen.queryByText('Body')).toBeNull();
});

test('arrow renders by default', () => {
  render(
    <Popover open title="T" content="C">
      <button type="button">Open</button>
    </Popover>,
  );
  expect(document.querySelector('[data-tao-popover-arrow]')).not.toBeNull();
});

test('arrow={false} omits the arrow part', () => {
  render(
    <Popover open arrow={false} title="T" content="C">
      <button type="button">Open</button>
    </Popover>,
  );
  expect(document.querySelector('[data-tao-popover-arrow]')).toBeNull();
});

test('supports antd edge-aligned placements', () => {
  render(
    <Popover open placement="bottomRight" title="T" content="C">
      <button type="button">Open</button>
    </Popover>,
  );
  const popup = document.querySelector('[data-tao-popover]') as HTMLElement;
  expect(popup.dataset.side).toBe('bottom');
  expect(popup.dataset.align).toBe('end');
  expect(popup.dataset.taoPlacement).toBe('bottomRight');
});

test('className and antd semantic classNames merge onto the parts', () => {
  render(
    <Popover
      open
      title="T"
      content="C"
      className="my-pop"
      classNames={{
        root: 'my-root',
        container: 'my-container',
        title: 'my-title',
        content: 'my-content',
        arrow: 'my-arrow',
      }}
    >
      <button type="button">Open</button>
    </Popover>,
  );
  const popup = document.querySelector('[data-tao-popover]') as HTMLElement;
  expect(popup.className).toContain('my-pop');
  expect(popup.className).toContain('my-root');
  expect(
    document.querySelector('[data-tao-popover-container]')?.className,
  ).toContain('my-container');
  const title = document.querySelector(
    '[data-tao-popover-title]',
  ) as HTMLElement;
  expect(title.className).toContain('my-title');
  expect(
    document.querySelector('[data-tao-popover-content]')?.className,
  ).toContain('my-content');
  const arrow = document.querySelector(
    '[data-tao-popover-arrow]',
  ) as HTMLElement;
  expect(arrow.className).toContain('my-arrow');
});

test('hover mode does not swallow default click behavior inside content', () => {
  let prevented: boolean | undefined;
  render(
    <Popover
      trigger="hover"
      open
      content={
        // biome-ignore lint/a11y/useValidAnchor: test fixture for default-prevention
        <a
          href="#target"
          onClick={(e) => {
            prevented = e.defaultPrevented;
          }}
        >
          inside link
        </a>
      }
    >
      <button type="button">trigger</button>
    </Popover>,
  );
  fireEvent.click(screen.getByText('inside link'));
  expect(prevented).toBe(false);
});

test('hover mode preserves click behavior on the trigger', () => {
  let prevented: boolean | undefined;
  render(
    <Popover content="Body">
      <button
        type="button"
        onClick={(event) => {
          prevented = event.defaultPrevented;
        }}
      >
        trigger
      </button>
    </Popover>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'trigger' }));
  expect(prevented).toBe(false);
});

test('title and content accept render functions', () => {
  render(
    <Popover
      open
      title={() => 'Rendered title'}
      content={() => 'Rendered body'}
    >
      <button type="button">trigger</button>
    </Popover>,
  );
  expect(screen.getByText('Rendered title')).toBeTruthy();
  expect(screen.getByText('Rendered body')).toBeTruthy();
});

test.each([false, true])(
  'Escape closes a focus Popover and returns focus without reopening (destroy=%s)',
  async (destroyOnHidden) => {
    render(
      <Popover
        trigger="focus"
        destroyOnHidden={destroyOnHidden}
        content={<button type="button">Popup action</button>}
      >
        <button type="button">Focus trigger</button>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Focus trigger' });
    act(() => trigger.focus());
    const action = screen.getByRole('button', { name: 'Popup action' });
    act(() => action.focus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    if (destroyOnHidden) expect(action).not.toBeInTheDocument();
    else
      expect(action.closest('[data-tao-popover]')).toHaveAttribute(
        'data-state',
        'closed',
      );
  },
);

test('focus trigger opens the popup', () => {
  render(
    <Popover trigger="focus" content="Focused body">
      <button type="button">Focus me</button>
    </Popover>,
  );
  fireEvent.focus(screen.getByRole('button', { name: 'Focus me' }));
  expect(
    document.querySelector('[data-tao-popover]')?.getAttribute('data-state'),
  ).toBe('open');
});

test('a controlled focus Popover reports a single close when focus leaves', async () => {
  const onOpenChange = rstest.fn();
  render(
    <>
      <Popover
        trigger="focus"
        open
        content={<input aria-label="Details" />}
        onOpenChange={onOpenChange}
      >
        <button type="button">Trigger</button>
      </Popover>
      <button type="button">Outside</button>
    </>,
  );
  act(() => screen.getByRole('textbox', { name: 'Details' }).focus());
  onOpenChange.mockClear();
  act(() => screen.getByRole('button', { name: 'Outside' }).focus());

  expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
});

test('focusing a mixed hover/focus trigger cancels its pending hover close', async () => {
  render(
    <Popover
      trigger={['hover', 'focus']}
      mouseEnterDelay={0}
      mouseLeaveDelay={0.03}
      content="Mixed help"
    >
      <button type="button">Help</button>
    </Popover>,
  );
  const trigger = screen.getByRole('button', { name: 'Help' });
  fireEvent.pointerEnter(trigger);
  const popup = document.querySelector('[data-tao-popover]');
  fireEvent.pointerLeave(trigger);
  act(() => trigger.focus());
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 60));
  });
  expect(trigger).toHaveFocus();
  expect(popup).toHaveAttribute('data-state', 'open');
});

test.each([0, 0.03])(
  'mixed triggers keep focused content open after pointer leave (delay=%s)',
  async (mouseLeaveDelay) => {
    render(
      <Popover
        trigger={['hover', 'focus']}
        mouseEnterDelay={0}
        mouseLeaveDelay={mouseLeaveDelay}
        content={<input aria-label="Help details" />}
      >
        <button type="button">Help</button>
      </Popover>,
    );
    act(() => screen.getByRole('button', { name: 'Help' }).focus());
    const input = screen.getByRole('textbox', { name: 'Help details' });
    act(() => input.focus());
    const popup = document.querySelector('[data-tao-popover]');
    expect(popup).toBeTruthy();
    if (popup) fireEvent.pointerLeave(popup);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 60));
    });
    expect(input).toHaveFocus();
    expect(popup).toHaveAttribute('data-state', 'open');
  },
);

test('focus can return from the popup to its trigger and closes only when leaving both', () => {
  const onOpenChange = rstest.fn();
  render(
    <>
      <Popover
        trigger={['hover', 'focus']}
        onOpenChange={onOpenChange}
        content={<input aria-label="Help details" />}
      >
        <button type="button">Help</button>
      </Popover>
      <button type="button">Outside</button>
    </>,
  );
  const trigger = screen.getByRole('button', { name: 'Help' });
  act(() => trigger.focus());
  act(() => screen.getByRole('textbox', { name: 'Help details' }).focus());
  onOpenChange.mockClear();
  act(() => trigger.focus());
  expect(onOpenChange).not.toHaveBeenCalledWith(false);
  expect(document.querySelector('[data-tao-popover]')).toHaveAttribute(
    'data-state',
    'open',
  );
  act(() => screen.getByRole('button', { name: 'Outside' }).focus());
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(document.querySelector('[data-tao-popover]')).toHaveAttribute(
    'data-state',
    'closed',
  );
});

test('hover-only popovers still close on pointer leave with a focused trigger', () => {
  render(
    <Popover
      trigger="hover"
      mouseEnterDelay={0}
      mouseLeaveDelay={0}
      content="Hover-only help"
    >
      <button type="button">Help</button>
    </Popover>,
  );
  const trigger = screen.getByRole('button', { name: 'Help' });
  act(() => trigger.focus());
  fireEvent.pointerEnter(trigger);
  fireEvent.pointerLeave(trigger);
  expect(document.querySelector('[data-tao-popover]')).toHaveAttribute(
    'data-state',
    'closed',
  );
});

test.each(['focus', 'click'] as const)(
  '%s trigger preserves and releases child refs',
  (trigger) => {
    const firstRef = createRef<HTMLButtonElement>();
    const nextRef = createRef<HTMLButtonElement>();
    const { rerender, unmount } = render(
      <Popover trigger={trigger} content="Ref content">
        <button ref={firstRef} type="button">
          Ref trigger
        </button>
      </Popover>,
    );
    const button = screen.getByRole('button', { name: 'Ref trigger' });
    expect(firstRef.current).toBe(button);
    rerender(
      <Popover trigger={trigger} content="Ref content">
        <button ref={nextRef} type="button">
          Ref trigger
        </button>
      </Popover>,
    );
    expect(firstRef.current).toBeNull();
    expect(nextRef.current).toBe(button);
    unmount();
    expect(nextRef.current).toBeNull();
  },
);

test('empty title and content disable the popup', () => {
  render(
    <Popover>
      <button type="button">No popup</button>
    </Popover>,
  );
  expect(document.querySelector('[data-tao-popover]')).toBeNull();
});

test('popover shares the popup stacking level so nested popups paint above it', () => {
  // A Select, Menu or DatePicker opened inside a Popover portals later at the
  // same level and lands on top; a higher popover level would bury it.
  const css = readFileSync('src/components/popover/popover.css', 'utf8');
  const levels = [...css.matchAll(/z-index:\s*([^;]+);/g)].map(
    (match) => match[1],
  );
  expect(levels).toEqual(['var(--tao-z-index-popup)']);
});

test('Popover cancels a pending hover open when switching to click', () => {
  rstest.useFakeTimers();
  try {
    const notify = rstest.fn();
    const trigger = <button type="button">Trigger</button>;
    const view = render(
      <Popover
        trigger="hover"
        mouseEnterDelay={0.2}
        content="Details"
        onOpenChange={notify}
      >
        {trigger}
      </Popover>,
    );
    fireEvent.pointerOver(screen.getByRole('button', { name: 'Trigger' }));
    view.rerender(
      <Popover
        trigger="click"
        mouseEnterDelay={0.2}
        content="Details"
        onOpenChange={notify}
      >
        {trigger}
      </Popover>,
    );
    act(() => rstest.advanceTimersByTime(250));
    expect(notify).not.toHaveBeenCalled();
  } finally {
    rstest.useRealTimers();
  }
});

test.each([null, true])(
  'removing popup content (%s) closes an uncontrolled Popover until reopened',
  (empty) => {
    const onOpenChange = rstest.fn();
    const view = (content: string | boolean | null) => (
      <Popover trigger="click" content={content} onOpenChange={onOpenChange}>
        <button type="button">Trigger</button>
      </Popover>
    );
    const { rerender } = render(view('Original details'));
    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    expect(screen.getByRole('dialog')).toHaveAttribute('data-state', 'open');
    rerender(view(empty));
    expect(document.querySelector('[data-tao-popover]')).toBeNull();
    rerender(view('Replacement details'));
    expect(screen.getByRole('button', { name: 'Trigger' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  },
);

test.each([false, true])(
  'mixed click and hover cancels the old timer (initially open=%s)',
  (defaultOpen) => {
    rstest.useFakeTimers();
    try {
      const onOpenChange = rstest.fn();
      render(
        <Popover
          trigger={['click', 'hover']}
          defaultOpen={defaultOpen}
          mouseEnterDelay={0.2}
          mouseLeaveDelay={0.2}
          content="Details"
          onOpenChange={onOpenChange}
        >
          <button type="button">Trigger</button>
        </Popover>,
      );
      const trigger = screen.getByRole('button', { name: 'Trigger' });
      fireEvent.pointerEnter(trigger);
      if (!defaultOpen) fireEvent.pointerLeave(trigger);
      fireEvent.click(trigger);
      act(() => rstest.advanceTimersByTime(250));
      expect(trigger).toHaveAttribute('aria-expanded', String(!defaultOpen));
      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(!defaultOpen);
    } finally {
      rstest.useRealTimers();
    }
  },
);
