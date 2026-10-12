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

test('hover trigger stays open while the pointer moves into the content', async () => {
  render(
    <Popover trigger="hover" title="T" content="Hover body">
      <button type="button">Hover me</button>
    </Popover>,
  );
  const triggerEl = screen.getByRole('button', { name: 'Hover me' });

  fireEvent.pointerEnter(triggerEl);
  const popup = document.querySelector('[data-tao-popover]') as HTMLElement;

  // Leaving the trigger starts the close delay; entering the content cancels it.
  fireEvent.pointerLeave(triggerEl);
  fireEvent.pointerEnter(popup);
  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(popup.dataset.state).toBe('open');

  fireEvent.pointerLeave(popup);
  await waitFor(() => {
    expect(popup.dataset.state).toBe('closed');
  });
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

test.each([
  0, 0.03,
])('mixed triggers keep focused content open after pointer leave (delay=%s)', async (mouseLeaveDelay) => {
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
});

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

test.each([
  'focus',
  'click',
] as const)('%s trigger preserves and releases child refs', (trigger) => {
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
});

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
