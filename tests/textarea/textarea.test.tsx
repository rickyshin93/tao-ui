import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, rs, test } from '@rstest/core';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Textarea } from '../../src/components/textarea/textarea';
import { TaoProvider } from '../../src/provider/tao-provider';

test('renders textarea with value', () => {
  render(<Textarea value="hello" onChange={() => {}} />);
  expect(screen.getByRole('textbox')).toHaveValue('hello');
});

test('calls onChange on typing', async () => {
  let val = '';
  render(
    <Textarea
      value={val}
      onChange={(e) => {
        val = e.target.value;
      }}
    />,
  );
  await userEvent.type(screen.getByRole('textbox'), 'a');
  expect(val).toBe('a');
});

test('size prop sets data-tao-size on wrapper', () => {
  render(<Textarea size="small" />);
  const wrapper = screen.getByRole('textbox').closest('[data-tao-textarea]');
  expect(wrapper).toBeInstanceOf(HTMLElement);
  expect((wrapper as HTMLElement).dataset.taoSize).toBe('small');
});

test('inherits size from TaoProvider', () => {
  render(
    <TaoProvider size="large">
      <Textarea />
    </TaoProvider>,
  );
  const wrapper = screen.getByRole('textbox').closest('[data-tao-textarea]');
  expect(wrapper).toBeInstanceOf(HTMLElement);
  expect((wrapper as HTMLElement).dataset.taoSize).toBe('large');
});

test('variant prop sets data-tao-variant', () => {
  render(<Textarea variant="filled" />);
  const wrapper = screen.getByRole('textbox').closest('[data-tao-textarea]');
  expect(wrapper).toBeInstanceOf(HTMLElement);
  expect((wrapper as HTMLElement).dataset.taoVariant).toBe('filled');
});

test('inherits variant from TaoProvider', () => {
  render(
    <TaoProvider variant="borderless">
      <Textarea />
    </TaoProvider>,
  );
  const wrapper = screen.getByRole('textbox').closest('[data-tao-textarea]');
  expect(wrapper).toBeInstanceOf(HTMLElement);
  expect((wrapper as HTMLElement).dataset.taoVariant).toBe('borderless');
});

test('error sets aria-invalid and data-tao-error', () => {
  render(<Textarea error />);
  const el = screen.getByRole('textbox');
  expect(el.getAttribute('aria-invalid')).toBe('true');
  expect(
    (el.closest('[data-tao-textarea]') as HTMLElement).dataset.taoError,
  ).toBe('true');
});

test('inherits disabled from TaoProvider', () => {
  render(
    <TaoProvider disabled>
      <Textarea />
    </TaoProvider>,
  );
  expect(screen.getByRole('textbox')).toBeDisabled();
});

test('autoSize marks the textarea element', () => {
  render(<Textarea autoSize />);
  expect(screen.getByRole('textbox').hasAttribute('data-tao-autosize')).toBe(
    true,
  );
});

test('autoSize responds to width changes, respects maxRows and releases observation', () => {
  let notify = (_width: number) => {};
  const disconnect = rs.fn();
  rs.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        notify = (width) =>
          callback(
            [{ contentRect: { width } }] as ResizeObserverEntry[],
            this as unknown as ResizeObserver,
          );
      }
      observe() {}
      disconnect = disconnect;
    },
  );
  let frame: FrameRequestCallback | undefined;
  rs.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frame = callback;
    return 1;
  });
  rs.stubGlobal('cancelAnimationFrame', () => {
    frame = undefined;
  });
  const resized = (width: number) =>
    act(() => {
      notify(width);
      const callback = frame;
      frame = undefined;
      callback?.(0);
    });
  try {
    const { rerender, unmount } = render(
      <Textarea autoSize defaultValue="Long article" />,
    );
    const textarea = screen.getByRole('textbox');
    let contentHeight = 162;
    const measure = rs.fn(() => contentHeight);
    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      get: measure,
    });
    resized(638);
    expect(textarea.style.height).toBe('162px');
    contentHeight = 668;
    resized(178);
    expect(textarea.style.height).toBe('668px');
    measure.mockClear();
    resized(178);
    expect(measure).not.toHaveBeenCalled();
    contentHeight = 162;
    resized(638);
    expect(textarea.style.height).toBe('162px');

    rerender(
      <Textarea
        autoSize={{ maxRows: 3 }}
        defaultValue="Long article"
        styles={{ textarea: { lineHeight: '20px', padding: '4px' } }}
      />,
    );
    contentHeight = 668;
    resized(178);
    expect(textarea.style.height).toBe('68px');
    expect(textarea.style.overflowY).toBe('auto');
    contentHeight = 48;
    resized(638);
    expect(textarea.style.height).toBe('48px');
    expect(textarea.style.overflowY).toBe('hidden');
    act(() => notify(178));
    expect(frame).toBeDefined();
    unmount();
    expect(frame).toBeUndefined();
    expect(disconnect).toHaveBeenCalled();
  } finally {
    rs.unstubAllGlobals();
  }
});

test('semantic classNames merge onto parts', () => {
  render(
    <Textarea
      className="rootExtra"
      classNames={{ root: 'r', textarea: 't' }}
    />,
  );
  const el = screen.getByRole('textbox');
  expect(el.className).toContain('t');
  const wrapper = el.closest('[data-tao-textarea]') as HTMLElement;
  expect(wrapper.className).toContain('r');
  expect(wrapper.className).toContain('rootExtra');
});

test('nested textarea defaults have zero specificity', () => {
  const css = readFileSync(
    resolve(process.cwd(), 'src/components/textarea/textarea.css'),
    'utf8',
  ).replace(/\/\*[\s\S]*?\*\//g, '');
  const nestedSelectors = Array.from(css.matchAll(/([^{}]+)\{/g), (match) =>
    match[1].trim(),
  ).filter((selector) => selector.includes(' textarea'));

  expect(css).toContain('@layer components');
  expect(nestedSelectors.length).toBeGreaterThan(0);
  expect(
    nestedSelectors.every((selector) => selector.startsWith(':where(')),
  ).toBe(true);
});
