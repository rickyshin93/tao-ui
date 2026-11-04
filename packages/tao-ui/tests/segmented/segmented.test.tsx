import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Segmented } from '../../src/components/segmented/segmented';
import { TaoProvider } from '../../src/provider/tao-provider';

test('defaults to the first option, preserves numeric values and submits its name', () => {
  const onChange = rstest.fn();
  const { container } = render(
    <form>
      <Segmented name="period" options={[1, 2, 3]} onChange={onChange} />
    </form>,
  );
  expect(screen.getByRole('radio', { name: '1' })).toBeChecked();
  fireEvent.click(screen.getByRole('radio', { name: '2' }));
  expect(onChange).toHaveBeenCalledWith(2);
  expect(new FormData(container.querySelector('form')!).get('period')).toBe(
    '2',
  );
});
test('controlled selection changes only when the owner updates value', () => {
  const onChange = rstest.fn();
  const { rerender } = render(
    <Segmented options={['A', 'B']} value="A" onChange={onChange} />,
  );
  fireEvent.click(screen.getByRole('radio', { name: 'B' }));
  expect(screen.getByRole('radio', { name: 'A' })).toBeChecked();
  expect(onChange).toHaveBeenCalledWith('B');
  rerender(<Segmented options={['A', 'B']} value="B" />);
  expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
});
test('keyboard selection skips disabled options, wraps, and supports Home and End', () => {
  render(
    <Segmented
      options={['A', { value: 'B', label: 'B', disabled: true }, 'C']}
    />,
  );
  fireEvent.keyDown(screen.getByRole('radio', { name: 'A' }), {
    key: 'ArrowRight',
  });
  expect(screen.getByRole('radio', { name: 'C' })).toBeChecked();
  fireEvent.keyDown(screen.getByRole('radio', { name: 'C' }), {
    key: 'ArrowRight',
  });
  expect(screen.getByRole('radio', { name: 'A' })).toBeChecked();
  fireEvent.keyDown(screen.getByRole('radio', { name: 'A' }), { key: 'End' });
  expect(screen.getByRole('radio', { name: 'C' })).toBeChecked();
  fireEvent.keyDown(screen.getByRole('radio', { name: 'C' }), { key: 'Home' });
  expect(screen.getByRole('radio', { name: 'A' })).toBeChecked();
});
test('vertical orientation takes precedence and consumer key cancellation is respected', () => {
  const { rerender } = render(
    <Segmented options={['A', 'B']} vertical={false} orientation="vertical" />,
  );
  fireEvent.keyDown(screen.getByRole('radio', { name: 'A' }), {
    key: 'ArrowDown',
  });
  expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
  rerender(
    <Segmented
      options={['A', 'B']}
      onKeyDown={(event) => event.preventDefault()}
    />,
  );
  fireEvent.keyDown(screen.getByRole('radio', { name: 'B' }), {
    key: 'ArrowLeft',
  });
  expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
});
test('inherits disabled and size, forwards the element and exposes icon semantics', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <TaoProvider disabled size="large">
      <Segmented
        ref={ref}
        options={[{ value: 'list', icon: <span>≡</span> }]}
        styles={{ icon: { color: 'red' } }}
        classNames={({ props }) => ({
          root: props.disabled ? 'disabled-root' : '',
        })}
      />
    </TaoProvider>,
  );
  expect(screen.getByRole('radio', { name: 'list' })).toBeDisabled();
  expect(ref.current).toHaveClass('disabled-root');
  expect(ref.current).toHaveAttribute('data-tao-size', 'large');
  expect(screen.getByText('≡').parentElement).toHaveStyle({ color: 'red' });
});
