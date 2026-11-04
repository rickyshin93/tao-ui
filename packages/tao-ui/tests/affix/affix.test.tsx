import { afterEach, beforeEach, expect, rstest, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Affix, type AffixRef } from '../../src/components/affix/affix';

let top = 50;
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
      return {
        top: this.hasAttribute('data-target') ? 20 : top,
        bottom: this.hasAttribute('data-target') ? 200 : top + 40,
        left: 30,
        right: 230,
        width: 200,
        height: 40,
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
