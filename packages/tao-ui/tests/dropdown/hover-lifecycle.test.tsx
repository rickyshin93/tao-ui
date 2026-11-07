import { afterEach, expect, rs, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Dropdown } from '../../src/components/dropdown/dropdown';

afterEach(() => rs.useRealTimers());
const menu = { items: [{ key: 'edit', label: 'Edit' }] };

test('hover-only Dropdown does not toggle when its trigger is clicked', () => {
  const onOpenChange = rs.fn();
  render(
    <Dropdown trigger={['hover']} menu={menu} onOpenChange={onOpenChange}>
      <button type="button">Trigger</button>
    </Dropdown>,
  );
  const trigger = screen.getByRole('button', { name: 'Trigger' });
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
  expect(onOpenChange).not.toHaveBeenCalled();
  fireEvent.pointerEnter(trigger);
  expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
  onOpenChange.mockClear();
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
});

test('hovering an already open Dropdown cancels dismissal without another open request', () => {
  rs.useFakeTimers();
  const onOpenChange = rs.fn();
  render(
    <Dropdown
      defaultOpen
      trigger={['hover']}
      menu={menu}
      onOpenChange={onOpenChange}
    >
      <button type="button">Trigger</button>
    </Dropdown>,
  );
  const trigger = screen.getByRole('button', { name: 'Trigger' });
  fireEvent.pointerLeave(trigger);
  fireEvent.pointerEnter(screen.getByRole('menu'));
  act(() => rs.advanceTimersByTime(200));

  expect(onOpenChange).not.toHaveBeenCalled();
  expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeVisible();
});

test('a delayed Dropdown close uses the latest open change callback', () => {
  rs.useFakeTimers();
  const old = rs.fn();
  const current = rs.fn();
  const dropdown = (onOpenChange: (open: boolean) => void) => (
    <Dropdown open trigger={['hover']} menu={menu} onOpenChange={onOpenChange}>
      <button type="button">Trigger</button>
    </Dropdown>
  );
  const view = render(dropdown(old));
  fireEvent.pointerLeave(screen.getByRole('button', { name: 'Trigger' }));
  view.rerender(dropdown(current));
  act(() => rs.advanceTimersByTime(200));

  expect(old).not.toHaveBeenCalled();
  expect(current).toHaveBeenCalledExactlyOnceWith(false);
});

test('hover Dropdown remains keyboard-operable', async () => {
  render(
    <Dropdown trigger={['hover']} menu={menu}>
      <button type="button">Trigger</button>
    </Dropdown>,
  );
  const trigger = screen.getByRole('button', { name: 'Trigger' });
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
});

test('a pending hover close cannot notify after Dropdown unmounts', () => {
  rs.useFakeTimers();
  const onOpenChange = rs.fn();
  const view = render(
    <Dropdown
      defaultOpen
      trigger={['hover']}
      menu={menu}
      onOpenChange={onOpenChange}
    >
      <button type="button">Trigger</button>
    </Dropdown>,
  );
  fireEvent.pointerLeave(screen.getByRole('button', { name: 'Trigger' }));
  view.unmount();
  act(() => rs.advanceTimersByTime(200));
  expect(onOpenChange).not.toHaveBeenCalled();
});

test('keyboard dismissal cancels a pending hover close notification', () => {
  rs.useFakeTimers();
  const onOpenChange = rs.fn();
  render(
    <Dropdown
      defaultOpen
      trigger={['hover']}
      menu={menu}
      onOpenChange={onOpenChange}
    >
      <button type="button">Trigger</button>
    </Dropdown>,
  );
  fireEvent.pointerLeave(screen.getByRole('button', { name: 'Trigger' }));
  fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
  act(() => rs.advanceTimersByTime(200));
  expect(onOpenChange.mock.calls).toEqual([[false]]);
});

test('reopening a controlled Dropdown does not replay the old hover close', () => {
  rs.useFakeTimers();
  const onOpenChange = rs.fn();
  const picker = (open: boolean) => (
    <Dropdown
      open={open}
      trigger={['hover']}
      menu={menu}
      onOpenChange={onOpenChange}
    >
      <button type="button">Trigger</button>
    </Dropdown>
  );
  const view = render(picker(true));
  fireEvent.pointerLeave(screen.getByRole('button', { name: 'Trigger' }));
  view.rerender(picker(false));
  view.rerender(picker(true));
  expect(onOpenChange).not.toHaveBeenCalled();
  act(() => rs.advanceTimersByTime(100));
  expect(onOpenChange).not.toHaveBeenCalled();
  act(() => rs.advanceTimersByTime(100));
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeVisible();
});

test('Dropdown cancels a pending hover close when switching to click', () => {
  rs.useFakeTimers();
  const notify = rs.fn();
  const trigger = <button type="button">Trigger</button>;
  const menu = { items: [{ key: 'edit', label: 'Edit' }] };
  const view = render(
    <Dropdown defaultOpen trigger={['hover']} menu={menu} onOpenChange={notify}>
      {trigger}
    </Dropdown>,
  );
  fireEvent.pointerOut(screen.getByRole('button', { name: 'Trigger' }));
  view.rerender(
    <Dropdown defaultOpen trigger={['click']} menu={menu} onOpenChange={notify}>
      {trigger}
    </Dropdown>,
  );
  act(() => rs.advanceTimersByTime(250));
  expect(notify).not.toHaveBeenCalled();
  expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeVisible();
});
