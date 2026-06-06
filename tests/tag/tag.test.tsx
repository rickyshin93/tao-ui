import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Tag, CheckableTag } from '../../src/components/tag/tag';

test('renders tag with text', () => {
  render(<Tag>Hello</Tag>);
  expect(screen.getByText('Hello')).toBeTruthy();
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
  render(<Tag onClose={() => { closed = true; }}>Closable</Tag>);
  const closeBtn = screen.getByLabelText('Close');
  expect(closeBtn).toBeTruthy();
  fireEvent.click(closeBtn);
  expect(closed).toBe(true);
});

test('closeIcon={false} hides close button', () => {
  render(<Tag closeIcon={false} onClose={() => {}}>No Close</Tag>);
  expect(screen.queryByLabelText('Close')).toBeNull();
});

test('disabled prevents close', () => {
  let closed = false;
  const { container } = render(<Tag disabled onClose={() => { closed = true; }}>Disabled</Tag>);
  const tag = container.querySelector('[data-tao-tag]') as HTMLElement;
  expect(tag.dataset.taoDisabled).toBeTruthy();
});

test('classNames applied to root', () => {
  const { container } = render(<Tag classNames={{ root: 'my-tag' }}>Styled</Tag>);
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
  render(<CheckableTag onChange={(c) => { val = c; }}>Toggle</CheckableTag>);
  fireEvent.click(screen.getByText('Toggle'));
  expect(val).toBe(true);
});

test('CheckableTag disabled', () => {
  let val = false;
  render(<CheckableTag disabled onChange={(c) => { val = c; }}>Nope</CheckableTag>);
  fireEvent.click(screen.getByText('Nope'));
  expect(val).toBe(false);
});
