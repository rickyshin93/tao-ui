import { afterEach, beforeEach, expect, rstest, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { createPortal } from 'react-dom';
import { Affix, type AffixRef } from '../../src/components/affix/affix';

let top = 50;
let targetTop = 20;
let naturalHeight = 40;
let frames = new Map<number, FrameRequestCallback>();
let id = 0;
const flush = () =>
  act(() => {
    const current = [...frames.values()];
    frames.clear();
    current.forEach((callback) => {
      callback(0);
    });
  });
beforeEach(() => {
  top = 50;
  targetTop = 20;
  naturalHeight = 40;
  frames = new Map();
  rstest
    .spyOn(globalThis, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      frames.set(++id, callback);
      return id;
    });
  rstest
    .spyOn(globalThis, 'cancelAnimationFrame')
    .mockImplementation((frame) => {
      frames.delete(frame);
    });
  rstest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function () {
      const height = this.hasAttribute('data-tao-affix-content')
        ? parseFloat(this.style.height) || naturalHeight
        : 40;
      return {
        top: this.hasAttribute('data-target') ? targetTop : top,
        bottom: this.hasAttribute('data-target') ? 200 : top + height,
        left: 30,
        right: 230,
        width: 200,
        height,
        x: 30,
        y: top,
        toJSON: () => ({}),
      };
    });
});
afterEach(() => rstest.restoreAllMocks());

test('affixes at the threshold, preserves occupied space and announces transitions once', () => {
  const change = rstest.fn();
  const { container } = render(
    <Affix offsetTop={10} onChange={change}>
      Tools
    </Affix>,
  );
  flush();
  const content = screen.getByText('Tools');
  expect(content.style.position).toBe('');
  top = 5;
  fireEvent.scroll(window);
  flush();
  expect(content).toHaveStyle({
    position: 'fixed',
    top: '10px',
    width: '200px',
  });
  expect(container.querySelector('[aria-hidden]')).toHaveStyle({
    height: '40px',
  });
  expect(change).toHaveBeenCalledWith(true);
  fireEvent.scroll(window);
  flush();
  expect(change).toHaveBeenCalledTimes(1);
  top = 50;
  fireEvent.scroll(window);
  flush();
  expect(content.style.position).toBe('');
  expect(container.querySelector('[aria-hidden]')).toBeNull();
  expect(change).toHaveBeenLastCalledWith(false);
});
test('uses custom target bounds and updates offsets without a scroll event', () => {
  const target = document.createElement('div');
  target.setAttribute('data-target', '');
  const getTarget = () => target;
  const { rerender } = render(
    <Affix target={getTarget} offsetTop={10}>
      Tools
    </Affix>,
  );
  top = 25;
  flush();
  expect(screen.getByText('Tools')).toHaveStyle({ top: '30px' });
  rerender(
    <Affix target={getTarget} offsetTop={20}>
      Tools
    </Affix>,
  );
  flush();
  expect(screen.getByText('Tools')).toHaveStyle({ top: '40px' });
  rerender(
    <Affix target={getTarget} offsetBottom={12}>
      Tools
    </Affix>,
  );
  top = 180;
  flush();
  expect(screen.getByText('Tools')).toHaveStyle({
    bottom: `${window.innerHeight - 188}px`,
  });
});
test('public updates coalesce and cancellation/unmount release pending work', () => {
  const ref = createRef<AffixRef>();
  const { unmount } = render(<Affix ref={ref}>Tools</Affix>);
  ref.current?.updatePosition();
  ref.current?.updatePosition();
  expect(frames.size).toBe(1);
  ref.current?.updatePosition.cancel();
  expect(frames.size).toBe(0);
  ref.current?.updatePosition();
  unmount();
  expect(frames.size).toBe(0);
  fireEvent.scroll(window);
  expect(frames.size).toBe(0);
});

test('scrolling the window recalculates the affixed position of a custom target', () => {
  const target = document.createElement('div');
  target.setAttribute('data-target', '');
  top = -100;
  render(<Affix target={() => target}>Tools</Affix>);
  flush();
  const content = screen.getByText('Tools');
  expect(content).toHaveStyle({ top: '20px' });

  targetTop = 10;
  fireEvent.scroll(window);
  flush();
  expect(content).toHaveStyle({ top: '10px' });
});

