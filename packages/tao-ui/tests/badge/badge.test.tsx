import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Badge, type RibbonRef } from '../../src/components/badge/badge';

test('clips numeric counts but keeps the actual count in the native title', () => {
  const ref = createRef<HTMLSpanElement>();
  render(
    <Badge ref={ref} count={100}>
      <span>Inbox</span>
    </Badge>,
  );
  expect(screen.getByText('99+').getAttribute('title')).toBe('100');
  expect(ref.current).toContainElement(screen.getByText('Inbox'));
});
test('zero is hidden unless requested, including dot mode', () => {
  const { rerender, container } = render(<Badge count={0} dot />);
  expect(container.querySelector('[data-tao-badge-indicator]')).toBeNull();
  rerender(<Badge count={0} showZero dot />);
  expect(screen.getByText('0')).toBeTruthy();
  rerender(<Badge dot />);
  expect(container.querySelector('[data-tao-dot]')).toBeTruthy();
});
test('title false/null removes tooltips and ReactNode counts render without stringification', () => {
  const { rerender } = render(<Badge count={7} title={false} />);
  expect(screen.getByText('7').hasAttribute('title')).toBe(false);
  rerender(<Badge count={<span>New</span>} title={null} />);
  expect(screen.getByText('New')).toBeTruthy();
});
test('status text and colors work without a wrapped child', () => {
  const { container } = render(
    <Badge
      status="success"
      text="Ready"
      color="purple"
      style={{ margin: 4 }}
    />,
  );
  expect(screen.getByText('Ready')).toBeTruthy();
  expect(
    container.querySelector<HTMLElement>('[data-tao-badge]')?.style.margin,
  ).toBe('4px');
  expect(
    container.querySelector<HTMLElement>('[data-tao-badge-indicator]')?.style
      .background,
  ).toBe('purple');
});
test('offset and legacy style target the indicator, semantic root remains separate', () => {
  render(
    <Badge
      count={3}
      offset={[8, 5]}
      style={{ color: 'black' }}
      styles={{ root: { opacity: 0.5 } }}
      classNames={({ props }) => ({ indicator: `size-${props.size}` })}
    >
      <span>Inbox</span>
    </Badge>,
  );
  expect(screen.getByText('3').style.insetInlineEnd).toBe('-8px');
  expect(screen.getByText('3').style.marginTop).toBe('5px');
  expect(screen.getByText('3').style.color).toBe('black');
  expect(screen.getByText('3').className).toContain('size-medium');
  expect(screen.getByText('Inbox').parentElement?.style.opacity).toBe('0.5');
});
test('Ribbon ref points to its wrapper and styles target semantic parts', () => {
  const ref = createRef<RibbonRef>();
  render(
    <Badge.Ribbon
      ref={ref}
      text="Featured"
      placement="start"
      color="purple"
      style={{ color: 'white' }}
      styles={{ root: { padding: 8 } }}
      classNames={{ content: 'label' }}
    >
      <div>Project</div>
    </Badge.Ribbon>,
  );
  expect(ref.current?.nativeElement).toContainElement(
    screen.getByText('Project'),
  );
  expect(ref.current?.nativeElement.style.padding).toBe('8px');
  expect(ref.current?.nativeElement.dataset.taoPlacement).toBe('start');
  expect(screen.getByText('Featured').className).toBe('label');
  expect(screen.getByText('Featured').parentElement?.style.background).toBe(
    'purple',
  );
  expect(screen.getByText('Featured').parentElement?.style.color).toBe('white');
});
