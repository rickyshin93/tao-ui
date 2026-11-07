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

test('a smaller count keeps the displayed rating accessible without changing the value', () => {
  const onChange = rs.fn();
  const picker = (count: number) => (
    <Rate count={count} value={5} onChange={onChange} />
  );
  const view = render(picker(5));
  view.rerender(picker(3));
  expect(screen.getByRole('radio', { name: '3 / 3' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  view.rerender(picker(5));
  expect(screen.getByRole('radio', { name: '5 / 5' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  expect(onChange).not.toHaveBeenCalled();
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
test.each([
  [0.2, 'ArrowLeft', 37, 0],
  [4.8, 'ArrowRight', 39, 5],
] as const)(
  'half-step keyboard ratings stay within bounds from %s',
  (value, key, keyCode, expected) => {
    const onChange = rs.fn();
    render(
      <Rate defaultValue={value} count={5} allowHalf onChange={onChange} />,
    );

    fireEvent.keyDown(screen.getByRole('radiogroup'), { key, keyCode });

    expect(onChange).toHaveBeenCalledExactlyOnceWith(expected);
  },
);

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

test('ratings expose only the committed score as checked, including half stars', () => {
  render(<Rate defaultValue={2.5} allowHalf count={4} />);
  const radios = screen.getAllByRole('radio');
  expect(radios.map((radio) => radio.getAttribute('aria-checked'))).toEqual([
    'false',
    'false',
    'true',
    'false',
  ]);
  expect(radios[2]).toHaveAccessibleName('2.5 / 4');
  fireEvent.mouseMove(radios[3]!);
  expect(radios[2]).toHaveAttribute('aria-checked', 'true');
  expect(radios[3]).toHaveAttribute('aria-checked', 'false');
});

test('explicitly empty controlled ratings ignore the default and pending edits', () => {
  const onChange = rs.fn();
  render(<Rate defaultValue={2} value={undefined} onChange={onChange} />);
  expect(screen.queryByRole('radio', { checked: true })).toBeNull();
  fireEvent.click(screen.getAllByRole('radio')[2]!);
  expect(onChange).toHaveBeenCalledExactlyOnceWith(3);
  expect(screen.queryByRole('radio', { checked: true })).toBeNull();
});

test('keyboard=false also prevents Enter activation from a focused star', () => {
  const onChange = rs.fn();
  render(<Rate keyboard={false} onChange={onChange} />);
  const star = screen.getAllByRole('radio')[2]!;
  star.focus();
  fireEvent.keyDown(star, { key: 'Enter', keyCode: 13 });
  expect(onChange).not.toHaveBeenCalled();
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
