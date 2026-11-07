import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { CheckableTag, Tag } from '../../src/components/tag/tag';

test('renders tag with text', () => {
  render(<Tag>Hello</Tag>);
  expect(screen.getByText('Hello')).toBeTruthy();
});

test('a portaled child action does not toggle its CheckableTag', () => {
  const onChange = rstest.fn();
  render(
    <CheckableTag onChange={onChange}>
      Filter
      {createPortal(<button type="button">Clear all</button>, document.body)}
    </CheckableTag>,
  );

  const action = screen.getByRole('button', { name: 'Clear all' });
  fireEvent.click(action);
  expect(fireEvent.keyDown(action, { key: 'Enter' })).toBe(true);
  expect(onChange).not.toHaveBeenCalled();

  fireEvent.keyDown(screen.getByRole('checkbox', { name: 'Filter' }), {
    key: ' ',
  });
  expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
});

test('conditional false icons leave no blank slot in either Tag variant', () => {
  const { container, rerender } = render(<Tag icon={false}>Plain</Tag>);
  expect(container.querySelector('[data-tao-tag-icon]')).toBeNull();
  rerender(<CheckableTag icon={false}>Toggle</CheckableTag>);
  expect(container.querySelector('[data-tao-tag-icon]')).toBeNull();
  rerender(<Tag icon={0}>Counted</Tag>);
  expect(container.querySelector('[data-tao-tag-icon]')).toHaveTextContent('0');
});

test('renders with icon', () => {
  render(<Tag icon={<span data-testid="ico">★</span>}>Star</Tag>);
  expect(screen.getByTestId('ico')).toBeTruthy();
});

test('preset colors set data attribute', () => {
  const { container } = render(<Tag color="success">OK</Tag>);
  const tag = container.querySelector('[data-tao-tag]') as HTMLElement;
  expect(tag.dataset.taoColor).toBe('success');
});

test('variant sets data attribute', () => {
  const { container } = render(<Tag variant="solid">Solid</Tag>);
  const tag = container.querySelector('[data-tao-tag]') as HTMLElement;
  expect(tag.dataset.taoVariant).toBe('solid');
});

test('custom color applies inline style', () => {
  const { container } = render(<Tag color="#ff6600">Custom</Tag>);
  const tag = container.querySelector('[data-tao-tag]') as HTMLElement;
  expect(tag.style.color).toBe('#ff6600');
});

test('close icon renders when onClose provided', () => {
  let closed = false;
  render(
    <Tag
      onClose={() => {
        closed = true;
      }}
    >
      Closable
    </Tag>,
  );
  const closeBtn = screen.getByLabelText('Close');
  expect(closeBtn).toBeTruthy();
  fireEvent.click(closeBtn);
  expect(closed).toBe(true);
});

test('closeIcon={false} hides close button', () => {
  render(
    <Tag closeIcon={false} onClose={() => {}}>
      No Close
    </Tag>,
  );
  expect(screen.queryByLabelText('Close')).toBeNull();
});

test('a zero close icon is inside the close control', () => {
  render(<Tag closeIcon={0}>Counter</Tag>);
  expect(screen.getByRole('button', { name: 'Close' })).toHaveTextContent('0');
});

test('disabled prevents close', () => {
  let closeCount = 0;
  const { container } = render(
    <Tag
      disabled
      onClose={() => {
        closeCount += 1;
      }}
    >
      Disabled
    </Tag>,
  );
  const tag = container.querySelector('[data-tao-tag]') as HTMLElement;
  expect(tag.dataset.taoDisabled).toBeTruthy();
  fireEvent.click(screen.getByLabelText('Close'));
  expect(closeCount).toBe(0);
});

test('classNames applied to root', () => {
  const { container } = render(
    <Tag classNames={{ root: 'my-tag' }}>Styled</Tag>,
  );
  const tag = container.querySelector('[data-tao-tag]') as HTMLElement;
  expect(tag.className).toContain('my-tag');
});

// CheckableTag

test('CheckableTag renders', () => {
  render(<CheckableTag>Check</CheckableTag>);
  expect(screen.getByText('Check')).toBeTruthy();
});

test('CheckableTag checked state', () => {
  const { container } = render(<CheckableTag checked>Active</CheckableTag>);
  const tag = container.querySelector('[data-tao-tag]') as HTMLElement;
  expect(tag.dataset.taoChecked).toBeTruthy();
});

test('CheckableTag onChange fires', () => {
  let val = false;
  render(
    <CheckableTag
      onChange={(c) => {
        val = c;
      }}
    >
      Toggle
    </CheckableTag>,
  );
  fireEvent.click(screen.getByText('Toggle'));
  expect(val).toBe(true);
});

test('CheckableTag disabled', () => {
  let val = false;
  render(
    <CheckableTag
      disabled
      onChange={(c) => {
        val = c;
      }}
    >
      Nope
    </CheckableTag>,
  );
  fireEvent.click(screen.getByText('Nope'));
  expect(val).toBe(false);
});

test.each(['Enter', ' '])(
  'CheckableTag toggles once when %s is held',
  (key) => {
    const onChange = rstest.fn();
    render(<CheckableTag onChange={onChange}>Choice</CheckableTag>);
    const tag = screen.getByRole('checkbox', { name: 'Choice' });
    fireEvent.keyDown(tag, { key });
    expect(fireEvent.keyDown(tag, { key, repeat: true })).toBe(false);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
  },
);
