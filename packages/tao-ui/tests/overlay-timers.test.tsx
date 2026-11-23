import { afterEach, expect, rs, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { startTransition, Suspense, useState } from 'react';
import { Dropdown } from '../src/components/dropdown/dropdown';
import { Popover } from '../src/components/popover/popover';
import { Tooltip } from '../src/components/tooltip/tooltip';

afterEach(() => rs.useRealTimers());

test('hovering out of a focused Popover trigger inside a shadow root keeps it open', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  shadow.append(container);
  const onOpenChange = rs.fn();
  const { unmount } = render(
    <Popover
      defaultOpen
      trigger={['focus', 'hover']}
      content="Details"
      mouseLeaveDelay={0}
      onOpenChange={onOpenChange}
    >
      <button type="button">Shadow trigger</button>
    </Popover>,
    { container },
  );
  try {
    const trigger = container.querySelector('button')!;
    act(() => trigger.focus());
    expect(shadow.activeElement).toBe(trigger);
    onOpenChange.mockClear();
    fireEvent.pointerLeave(trigger);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeVisible();
  } finally {
    unmount();
    host.remove();
  }
});

test.each(['Dropdown', 'Tooltip'] as const)(
  '%s hover dismissal calls the committed handler during a suspended transition',
  async (name) => {
    rs.useFakeTimers();
    const committed = rs.fn();
    const suspended = rs.fn();
    const pending = new Promise<never>(() => {});
    function Blocker({ active }: { active: boolean }) {
      if (active) throw pending;
      return null;
    }
    function Fixture() {
      const [next, setNext] = useState(false);
      const callback = next ? suspended : committed;
      return (
        <>
          <button
            type="button"
            onClick={() => startTransition(() => setNext(true))}
          >
            Change handler
          </button>
          <Suspense fallback="Waiting">
            {name === 'Dropdown' ? (
              <Dropdown
                defaultOpen
                trigger={['hover']}
                menu={{ items: [{ key: 'item', label: 'Edit' }] }}
                onOpenChange={callback}
              >
                <button type="button">Trigger</button>
              </Dropdown>
            ) : (
              <Tooltip defaultOpen title="Hint" onOpenChange={callback}>
                <button type="button">Trigger</button>
              </Tooltip>
            )}
            <Blocker active={next} />
          </Suspense>
        </>
      );
    }
    render(<Fixture />);
    fireEvent.pointerLeave(screen.getByRole('button', { name: 'Trigger' }));
    fireEvent.click(screen.getByRole('button', { name: 'Change handler' }));
    expect(screen.queryByText('Waiting')).toBeNull();
    await act(async () => rs.advanceTimersByTime(200));
    expect(committed).toHaveBeenCalledExactlyOnceWith(false);
    expect(suspended).not.toHaveBeenCalled();
  },
);

test.each([true, false])(
  'Popover delayed hover transition %s uses the current handler',
  (opening) => {
    rs.useFakeTimers();
    const old = rs.fn();
    const latest = rs.fn();
    const popup = (onOpenChange: (open: boolean) => void) => (
      <Popover
        defaultOpen={!opening}
        trigger="hover"
        content="Details"
        mouseEnterDelay={0.1}
        mouseLeaveDelay={0.1}
        onOpenChange={onOpenChange}
      >
        <button type="button">Trigger</button>
      </Popover>
    );
    const view = render(popup(old));
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    if (opening) fireEvent.pointerEnter(trigger);
    else fireEvent.pointerLeave(trigger);
    view.rerender(popup(latest));
    act(() => rs.advanceTimersByTime(200));
    expect(latest).toHaveBeenCalledExactlyOnceWith(opening);
    expect(old).not.toHaveBeenCalled();
  },
);

test('moving into an open Popover cancels close without reporting another open', () => {
  rs.useFakeTimers();
  const onOpenChange = rs.fn();
  render(
    <Popover
      defaultOpen
      trigger="hover"
      content="Details"
      onOpenChange={onOpenChange}
    >
      <button type="button">Trigger</button>
    </Popover>,
  );
  fireEvent.pointerLeave(screen.getByRole('button', { name: 'Trigger' }));
  fireEvent.pointerEnter(screen.getByRole('dialog'));
  act(() => rs.advanceTimersByTime(200));
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog')).toBeVisible();
});
