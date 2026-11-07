import { expect, rs, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { Fragment } from 'react';
import { Tooltip } from '../../src/components/tooltip/tooltip';

// Mock ResizeObserver (floating-ui's autoUpdate uses it when available)
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
  }
  observe() {}
  disconnect() {}
  unobserve() {}
}
Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  value: MockResizeObserver,
});

test('renders trigger; tooltip not in document until triggered', () => {
  render(
    <Tooltip title="Tip">
      <button type="button">Hover me</button>
    </Tooltip>,
  );
  expect(screen.getByText('Hover me')).toBeTruthy();
  expect(screen.queryByText('Tip')).toBeNull();
  expect(document.querySelector('[data-tao-tooltip-content]')).toBeNull();
});

test('a Fragment trigger opens the tooltip on focus', async () => {
  render(
    <Tooltip title="Fragment tooltip">
      <Fragment key="trigger">
        <span aria-hidden="true">+</span>
        <button type="button">Fragment trigger</button>
      </Fragment>
    </Tooltip>,
  );
  fireEvent.focus(screen.getByRole('button', { name: 'Fragment trigger' }));
  expect(await screen.findByText('Fragment tooltip')).toBeTruthy();
});

test('opens on trigger focus', async () => {
  render(
    <Tooltip title="Tip">
      <button type="button">Focus me</button>
    </Tooltip>,
  );
  fireEvent.focus(screen.getByText('Focus me'));
  expect(await screen.findByText('Tip')).toBeTruthy();
  const content = document.querySelector(
    '[data-tao-tooltip-content]',
  ) as HTMLElement;
  expect(content.dataset.side).toBe('top');
});

test('opens on hover with mouseEnterDelay={0}', async () => {
  render(
    <Tooltip title="Tip" mouseEnterDelay={0}>
      <button type="button">Hover me</button>
    </Tooltip>,
  );
  fireEvent.pointerMove(screen.getByText('Hover me'));
  expect(await screen.findByText('Tip')).toBeTruthy();
});

test('controlled open renders content', () => {
  render(
    <Tooltip open title="Always visible">
      <button type="button">Trigger</button>
    </Tooltip>,
  );
  expect(screen.getByText('Always visible')).toBeTruthy();
});

test('placement maps to content side', () => {
  render(
    <Tooltip open placement="bottom" title="Bottom tip">
      <button type="button">Trigger</button>
    </Tooltip>,
  );
  const content = document.querySelector(
    '[data-tao-tooltip-content]',
  ) as HTMLElement;
  expect(content.dataset.side).toBe('bottom');
});

test('empty title renders nothing and disables the tooltip', async () => {
  render(
    <Tooltip title="">
      <button type="button">Plain</button>
    </Tooltip>,
  );
  const trigger = screen.getByText('Plain');
  expect(trigger).toBeTruthy();
  fireEvent.focus(trigger);
  await waitFor(() => {
    expect(document.querySelector('[data-tao-tooltip-content]')).toBeNull();
  });
});

test('color applies inline style to content and arrow', () => {
  render(
    <Tooltip open color="#ff6600" title="Colored">
      <button type="button">Trigger</button>
    </Tooltip>,
  );
  const content = document.querySelector(
    '[data-tao-tooltip-content]',
  ) as HTMLElement;
  expect(content.getAttribute('style')).toContain('#ff6600');
  const arrow = document.querySelector(
    '[data-tao-tooltip-arrow]',
  ) as SVGElement;
  expect(arrow.getAttribute('style')).toContain('#ff6600');
});

test('onOpenChange fires on focus and blur', async () => {
  const states: boolean[] = [];
  render(
    <Tooltip
      title="Tip"
      onOpenChange={(v) => {
        states.push(v);
      }}
    >
      <button type="button">Trigger</button>
    </Tooltip>,
  );
  const trigger = screen.getByText('Trigger');
  fireEvent.focus(trigger);
  await screen.findByText('Tip');
  fireEvent.blur(trigger);
  await waitFor(() => {
    expect(states).toEqual([true, false]);
  });
});

test('arrow renders by default; arrow={false} hides it', () => {
  render(
    <Tooltip open arrow={false} title="No arrow">
      <button type="button">Trigger</button>
    </Tooltip>,
  );
  expect(screen.getByText('No arrow')).toBeTruthy();
  expect(document.querySelector('[data-tao-tooltip-arrow]')).toBeNull();
});

test('classNames and styles apply to content and arrow', () => {
  render(
    <Tooltip
      open
      title="Styled"
      className="my-tooltip"
      classNames={{ arrow: 'my-arrow' }}
      styles={{ content: { padding: '12px' } }}
    >
      <button type="button">Trigger</button>
    </Tooltip>,
  );
  const content = document.querySelector(
    '[data-tao-tooltip-content]',
  ) as HTMLElement;
  expect(content.className).toContain('my-tooltip');
  expect(content.style.padding).toBe('12px');
  const arrow = document.querySelector(
    '[data-tao-tooltip-arrow]',
  ) as SVGElement;
  expect(arrow.getAttribute('class')).toContain('my-arrow');
});

