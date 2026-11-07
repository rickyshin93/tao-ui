import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Divider, type DividerRef } from '../../src/components/divider/divider';
import { TaoProvider } from '../../src/provider/tao-provider';

test('fractional numeric margin strings resolve to pixels', () => {
  const { container } = render(
    <Divider titlePlacement="start" orientationMargin="12.5">
      Title
    </Divider>,
  );
  expect(container.querySelector('[data-tao-divider-content]')).toHaveStyle({
    marginInlineStart: '12.5px',
  });
});

test('renders a titled separator and exposes its native element', () => {
  const ref = createRef<DividerRef>();
  render(
    <Divider ref={ref} titlePlacement="start">
      Details
    </Divider>,
  );
  expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe(
    'horizontal',
  );
  expect(screen.getByText('Details')).toBeTruthy();
  expect(ref.current?.nativeElement).toBe(screen.getByRole('separator'));
});
test('orientation overrides vertical and legacy type; vertical omits title', () => {
  const { rerender } = render(
    <Divider type="vertical" vertical={false}>
      Title
    </Divider>,
  );
  expect(screen.getByText('Title')).toBeTruthy();
  rerender(
    <Divider orientation="vertical" vertical={false}>
      Title
    </Divider>,
  );
  expect(screen.queryByText('Title')).toBeNull();
  expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe(
    'vertical',
  );
});
test('resolves semantic callbacks with inherited props and numeric-string margin', () => {
  render(
    <TaoProvider size="small">
      <Divider
        titlePlacement="start"
        orientationMargin="12"
        classNames={({ props }) => ({
          root: `size-${props.size}`,
          rail: 'rule',
          content: 'label',
        })}
        styles={{ content: { color: 'red' } }}
      >
        Title
      </Divider>
    </TaoProvider>,
  );
  expect(screen.getByRole('separator').className).toContain('size-small');
  expect(screen.getByText('Title').style.marginInlineStart).toBe('12px');
  expect(screen.getByText('Title').style.color).toBe('red');
});
test('applies rail customizations to an untitled divider and renders zero titles', () => {
  const { rerender } = render(
    <Divider
      dashed
      variant="dotted"
      classNames={{ rail: 'rail' }}
      styles={{ rail: { opacity: 0.5 } }}
    />,
  );
  expect(screen.getByRole('separator').className).toContain('rail');
  expect(screen.getByRole('separator').style.opacity).toBe('0.5');
  expect(screen.getByRole('separator').dataset.taoVariant).toBe('dashed');
  rerender(<Divider>{0}</Divider>);
  expect(screen.getByText('0')).toBeTruthy();
});
