import { expect, test } from '@rstest/core';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Color } from '../../src/components/color-picker/color';
import { ColorPicker } from '../../src/components/color-picker/color-picker';
import { TaoProvider } from '../../src/provider/tao-provider';

test('color values convert between RGB/HSB/hex, clone and compare gradients', () => {
  const color = new Color('#ff000080');
  expect(color.toHex()).toBe('ff000080');
  expect(color.toRgb().r).toBe(255);
  expect(color.toHsb().h).toBe(0);
  const gradient = new Color([
    { color: '#000', percent: 0 },
    { color: '#fff', percent: 100 },
  ]);
  expect(gradient.isGradient()).toBe(true);
  expect(gradient.toCssString()).toBe(
    'linear-gradient(90deg, rgb(0,0,0) 0%, rgb(255,255,255) 100%)',
  );
  expect(new Color(gradient).equals(gradient)).toBe(true);
  expect(new Color(null).cleared).toBe(true);
});
test('hex edits emit color objects and completion while controlled values remain owned by the parent', async () => {
  const values: string[] = [],
    completed: string[] = [];
  const { rerender } = render(
    <ColorPicker
      value="#1677ff"
      open
      showText
      onChange={(value) => values.push(value.toHexString())}
      onChangeComplete={(value) => completed.push(value.toHexString())}
    />,
  );
  const input = await screen.findByRole('textbox', { name: 'Hex color' });
  fireEvent.change(input, { target: { value: '#ff0000' } });
  expect(values).toEqual(['#ff0000']);
  expect(completed).toEqual(['#ff0000']);
  expect(
    screen.getByRole('button', { name: 'Choose color #1677ff' }),
  ).toBeTruthy();
  rerender(<ColorPicker value="#ff0000" open showText />);
  expect(
    screen.getByRole('button', { name: 'Choose color #ff0000' }),
  ).toBeTruthy();
});
test('presets, format switching and clear preserve their public callback payloads', async () => {
  const values: Color[] = [],
    formats: (string | undefined)[] = [];
  let clears = 0;
  render(
    <ColorPicker
      open
      defaultValue="#ff0000"
      allowClear
      presets={[{ label: 'Brand', colors: ['#00ff00'], defaultOpen: true }]}
      onFormatChange={(format) => formats.push(format)}
      onChange={(value) => values.push(value)}
      onClear={() => {
        clears += 1;
      }}
    />,
  );
  fireEvent.click(
    await screen.findByRole('button', { name: 'Preset #00ff00' }),
  );
  expect(values.at(-1)?.toHexString()).toBe('#00ff00');
  fireEvent.change(screen.getByRole('combobox', { name: 'Color format' }), {
    target: { value: 'rgb' },
  });
  expect(formats).toEqual(['rgb']);
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Red' }), {
    target: { value: '128' },
  });
  expect(values.at(-1)?.toRgb().r).toBe(128);
  fireEvent.click(screen.getByRole('button', { name: 'Clear color' }));
  expect(values.at(-1)?.cleared).toBe(true);
  expect(clears).toBe(1);
});
test('gradient mode edits stops and disabledAlpha emits opaque colors', async () => {
  const values: Color[] = [];
  render(
    <ColorPicker
      open
      mode={['single', 'gradient']}
      defaultValue="#12345680"
      disabledAlpha
      onChange={(value) => values.push(value)}
    />,
  );
  fireEvent.change(
    await screen.findByRole('combobox', { name: 'Color mode' }),
    { target: { value: 'gradient' } },
  );
  expect(values.at(-1)?.isGradient()).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Add color stop' }));
  expect(values.at(-1)?.getColors()).toHaveLength(3);
  expect(
    values
      .at(-1)
      ?.getColors()
      .map((stop) => stop.percent),
  ).toEqual([0, 50, 100]);
  fireEvent.change(screen.getByRole('slider', { name: 'Stop position' }), {
    target: { value: '75' },
  });
  expect(
    values
      .at(-1)
      ?.getColors()
      .map((stop) => stop.percent),
  ).toEqual([0, 75, 100]);
  fireEvent.change(screen.getByRole('textbox', { name: 'Hex color' }), {
    target: { value: '#abcdef80' },
  });
  expect(
    values
      .at(-1)
      ?.getColors()
      .every((stop) => stop.color.toRgb().a === 1),
  ).toBe(true);
  expect(screen.queryByRole('spinbutton', { name: 'Alpha' })).toBeNull();
});
test('controlled color changes synchronize the editor mode and preserve gradient stops', async () => {
  const values: Color[] = [];
  const { rerender } = render(
    <ColorPicker open value="#1677ff" mode={['single', 'gradient']} />,
  );
  expect(
    await screen.findByRole('combobox', { name: 'Color mode' }),
  ).toHaveValue('single');
  rerender(
    <ColorPicker
      open
      value={[
        { color: '#ff0000', percent: 0 },
        { color: '#0000ff', percent: 100 },
      ]}
      mode={['single', 'gradient']}
      onChange={(value) => values.push(value)}
    />,
  );
  expect(screen.getByRole('combobox', { name: 'Color mode' })).toHaveValue(
    'gradient',
  );
  expect(screen.getByRole('button', { name: 'Add color stop' })).toBeTruthy();
  fireEvent.change(screen.getByRole('textbox', { name: 'Hex color' }), {
    target: { value: '#00ff00' },
  });
  expect(values.at(-1)?.isGradient()).toBe(true);
  expect(values.at(-1)?.getColors()).toHaveLength(2);
  expect(values.at(-1)?.getColors()[1].color.toHexString()).toBe('#0000ff');
  rerender(<ColorPicker open value="#123456" mode={['single', 'gradient']} />);
  expect(screen.getByRole('combobox', { name: 'Color mode' })).toHaveValue(
    'single',
  );
  expect(screen.queryByRole('button', { name: 'Add color stop' })).toBeNull();
});
test('changing the allowed modes selects an available editor', async () => {
  const { rerender } = render(
    <ColorPicker open defaultValue="#1677ff" mode={['single', 'gradient']} />,
  );
  await screen.findByRole('combobox', { name: 'Color mode' });
  rerender(<ColorPicker open defaultValue="#1677ff" mode={['gradient']} />);
  expect(screen.getByRole('button', { name: 'Add color stop' })).toBeTruthy();
  rerender(<ColorPicker open defaultValue="#1677ff" mode={[]} />);
  expect(screen.queryByRole('button', { name: 'Add color stop' })).toBeNull();
});
test('custom panel components render with semantic styles inside the requested container', async () => {
  const portal = document.createElement('div');
  document.body.append(portal);
  const { unmount } = render(
    <ColorPicker
      open
      getPopupContainer={() => portal}
      panelRender={(_, { components: { Picker } }) => (
        <section>
          <strong>Custom palette</strong>
          <Picker />
        </section>
      )}
      styles={{ popup: { container: { padding: 9 } } }}
      classNames={{ popup: { container: 'custom-panel' } }}
    />,
  );
  expect(await within(portal).findByText('Custom palette')).toBeTruthy();
  expect(portal.querySelector('.custom-panel')).toHaveStyle({ padding: '9px' });
  unmount();
  portal.remove();
});
test('provider disabled state prevents opening and invalid hex input never emits a value', async () => {
  const { rerender } = render(
    <TaoProvider disabled>
      <ColorPicker open defaultValue="#123456" />
    </TaoProvider>,
  );
  expect(
    screen.getByRole('button', { name: 'Choose color #123456' }),
  ).toBeDisabled();
  expect(screen.queryByRole('dialog')).toBeNull();
  let changes = 0;
  rerender(
    <ColorPicker
      open
      onChange={() => {
        changes += 1;
      }}
    />,
  );
  fireEvent.change(await screen.findByRole('textbox', { name: 'Hex color' }), {
    target: { value: 'invalid' },
  });
  expect(changes).toBe(0);
});
