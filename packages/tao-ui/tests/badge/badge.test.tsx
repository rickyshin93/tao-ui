import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Badge, type RibbonRef } from '../../src/components/badge/badge';
import { TaoProvider } from '../../src/provider/tao-provider';

test('an empty count leaves no blank pill and still permits a status dot', () => {
  const { container, rerender } = render(<Badge count="" />);
  expect(container.querySelector('[data-tao-badge-indicator]')).toBeNull();
  rerender(<Badge count="" status="success" />);
  expect(container.querySelector('[data-tao-badge-indicator]')).toHaveAttribute(
    'data-tao-dot',
    'true',
  );
});

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
test('a conditional count preserves the status indicator', () => {
  const { container } = render(<Badge status="success" count={false} />);

  expect(container.querySelector('[data-tao-badge-indicator]')).toBeTruthy();
});

test('a status without a count remains a dot when wrapping content', () => {
  const { container } = render(
    <Badge status="processing">
      <span>Inbox</span>
    </Badge>,
  );

  expect(container.querySelector('[data-tao-badge-indicator]')).toHaveAttribute(
    'data-tao-dot',
    'true',
  );
});

test('a numeric zero child still anchors an overlay badge', () => {
  const ref = createRef<HTMLSpanElement>();
  render(
    <Badge ref={ref} count={3}>
      {0}
    </Badge>,
  );
  expect(ref.current).toHaveAttribute('data-tao-wrapper', 'true');
  expect(ref.current).toHaveTextContent('03');
});

test('a hidden zero count or text does not suppress the other badge content', () => {
  const { rerender } = render(
    <Badge status="success" count={0} text="Ready" />,
  );
  expect(screen.getByText('Ready')).toBeVisible();

  rerender(<Badge count={3} text={0} />);
  expect(screen.getByText('3')).toBeVisible();
  expect(screen.queryByText('0')).toBeNull();
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

test('Badge inherits small from TaoProvider and respects an explicit size', () => {
  render(
    <TaoProvider size="small">
      <Badge count={4} />
      <Badge count={8} size="medium" />
    </TaoProvider>,
  );
  expect(screen.getByText('4')).toHaveAttribute('data-tao-size', 'small');
  expect(screen.getByText('8')).toHaveAttribute('data-tao-size', 'medium');
});

test('string offsets preserve CSS units on both axes', () => {
  render(
    <Badge count={7} offset={['1rem', '2em']}>
      <span>Inbox</span>
    </Badge>,
  );
  const indicator = screen.getByText('7');
  expect(indicator.style.insetInlineEnd).toContain('rem');
  expect(indicator.style.marginTop).toBe('2em');
});
