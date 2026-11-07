import { expect, rstest, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRef } from 'react';
import { createPortal } from 'react-dom';
import { Segmented } from '../../src/components/segmented/segmented';
import { TaoProvider } from '../../src/provider/tao-provider';

test('a radio rendered through an option portal keeps its own keyboard navigation', () => {
  const onChange = rstest.fn();
  render(
    <Segmented
      options={[
        {
          value: 'a',
          label: (
            <>
              Alpha
              {createPortal(
                <input type="radio" aria-label="External radio" />,
                document.body,
              )}
            </>
          ),
        },
        'b',
      ]}
      onChange={onChange}
    />,
  );
  const external = screen.getByRole('radio', { name: 'External radio' });
  expect(fireEvent.keyDown(external, { key: 'ArrowLeft' })).toBe(true);
  expect(screen.getByRole('radio', { name: 'Alpha' })).toBeChecked();
  expect(onChange).not.toHaveBeenCalled();
});

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

test('initially empty options select the first choice when data arrives', () => {
  const onChange = rstest.fn();
  const { rerender } = render(<Segmented options={[]} onChange={onChange} />);
  rerender(<Segmented options={['A', 'B']} onChange={onChange} />);
  expect(screen.getByRole('radio', { name: 'A' })).toBeChecked();
  rerender(<Segmented options={['B', 'A']} onChange={onChange} />);
  expect(screen.getByRole('radio', { name: 'A' })).toBeChecked();
  expect(onChange).not.toHaveBeenCalled();
});

test('uncontrolled Segmented falls back to an enabled option after its value disappears', () => {
  const onChange = rstest.fn();
  const view = render(<Segmented options={['A', 'B']} onChange={onChange} />);
  view.rerender(
    <Segmented
      options={[{ value: 'C', label: 'C', disabled: true }, 'B']}
      onChange={onChange}
    />,
  );
  expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
  expect(onChange).not.toHaveBeenCalled();
});

test('resetting a native form restores the uncontrolled segment', async () => {
  const onChange = rstest.fn();
  const { container } = render(
    <form>
      <Segmented name="period" options={['Day', 'Week']} onChange={onChange} />
    </form>,
  );
  const form = container.querySelector('form')!;
  fireEvent.click(screen.getByRole('radio', { name: 'Week' }));
  expect(new FormData(form).get('period')).toBe('Week');
  await act(async () => form.reset());
  expect(screen.getByRole('radio', { name: 'Day' })).toBeChecked();
  expect(new FormData(form).get('period')).toBe('Day');
  expect(onChange).toHaveBeenCalledExactlyOnceWith('Week');
  fireEvent.click(screen.getByRole('radio', { name: 'Week' }));
  expect(onChange).toHaveBeenCalledTimes(2);
});

test('native reset preserves the selected segment when the new default matches it', async () => {
  const options = ['First', 'Second'];
  const form = (defaultValue: string) => (
    <form aria-label="Period">
      <Segmented name="period" options={options} defaultValue={defaultValue} />
      <button type="reset">Reset</button>
    </form>
  );
  const user = userEvent.setup();
  const view = render(form('First'));
  const second = screen.getByRole('radio', { name: 'Second' });
  await user.click(second);
  view.rerender(form('Second'));
  await user.click(screen.getByRole('button', { name: 'Reset' }));
  expect(second).toBeChecked();
  expect(
    new FormData(
      screen.getByRole('form', { name: 'Period' }) as HTMLFormElement,
    ).get('period'),
  ).toBe('Second');
});

test('native form reset leaves a controlled segment on its current value', () => {
  const tree = (value: string) => (
    <form>
      <Segmented options={['Day', 'Week']} value={value} />
    </form>
  );
  const { container, rerender } = render(tree('Day'));
  rerender(tree('Week'));
  act(() => container.querySelector('form')!.reset());
  expect(screen.getByRole('radio', { name: 'Week' })).toBeChecked();
});

test('an explicitly empty segment label still names an icon-only radio', () => {
  render(
    <Segmented
      options={[
        {
          value: 'list',
          label: null,
          icon: <span aria-hidden="true">≡</span>,
        },
      ]}
    />,
  );
  expect(screen.getByRole('radio', { name: 'list' })).toBeInTheDocument();
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

test('keyboard changes remeasure the selected item without a React 18 layout update loop', () => {
  const measure = rstest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      const label = this.textContent;
      const x = this.hasAttribute('data-tao-segmented-item')
        ? label === 'A'
          ? 0
          : label === 'B'
            ? 40
            : 80
        : 0;
      return new DOMRect(
        x,
        0,
        this.hasAttribute('data-tao-segmented-item') ? 40 : 120,
        32,
      );
    });
  try {
    render(<Segmented options={['A', 'B', 'C']} defaultValue="B" />);
    screen.getByRole('radio', { name: 'B' }).focus();
    fireEvent.keyDown(screen.getByRole('radio', { name: 'B' }), {
      key: 'ArrowRight',
    });
    expect(screen.getByRole('radio', { name: 'C' })).toBeChecked();
    expect(document.querySelector('[data-tao-segmented-thumb]')).toHaveStyle({
      transform: 'translate(80px, 0px)',
    });
  } finally {
    measure.mockRestore();
  }
});