test('Affix updates when an outer scroll container moves its custom target', () => {
  const target = createRef<HTMLDivElement>();
  top = -100;
  render(
    <div data-testid="outer-scroll">
      <div ref={target} data-target="">
        <Affix target={() => target.current}>Tools</Affix>
      </div>
    </div>,
  );
  flush();
  flush();
  expect(screen.getByText('Tools')).toHaveStyle({ top: '20px' });
  targetTop = 10;
  fireEvent.scroll(screen.getByTestId('outer-scroll'));
  flush();
  expect(screen.getByText('Tools')).toHaveStyle({ top: '10px' });
});

test.each(['inside', 'outside'] as const)(
  'Affix measures after an ancestor scroll %s a shadow root',
  (scope) => {
    const outer = document.createElement('div');
    const host = document.createElement('div');
    outer.append(host);
    document.body.append(outer);
    const shadow = host.attachShadow({ mode: 'open' });
    const inner = document.createElement('div');
    shadow.append(inner);
    const { unmount } = render(
      createPortal(<Affix offsetTop={10}>Tools</Affix>, inner),
    );
    try {
      flush();
      const content = inner.querySelector('[data-tao-affix-content]');
      expect(content).not.toHaveAttribute('data-tao-affixed');
      top = 5;
      fireEvent.scroll(scope === 'inside' ? inner : outer);
      flush();
      expect(content).toHaveStyle({ top: '10px' });
    } finally {
      unmount();
      outer.remove();
    }
  },
);

test('affixed content can grow and update its placeholder height', () => {
  top = -10;
  const { container } = render(<Affix>Tools</Affix>);
  flush();
  const placeholder = container.querySelector('[aria-hidden]');
  expect(placeholder).toHaveStyle({ height: '40px' });

  naturalHeight = 80;
  fireEvent.scroll(window);
  flush();
  expect(placeholder).toHaveStyle({ height: '80px' });
});

test('accepts an iframe window as the scroll target', () => {
  const view = render(<iframe title="Preview" />);
  const frame = screen.getByTitle<HTMLIFrameElement>('Preview').contentWindow!;
  top = 5;
  view.rerender(
    <>
      <iframe title="Preview" />
      <Affix target={() => frame} offsetTop={10}>
        Tools
      </Affix>
    </>,
  );
  flush();
  expect(screen.getByText('Tools')).toHaveStyle({
    position: 'fixed',
    top: '10px',
  });
});

test('a stable target getter follows a replaced scroll container', () => {
  const original = document.createElement('div');
  const replacement = document.createElement('div');
  replacement.setAttribute('data-target', '');
  let current = original;
  const target = () => current;
  const { rerender } = render(<Affix target={target}>Tools</Affix>);
  flush();

  current = replacement;
  rerender(<Affix target={target}>Tools</Affix>);
  flush();
  top = 15;
  fireEvent.scroll(original);
  expect(frames.size).toBe(0);
  fireEvent.scroll(replacement);
  flush();
  expect(screen.getByText('Tools')).toHaveStyle({ top: '20px' });
});

test('Affix merges its prefix and root classes onto the holder', () => {
  const { container } = render(
    <Affix
      prefixCls="affix-prefix"
      rootClassName="affix-outer"
      className="affix-local"
      classNames={{ root: 'affix-semantic' }}
    >
      Tools
    </Affix>,
  );
  expect(container.querySelector('[data-tao-affix]')).toHaveClass(
    'affix-prefix',
    'affix-outer',
    'affix-local',
    'affix-semantic',
  );
});

test('switching to an unavailable target releases the fixed content and applies semantic slots', () => {
  top = -20;
  const { rerender } = render(
    <Affix
      className="outer"
      classNames={{ root: 'root', content: 'content' }}
      styles={{ content: { color: 'red' } }}
    >
      Tools
    </Affix>,
  );
  flush();
  expect(screen.getByText('Tools')).toHaveClass('content');
  expect(screen.getByText('Tools').parentElement).toHaveClass('outer', 'root');
  rerender(<Affix target={() => null}>Tools</Affix>);
  flush();
  expect(screen.getByText('Tools').style.position).toBe('');
});
