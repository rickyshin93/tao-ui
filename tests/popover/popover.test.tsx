import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
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

test('empty title and content disable the popup', () => {
  render(
    <Popover>
      <button type="button">No popup</button>
    </Popover>,
  );
  expect(document.querySelector('[data-tao-popover]')).toBeNull();
});
