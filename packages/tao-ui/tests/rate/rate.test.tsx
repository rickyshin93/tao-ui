import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Rate, type RateRef } from '../../src/components/rate/rate';
import { TaoProvider } from '../../src/provider/tao-provider';

test('the upstream middle size alias resolves to the native medium size', () => {
  const { container } = render(<Rate size="middle" />);
  expect(
    container.querySelector('[data-tao-rate]')?.getAttribute('data-tao-size'),
  ).toBe('medium');
});

test('uncontrolled rating updates, clears and respects allowClear', () => {
  const change = rs.fn();
  const { rerender } = render(<Rate defaultValue={2} onChange={change} />);
  fireEvent.click(screen.getAllByRole('radio')[2]!);
  expect(change).toHaveBeenLastCalledWith(3);
  expect(screen.getAllByRole('radio')[2]?.getAttribute('aria-checked')).toBe(
    'true',
  );
  fireEvent.click(screen.getAllByRole('radio')[2]!);
  expect(change).toHaveBeenLastCalledWith(0);
  rerender(<Rate value={3} allowClear={false} onChange={change} />);
  fireEvent.click(screen.getAllByRole('radio')[2]!);
  expect(change).toHaveBeenLastCalledWith(3);
});
test('controlled value remains authoritative and custom characters receive star props', () => {
  const change = rs.fn();
  render(
    <Rate
      value={1}
      count={3}
      character={({ index }) => String((index ?? 0) + 1)}
      onChange={change}
    />,
  );
  fireEvent.click(screen.getAllByRole('radio')[2]!);
  expect(change).toHaveBeenCalledWith(3);
  expect(screen.getAllByRole('radio')[2]?.getAttribute('aria-checked')).toBe(
    'false',
  );
});
test('keyboard supports half steps and reverse direction', () => {
  const change = rs.fn();
  const { rerender } = render(
    <Rate value={2} allowHalf onChange={change} aria-label="Rating" />,
  );
  fireEvent.keyDown(screen.getByRole('radiogroup'), {
    key: 'ArrowRight',
    keyCode: 39,
  });
  expect(change).toHaveBeenLastCalledWith(2.5);
  rerender(<Rate value={2} direction="rtl" onChange={change} />);
  fireEvent.keyDown(screen.getByRole('radiogroup'), {
    key: 'ArrowRight',
    keyCode: 39,
  });
  expect(change).toHaveBeenLastCalledWith(1);
});
test('disabled, readOnly and keyboard=false prevent respective interactions', () => {
  const change = rs.fn();
  const { rerender } = render(
    <TaoProvider disabled>
      <Rate onChange={change} />
    </TaoProvider>,
  );
  fireEvent.click(screen.getAllByRole('radio')[1]!);
  expect(change).not.toHaveBeenCalled();
  rerender(<Rate readOnly onChange={change} />);
  fireEvent.click(screen.getAllByRole('radio')[1]!);
  expect(change).not.toHaveBeenCalled();
  rerender(<Rate keyboard={false} onChange={change} />);
  fireEvent.keyDown(screen.getByRole('radiogroup'), {
    key: 'ArrowRight',
    keyCode: 39,
  });
  expect(change).not.toHaveBeenCalled();
});
test('hover reports a preview and resets without changing selected value', () => {
  const change = rs.fn();
  const hover = rs.fn();
  render(<Rate defaultValue={1} onChange={change} onHoverChange={hover} />);
  fireEvent.mouseMove(screen.getAllByRole('radio')[3]!);
  expect(hover).toHaveBeenLastCalledWith(4);
  fireEvent.mouseLeave(screen.getByRole('radiogroup'));
  expect(change).not.toHaveBeenCalled();
  expect(screen.getAllByRole('radio')[3]?.getAttribute('aria-checked')).toBe(
    'false',
  );
});
test('ref focuses and blurs the rating and semantic customization survives tooltips', () => {
  const ref = createRef<RateRef>();
  render(
    <Rate
      ref={ref}
      size="small"
      tooltips={['Poor', 'Fair']}
      classNames={{ root: 'rating', item: 'star' }}
      styles={{ item: { color: 'red' } }}
    />,
  );
  ref.current?.focus();
  expect(document.activeElement).toBe(screen.getByRole('radiogroup'));
  ref.current?.blur();
  expect(document.activeElement).not.toBe(screen.getByRole('radiogroup'));
  expect(screen.getByRole('radiogroup').className).toContain('rating');
  expect(screen.getAllByRole('radio')[0]?.closest('li')?.className).toContain(
    'star',
  );
});