for (const reason of ['Escape', 'blur']) {
  test(`${reason} closes immediately during the pointer-leave delay`, () => {
    const changes: boolean[] = [];
    render(
      <Tooltip
        defaultOpen
        title="Pending tooltip"
        mouseLeaveDelay={1}
        onOpenChange={(open) => changes.push(open)}
      >
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.pointerLeave(trigger);
    expect(screen.getByText('Pending tooltip')).toBeTruthy();

    if (reason === 'Escape')
      fireEvent.keyDown(document.body, { key: 'Escape' });
    else fireEvent.blur(trigger);

    expect(screen.queryByText('Pending tooltip')).toBeNull();
    expect(changes).toEqual([false]);
  });
}

test('a delayed Tooltip close uses the latest open change callback', () => {
  rs.useFakeTimers();
  try {
    const old = rs.fn();
    const current = rs.fn();
    const tooltip = (callback: (open: boolean) => void) => (
      <Tooltip open title="Tip" onOpenChange={callback}>
        <button type="button">Trigger</button>
      </Tooltip>
    );
    const view = render(tooltip(old));
    fireEvent.pointerLeave(screen.getByRole('button', { name: 'Trigger' }));
    view.rerender(tooltip(current));
    act(() => rs.advanceTimersByTime(200));

    expect(old).not.toHaveBeenCalled();
    expect(current).toHaveBeenCalledExactlyOnceWith(false);
  } finally {
    rs.useRealTimers();
  }
});

test('pointer-leave close is deferred by mouseLeaveDelay', async () => {
  render(
    <Tooltip title="tip" mouseEnterDelay={0} mouseLeaveDelay={0.05}>
      <button type="button">hover me</button>
    </Tooltip>,
  );
  const trigger = screen.getByText('hover me');
  fireEvent.pointerMove(trigger);
  await waitFor(() => expect(screen.getByText('tip')).toBeTruthy());
  fireEvent.pointerLeave(trigger);
  // pointer-driven close is deferred — still open right after leaving
  expect(screen.getByText('tip')).toBeTruthy();
  await waitFor(() => expect(screen.queryByText('tip')).toBeNull(), {
    timeout: 1000,
  });
});

test('a touch pointer leaving a focused tooltip does not request a hover close', () => {
  rs.useFakeTimers();
  try {
    const changed = rs.fn();
    render(
      <Tooltip title="Help" onOpenChange={changed}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    act(() => trigger.focus());
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    changed.mockClear();

    fireEvent.pointerLeave(trigger, { pointerType: 'touch' });
    act(() => rs.advanceTimersByTime(200));

    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  } finally {
    rs.useRealTimers();
  }
});

test('leaving before the open delay expires does not report a close', () => {
  rs.useFakeTimers();
  try {
    const changed = rs.fn();
    render(
      <Tooltip title="Help" mouseEnterDelay={0.5} onOpenChange={changed}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.pointerMove(trigger, { pointerType: 'mouse' });
    fireEvent.pointerLeave(trigger, { pointerType: 'mouse' });
    act(() => rs.advanceTimersByTime(600));
    expect(changed).not.toHaveBeenCalled();
  } finally {
    rs.useRealTimers();
  }
});

test('removing the title cancels a pending tooltip close and resets the hover session', () => {
  rs.useFakeTimers();
  try {
    const changed = rs.fn();
    const child = <button type="button">Trigger</button>;
    const view = render(
      <Tooltip title="Help" mouseEnterDelay={0} onOpenChange={changed}>
        {child}
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.focus(trigger);
    expect(changed.mock.calls).toEqual([[true]]);
    fireEvent.pointerLeave(trigger, { pointerType: 'mouse' });
    view.rerender(
      <Tooltip title="" onOpenChange={changed}>
        {child}
      </Tooltip>,
    );
    view.rerender(
      <Tooltip title="New help" onOpenChange={changed}>
        {child}
      </Tooltip>,
    );
    act(() => rs.advanceTimersByTime(200));
    expect(changed.mock.calls).toEqual([[true]]);
    expect(screen.queryByText('New help')).not.toBeInTheDocument();
  } finally {
    rs.useRealTimers();
  }
});

test('conditional boolean titles leave the focused trigger without an empty tooltip', () => {
  const onOpenChange = rs.fn();
  const view = render(
    <Tooltip title={false} onOpenChange={onOpenChange}>
      <button type="button">Help</button>
    </Tooltip>,
  );
  const trigger = screen.getByRole('button', { name: 'Help' });
  fireEvent.focus(trigger);
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(screen.queryByRole('tooltip')).toBeNull();
  view.rerender(
    <Tooltip title={0} open>
      <button type="button">Help</button>
    </Tooltip>,
  );
  expect(screen.getByRole('tooltip')).toHaveTextContent('0');
});
