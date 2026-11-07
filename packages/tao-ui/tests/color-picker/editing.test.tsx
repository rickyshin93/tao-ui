import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Color } from '../../src/components/color-picker/color';
import { ColorPicker } from '../../src/components/color-picker/color-picker';

test.each(['#123456', '#12345678'])(
  'typing %s preserves the full color',
  async (hex) => {
    let last = '';
    render(
      <ColorPicker
        open
        defaultValue="#1677ff"
        onChange={(color) => {
          last = color.toHexString();
        }}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Hex color' });
    const user = userEvent.setup();
    await user.clear(input);
    await user.type(input, hex);
    expect(input).toHaveValue(hex);
    expect(last).toBe(hex);
  },
);

test('short hex stays editable and commits on blur', () => {
  let last = '';
  render(
    <ColorPicker
      open
      defaultValue="#1677ff"
      onChange={(color) => {
        last = color.toHexString();
      }}
    />,
  );
  const input = screen.getByRole('textbox', { name: 'Hex color' });
  fireEvent.change(input, { target: { value: '#123' } });
  expect(input).toHaveValue('#123');
  expect(last).toBe('');
  fireEvent.blur(input);
  expect(last).toBe('#112233');
});

test('controlled gradient stop completion reports the proposed position', () => {
  const onChange = rstest.fn();
  const onChangeComplete = rstest.fn();
  render(
    <ColorPicker
      open
      mode="gradient"
      value={[
        { color: '#ff0000', percent: 25 },
        { color: '#00ff00', percent: 75 },
      ]}
      onChange={onChange}
      onChangeComplete={onChangeComplete}
    />,
  );
  const handle = screen.getByRole('slider', { name: 'Stop position' });
  const key = { key: 'ArrowRight', keyCode: 39 };
  fireEvent.keyDown(handle, key);
  const proposed = onChange.mock.calls[0][0] as Color;
  expect(proposed.getColors()[0].percent).toBe(26);
  expect(handle).toHaveAttribute('aria-valuenow', '25');
  fireEvent.keyUp(handle, key);
  expect(onChangeComplete).toHaveBeenCalledExactlyOnceWith(proposed);
});

test.each(['#ffffff', '#808080', '#000000'])(
  'controlled %s preserves edited HSB hue',
  (initial) => {
    function Example() {
      const [value, setValue] = useState(() => new Color(initial));
      return (
        <ColorPicker open format="hsb" value={value} onChange={setValue} />
      );
    }
    render(<Example />);
    const hue = screen.getByRole('spinbutton', { name: 'Hue' });
    fireEvent.change(hue, { target: { value: '120' } });
    expect(hue).toHaveValue(120);
  },
);
