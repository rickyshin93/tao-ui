import { afterEach, expect, rstest, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import {
  FloatButton,
  type FloatButtonElement,
  type FloatButtonGroupRef,
  type FloatButtonRef,
} from '../../src/components/float-button/float-button';
import { TaoProvider } from '../../src/provider/tao-provider';

afterEach(() => rstest.restoreAllMocks());

test('preserves custom tab order for enabled buttons and links', () => {
  render(
    <>
      <FloatButton content="Button action" tabIndex={-1} />
      <FloatButton content="Link action" href="/action" tabIndex={0} />
    </>,
  );
  expect(screen.getByRole('button', { name: 'Button action' })).toHaveAttribute(
    'tabindex',
    '-1',
  );
  expect(screen.getByRole('link', { name: 'Link action' })).toHaveAttribute(
    'tabindex',
    '0',
  );
});

test('a child action may handle Escape without closing its FloatButton group', () => {
  render(
    <FloatButton.Group trigger="click" content="Actions">
      <FloatButton
        content="Child action"
        onKeyDown={(event) => {
          if (event.key === 'Escape') event.preventDefault();
        }}
      />
    </FloatButton.Group>,
  );
  const trigger = screen.getByRole('button', { name: 'Actions' });
  fireEvent.click(trigger);
  fireEvent.keyDown(screen.getByRole('button', { name: 'Child action' }), {
    key: 'Escape',
  });
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
});

test('zero renders as a FloatButton tooltip', async () => {
  render(<FloatButton content="Notifications" tooltip={0} />);
  fireEvent.focus(screen.getByRole('button', { name: 'Notifications' }));
  expect(await screen.findByRole('tooltip')).toHaveTextContent('0');
});

test('renders native button and anchor semantics with provider disabled behavior', () => {
  const click = rstest.fn();
  const ref = createRef<FloatButtonElement>();
  const { rerender } = render(
    <FloatButton
      ref={ref}
      content="Submit"
      htmlType="submit"
      onClick={click}
    />,
  );
  expect(ref.current).toBe(screen.getByRole('button', { name: 'Submit' }));
  expect(ref.current?.type).toBe('submit');
  fireEvent.click(ref.current!);
  expect(click).toHaveBeenCalledTimes(1);
  rerender(
    <TaoProvider disabled>
      <FloatButton content="Link" href="/next" onClick={click} />
    </TaoProvider>,
  );
  const disabled = screen.getByText('Link').closest('a')!;
  expect(disabled).toHaveAttribute('aria-disabled', 'true');
  expect(disabled).not.toHaveAttribute('href');
  fireEvent.click(disabled);
  expect(click).toHaveBeenCalledTimes(1);
  rerender(<FloatButton content="Link" href="/next" target="_blank" />);
  expect(screen.getByRole('link', { name: 'Link' })).toHaveAttribute(
    'href',
    '/next',
  );
});
test('click group toggles, keyboard skips disabled actions and Escape/outside close it', () => {
  const change = rstest.fn();
  const ref = createRef<FloatButtonGroupRef>();
  render(
    <FloatButton.Group
      ref={ref}
      trigger="click"
      content="Actions"
      shape="square"
      onOpenChange={change}
    >
      <FloatButton content="First" />
      <FloatButton content="Disabled" disabled />
      <FloatButton content="Last" />
    </FloatButton.Group>,
  );
  const trigger = screen.getByRole('button', { name: 'Actions' });
  expect(screen.queryByText('First')).toBeNull();
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const first = screen.getByRole('button', { name: 'First' });
  expect(first).toHaveAttribute('data-tao-shape', 'square');
  first.focus();
  fireEvent.keyDown(first, { key: 'ArrowDown' });
  expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
  fireEvent.keyDown(screen.getByRole('button', { name: 'Last' }), {
    key: 'Escape',
  });
  expect(trigger).toHaveFocus();
  expect(screen.queryByText('First')).toBeNull();
  fireEvent.click(trigger);
  fireEvent.click(document.body);
  expect(change.mock.calls.map((call) => call[0])).toEqual([
    true,
    false,
    true,
    false,
  ]);
  expect(ref.current?.nativeElement).toBe(screen.getByRole('toolbar'));
});
test('a click FloatButton group closes when clicking outside in its own iframe', () => {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  const owner = frame.contentDocument!;
  const host = owner.createElement('div');
  owner.body.append(host);
  const view = render(
    <>
      <button type="button">Outside</button>
      <FloatButton.Group trigger="click" aria-label="Expand actions">
        <FloatButton content="Action" />
      </FloatButton.Group>
    </>,
    { container: host },
  );
  try {
    const trigger = view.getByRole('button', { name: 'Expand actions' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(view.getByRole('button', { name: 'Outside' }));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  } finally {
    view.unmount();
    frame.remove();
  }
});

test('controlled groups request a change without mutating open and hover supports focus', () => {
  const change = rstest.fn();
  const { rerender } = render(
    <FloatButton.Group
      open={false}
      trigger="click"
      content="Actions"
      onOpenChange={change}
    >
      <FloatButton content="Child" />
    </FloatButton.Group>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
  expect(change).toHaveBeenCalledWith(true);
  expect(screen.queryByText('Child')).toBeNull();
  rerender(
    <FloatButton.Group trigger="hover" content="Actions">
      <FloatButton content="Child" />
    </FloatButton.Group>,
  );
  fireEvent.focus(screen.getByRole('button', { name: 'Actions' }));
  expect(screen.getByText('Child')).toBeTruthy();
  fireEvent.mouseLeave(screen.getByRole('toolbar'));
  expect(screen.queryByText('Child')).toBeNull();
});

test('a hover group stays open for keyboard navigation and closes when focus leaves', () => {
  render(
    <>
      <FloatButton.Group trigger="hover" content="Actions">
        <FloatButton content="Child" />
      </FloatButton.Group>
      <button type="button">Outside</button>
    </>,
  );
  const trigger = screen.getByRole('button', { name: 'Actions' });
  act(() => trigger.focus());
  const child = screen.getByRole('button', { name: 'Child' });
  act(() => child.focus());
  fireEvent.mouseEnter(screen.getByRole('toolbar'));
  fireEvent.mouseLeave(screen.getByRole('toolbar'));
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  act(() => screen.getByRole('button', { name: 'Outside' }).focus());
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(child).not.toBeInTheDocument();
});

test('BackTop resolves the scrolling element of an iframe window', () => {
  const view = render(<iframe title="Scroll preview" />);
  const frame = screen.getByTitle<HTMLIFrameElement>('Scroll preview');
  const frameWindow = frame.contentWindow!;
  const scrollingElement = frameWindow.document.documentElement;
  Object.defineProperty(frameWindow.document, 'scrollingElement', {
    value: scrollingElement,
  });
  scrollingElement.scrollTop = 500;
  view.rerender(
    <>
      <iframe title="Scroll preview" />
      <FloatButton.BackTop target={() => frameWindow} duration={0} />
    </>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
  expect(scrollingElement.scrollTop).toBe(0);
});

test('BackTop updates when the scroll target iframe resizes', () => {
  const view = render(<iframe title="Resize preview" />);
  const frameWindow =
    screen.getByTitle<HTMLIFrameElement>('Resize preview').contentWindow!;
  const scrollingElement = frameWindow.document.documentElement;
  Object.defineProperty(frameWindow.document, 'scrollingElement', {
    value: scrollingElement,
  });
  scrollingElement.scrollTop = 500;
  view.rerender(
    <>
      <iframe title="Resize preview" />
      <FloatButton.BackTop target={() => frameWindow} />
    </>,
  );
  expect(screen.getByRole('button', { name: 'Back to top' })).toBeVisible();
  scrollingElement.scrollTop = 0;
  act(() => frameWindow.dispatchEvent(new Event('resize')));
  expect(screen.queryByRole('button', { name: 'Back to top' })).toBeNull();
});
test('BackTop tracks the supplied scroll container and restores its top with a public ref', () => {
  const target = document.createElement('div');
  Object.defineProperties(target, {
    scrollHeight: { value: 1000 },
    clientHeight: { value: 200 },
  });
  const getTarget = () => target;
  const ref = createRef<FloatButtonRef>();
  const click = rstest.fn();
  const { unmount } = render(
    <FloatButton.BackTop
      ref={ref}
      target={getTarget}
      visibilityHeight={100}
      duration={0}
      showProgress
      onClick={click}
    />,
  );
  expect(screen.queryByRole('button')).toBeNull();
  target.scrollTop = 400;
  fireEvent.scroll(target);
  const button = screen.getByRole('button', { name: 'Back to top' });
  expect(ref.current?.nativeElement).toBe(button);
  expect(button.style.getPropertyValue('--tao-float-progress')).toBe('0.5turn');
  fireEvent.click(button);
  expect(target.scrollTop).toBe(0);
  expect(click).toHaveBeenCalledTimes(1);
  fireEvent.scroll(target);
  expect(screen.queryByRole('button')).toBeNull();
  unmount();
  act(() => target.dispatchEvent(new Event('scroll')));
});
test('preventDefault cancels the BackTop scroll', () => {
  const target = document.createElement('div');
  target.scrollTop = 400;
  render(
    <FloatButton.BackTop
      target={() => target}
      duration={0}
      onClick={(event) => event.preventDefault()}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
  expect(target.scrollTop).toBe(400);
});

test('preventDefault cancels the click-triggered group toggle', () => {
  render(
    <FloatButton.Group
      trigger="click"
      content="Actions"
      onClick={(event) => event.preventDefault()}
    >
      <FloatButton content="Child action" />
    </FloatButton.Group>,
  );

  const trigger = screen.getByRole('button', { name: 'Actions' });
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('BackTop cancels its scrolling animation when unmounted', () => {
  const target = document.createElement('div');
  target.scrollTop = 500;
  const cancel = rstest.spyOn(globalThis, 'cancelAnimationFrame');
  const request = rstest
    .spyOn(globalThis, 'requestAnimationFrame')
    .mockReturnValue(71);
  const { unmount } = render(<FloatButton.BackTop target={() => target} />);
  fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
  expect(request).toHaveBeenCalled();
  unmount();
  expect(cancel).toHaveBeenCalledWith(71);
});

test('BackTop keeps animating when a parent recreates its target callback for the same element', () => {
  const target = document.createElement('div');
  target.scrollTop = 500;
  const cancel = rstest.spyOn(globalThis, 'cancelAnimationFrame');
  rstest.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(71);
  const { rerender } = render(<FloatButton.BackTop target={() => target} />);
  fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
  cancel.mockClear();
  rerender(<FloatButton.BackTop target={() => target} />);
  expect(cancel).not.toHaveBeenCalledWith(71);
});

test('BackTop follows a replacement element returned by the same target callback', () => {
  const first = document.createElement('div');
  first.scrollTop = 500;
  const second = document.createElement('div');
  let target = first;
  const getTarget = () => target;
  const { rerender } = render(<FloatButton.BackTop target={getTarget} />);
  expect(screen.getByRole('button', { name: 'Back to top' })).toBeVisible();
  target = second;
  rerender(<FloatButton.BackTop target={getTarget} />);
  expect(screen.queryByRole('button', { name: 'Back to top' })).toBeNull();
  second.scrollTop = 500;
  fireEvent.scroll(second);
  expect(screen.getByRole('button', { name: 'Back to top' })).toBeVisible();
});
