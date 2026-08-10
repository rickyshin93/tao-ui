import { expect, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
