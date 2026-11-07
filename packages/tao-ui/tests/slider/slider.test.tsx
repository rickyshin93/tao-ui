import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Slider, type SliderRef } from '../../src/components/slider/slider';
import { TaoProvider } from '../../src/provider/tao-provider';

test('single slider honors steps, bounds and complete callback', () => {
  const change = rs.fn();
  const complete = rs.fn();
  render(
    <Slider
      min={10}
      max={30}
      step={5}
      defaultValue={15}
      onChange={change}
      onChangeComplete={complete}
      ariaLabelForHandle="Volume"
      tooltip={{ open: false }}
    />,
  );
  const handle = screen.getByRole('slider', { name: 'Volume' });
  fireEvent.keyDown(handle, { key: 'ArrowRight', keyCode: 39 });
  expect(change).toHaveBeenLastCalledWith(20);
  expect(handle.getAttribute('aria-valuenow')).toBe('20');
  fireEvent.keyUp(handle, { key: 'ArrowRight', keyCode: 39 });
  expect(complete).toHaveBeenLastCalledWith(20);
  fireEvent.keyDown(handle, { key: 'End', keyCode: 35 });
  expect(handle.getAttribute('aria-valuenow')).toBe('30');
  fireEvent.keyDown(handle, { key: 'Home', keyCode: 36 });
  expect(handle.getAttribute('aria-valuenow')).toBe('10');
});
test('a Slider range change callback cannot mutate the rendered handles', () => {
  render(
    <Slider
      range
      defaultValue={[20, 80]}
      tooltip={{ open: false }}
      onChange={(values) => {
        values.pop();
      }}
    />,
  );
  fireEvent.keyDown(screen.getAllByRole('slider')[0]!, {
    key: 'ArrowRight',
    keyCode: 39,
  });
  expect(
    screen
      .getAllByRole('slider')
      .map((node) => node.getAttribute('aria-valuenow')),
  ).toEqual(['21', '80']);
});

test('changing a Slider before-change payload does not invent a change at the bound', () => {
  const onChange = rs.fn();
  render(
    <Slider
      range
      defaultValue={[0, 80]}
      tooltip={{ open: false }}
      onChange={onChange}
      onBeforeChange={(values) => {
        if (Array.isArray(values)) values.pop();
      }}
    />,
  );
  fireEvent.keyDown(screen.getAllByRole('slider')[0]!, {
    key: 'ArrowLeft',
    keyCode: 37,
  });
  expect(onChange).not.toHaveBeenCalled();
});

test('a Slider after-change callback cannot mutate the completion payload', () => {
  const onChangeComplete = rs.fn();
  render(
    <Slider
      range
      defaultValue={[20, 80]}
      tooltip={{ open: false }}
      onChangeComplete={onChangeComplete}
      onAfterChange={(values) => {
        values.pop();
      }}
    />,
  );
  const first = screen.getAllByRole('slider')[0]!;
  fireEvent.keyDown(first, { key: 'ArrowRight', keyCode: 39 });
  fireEvent.keyUp(first, { key: 'ArrowRight', keyCode: 39 });
  expect(onChangeComplete).toHaveBeenCalledExactlyOnceWith([21, 80]);
});

test('mutating a Slider completion payload does not affect the next movement', () => {
  const onChange = rs.fn();
  render(
    <Slider
      range
      defaultValue={[20, 80]}
      tooltip={{ open: false }}
      onChange={onChange}
      onChangeComplete={(values) => {
        values.pop();
      }}
    />,
  );
  const first = screen.getAllByRole('slider')[0]!;
  fireEvent.keyDown(first, { key: 'ArrowRight', keyCode: 39 });
  fireEvent.keyUp(first, { key: 'ArrowRight', keyCode: 39 });
  fireEvent.keyDown(first, { key: 'ArrowRight', keyCode: 39 });
  expect(onChange).toHaveBeenLastCalledWith([22, 80]);
});

test('controlled range values, disabled individual handles and accessible labels', () => {
  const change = rs.fn();
  render(
    <Slider
      range
      value={[20, 60]}
      disabled={[true, false]}
      onChange={change}
      ariaLabelForHandle={['Minimum', 'Maximum']}
      tooltip={{ open: false }}
    />,
  );
  fireEvent.keyDown(screen.getByRole('slider', { name: 'Minimum' }), {
    keyCode: 39,
  });
  expect(change).not.toHaveBeenCalled();
  fireEvent.keyDown(screen.getByRole('slider', { name: 'Maximum' }), {
    keyCode: 39,
  });
  expect(change).toHaveBeenCalledWith([20, 61]);
  expect(
    screen
      .getByRole('slider', { name: 'Maximum' })
      .getAttribute('aria-valuenow'),
  ).toBe('60');
});
test('step=null navigates marks and mark clicks update values', () => {
  const change = rs.fn();
  render(
    <Slider
      step={null}
      defaultValue={10}
      marks={{
        10: 'Low',
        40: 'Medium',
        90: { label: 'High', style: { color: 'red' } },
      }}
      onChange={change}
      tooltip={{ open: false }}
    />,
  );
  fireEvent.keyDown(screen.getByRole('slider'), { keyCode: 39 });
  expect(change).toHaveBeenLastCalledWith(40);
  fireEvent.mouseDown(screen.getByText('High'));
  fireEvent.click(screen.getByText('High'));
  expect(change).toHaveBeenLastCalledWith(90);
});
test('editable range deletes handles while preserving minimum count', () => {
  const change = rs.fn();
  render(
    <Slider
      range={{ editable: true, minCount: 2 }}
      defaultValue={[10, 30, 70]}
      onChange={change}
      tooltip={{ open: false }}
    />,
  );
  fireEvent.keyDown(screen.getAllByRole('slider')[1]!, { keyCode: 46 });
  expect(change).toHaveBeenLastCalledWith([10, 70]);
  expect(screen.getAllByRole('slider').length).toBe(2);
  fireEvent.keyDown(screen.getAllByRole('slider')[1]!, { keyCode: 46 });
  expect(screen.getAllByRole('slider').length).toBe(2);
});
test('deleting a range handle with the keyboard completes the change once', () => {
  const change = rs.fn();
  const complete = rs.fn();
  render(
    <Slider
      range={{ editable: true, minCount: 2 }}
      defaultValue={[10, 30, 70]}
      onChange={change}
      onChangeComplete={complete}
      tooltip={{ open: false }}
    />,
  );
  fireEvent.keyDown(screen.getAllByRole('slider')[1]!, {
    key: 'Delete',
    keyCode: 46,
  });
  expect(change).toHaveBeenCalledExactlyOnceWith([10, 70]);
  expect(complete).toHaveBeenCalledExactlyOnceWith([10, 70]);
  fireEvent.keyDown(screen.getAllByRole('slider')[1]!, {
    key: 'Delete',
    keyCode: 46,
  });
  expect(complete).toHaveBeenCalledTimes(1);
});

test('provider disabled and keyboard=false prevent changes', () => {
  const change = rs.fn();
  const { rerender } = render(
    <TaoProvider disabled>
      <Slider onChange={change} />
    </TaoProvider>,
  );
  fireEvent.keyDown(screen.getByRole('slider'), { keyCode: 39 });
  expect(change).not.toHaveBeenCalled();
  rerender(<Slider keyboard={false} onChange={change} />);
  fireEvent.keyDown(screen.getByRole('slider'), { keyCode: 39 });
  expect(change).not.toHaveBeenCalled();
});

test.each([
  { scenario: 'disabled', props: { disabled: true } },
  { scenario: 'keyboard off', props: { keyboard: false } },
  {
    scenario: 'disabled range handle',
    props: { range: true as const, disabled: [true, false] },
  },
])(
  'a handle with $scenario does not complete an ignored key press',
  ({ props }) => {
    const onChangeComplete = rs.fn();
    render(<Slider {...props} onChangeComplete={onChangeComplete} />);
    const handle = screen.getAllByRole('slider')[0];
    fireEvent.keyDown(handle, { keyCode: 39 });
    fireEvent.keyUp(handle, { keyCode: 39 });
    expect(onChangeComplete).not.toHaveBeenCalled();
  },
);
test('orientation, RTL, ref and semantic callbacks retain real handles', () => {
  const ref = createRef<SliderRef>();
  const change = rs.fn();
  const { container, rerender } = render(
    <Slider
      ref={ref}
      defaultValue={20}
      orientation="vertical"
      tooltip={{ open: false }}
      classNames={({ props }) => ({
        root: props.vertical ? 'vertical-slider' : 'horizontal-slider',
        handle: 'knob',
      })}
      styles={{ handle: { borderColor: 'red' } }}
    />,
  );
  expect(screen.getByRole('slider').getAttribute('aria-orientation')).toBe(
    'vertical',
  );
  expect(container.querySelector('.vertical-slider')).toBeTruthy();
  ref.current?.focus();
  expect(document.activeElement).toBe(screen.getByRole('slider'));
  ref.current?.blur();
  expect(document.activeElement).not.toBe(screen.getByRole('slider'));
  rerender(
    <Slider
      value={20}
      direction="rtl"
      onChange={change}
      tooltip={{ open: false }}
    />,
  );
  fireEvent.keyDown(screen.getByRole('slider'), { keyCode: 39 });
  expect(change).toHaveBeenCalledWith(19);
});
test('a false Slider tooltip formatter result suppresses the empty popup', () => {
  render(
    <Slider value={35} tooltip={{ open: true, formatter: () => false }} />,
  );
  expect(screen.queryByRole('tooltip')).toBeNull();
});

test('tooltip formatter supports controlled visibility, null suppression and custom container', async () => {
  const portal = document.createElement('div');
  document.body.append(portal);
  const { rerender, unmount } = render(
    <Slider
      value={35}
      tooltip={{
        open: true,
        formatter: (value) => `${value} percent`,
        getPopupContainer: () => portal,
      }}
    />,
  );
  expect(await screen.findByRole('tooltip')).toBeTruthy();
  expect(portal.textContent).toContain('35 percent');
  rerender(<Slider value={35} tooltip={{ open: true, formatter: null }} />);
  expect(screen.queryByRole('tooltip')).toBeNull();
  unmount();
  portal.remove();
});
