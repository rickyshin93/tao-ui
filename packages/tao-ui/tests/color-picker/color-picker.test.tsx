import { expect, rstest, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Color } from '../../src/components/color-picker/color';
import { ColorPicker } from '../../src/components/color-picker/color-picker';
import { Modal } from '../../src/components/modal/modal';
import { TaoProvider, zhCN } from '../../src/provider/tao-provider';

test('provider messages localize color channels, mode, presets and live portal labels', async () => {
  const { rerender } = render(
    <TaoProvider locale={zhCN}>
      <ColorPicker
        open
        defaultFormat="rgb"
        defaultValue="#123456"
        mode={['single', 'gradient']}
        allowClear
        presets={[{ label: 'Brand', colors: ['#ffffff'] }]}
      />
    </TaoProvider>,
  );
  expect(
    await screen.findByRole('spinbutton', { name: '红色' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('spinbutton', { name: '绿色' })).toBeInTheDocument();
  expect(screen.getByRole('spinbutton', { name: '蓝色' })).toBeInTheDocument();
  expect(
    screen.getByRole('spinbutton', { name: '透明度' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('combobox', { name: '颜色格式' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: '预设 #ffffff' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '清除颜色' })).toBeInTheDocument();
  rerender(
    <TaoProvider
      locale={{
        ...zhCN,
        messages: {
          ...zhCN.messages,
          colorRed: 'Rouge',
          colorFormat: 'Format couleur',
        },
      }}
    >
      <ColorPicker
        open
        defaultFormat="rgb"
        defaultValue="#123456"
        mode={['single', 'gradient']}
        allowClear
        presets={[{ label: 'Brand', colors: ['#ffffff'] }]}
      />
    </TaoProvider>,
  );
  expect(screen.getByRole('spinbutton', { name: 'Rouge' })).toHaveValue(18);
  expect(
    screen.getByRole('combobox', { name: 'Format couleur' }),
  ).toBeInTheDocument();
  expect(screen.getByText('Brand')).toBeInTheDocument();
});

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
test('an explicitly empty controlled color does not restore the default', async () => {
  const onChange = rstest.fn();
  const picker = (value: string | undefined) => (
    <ColorPicker
      value={value}
      defaultValue="#112233"
      showText
      open
      onChange={onChange}
    />
  );
  const view = render(picker('#123456'));
  view.rerender(picker(undefined));
  expect(screen.getByText('Transparent')).toBeVisible();
  fireEvent.change(screen.getByRole('textbox', { name: 'Hex color' }), {
    target: { value: '#abcdef' },
  });
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Transparent')).toBeVisible();
});

test('a hover ColorPicker can be opened and dismissed with the keyboard', async () => {
  render(
    <ColorPicker trigger="hover">
      <button type="button">Pick accent</button>
    </ColorPicker>,
  );
  const user = userEvent.setup();
  const trigger = screen.getByRole('button', { name: 'Pick accent' });
  act(() => trigger.focus());
  await user.keyboard('{Enter}');
  const dialog = screen.getByRole('dialog', { name: 'Color picker' });
  expect(dialog).toContainElement(document.activeElement as HTMLElement);
  await user.keyboard('{Escape}');
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(screen.queryByRole('dialog', { name: 'Color picker' })).toBeNull();
});

test('switching to a click trigger cancels a pending ColorPicker hover close', () => {
  rstest.useFakeTimers();
  try {
    const onOpenChange = rstest.fn();
    const picker = (trigger: 'hover' | 'click') => (
      <ColorPicker trigger={trigger} onOpenChange={onOpenChange}>
        <button type="button">Pick accent</button>
      </ColorPicker>
    );
    const view = render(picker('hover'));
    const button = screen.getByRole('button', { name: 'Pick accent' });
    fireEvent.pointerEnter(button);
    expect(screen.getByRole('dialog', { name: 'Color picker' })).toBeVisible();
    onOpenChange.mockClear();
    fireEvent.pointerLeave(button);
    view.rerender(picker('click'));
    act(() => rstest.advanceTimersByTime(200));

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Color picker' })).toBeVisible();
  } finally {
    rstest.useRealTimers();
  }
});

test('a retained closed ColorPicker releases Escape to its parent modal', async () => {
  const onClose = rstest.fn();
  render(
    <Modal open title="Parent modal" onClose={onClose}>
      <ColorPicker />
    </Modal>,
  );
  const trigger = screen.getByRole('button', { name: 'Choose color #1677ff' });
  const popup = document.querySelector('[data-tao-color-popup]');
  const editor = popup?.querySelector('input');
  expect(popup).toHaveAttribute('data-state', 'closed');
  fireEvent.keyDown(trigger, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(1);

  act(() => trigger.focus());
  fireEvent.click(trigger);
  expect(popup).toHaveAttribute('data-state', 'open');
  expect(popup?.querySelector('input')).toBe(editor);
  await userEvent.keyboard('{Escape}');
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(popup).toHaveAttribute('data-state', 'closed');
  await waitFor(() => expect(trigger).toHaveFocus());
  fireEvent.keyDown(trigger, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(2);
});

test('editing a ColorPicker callback value cannot alter the stored color or completion', async () => {
  const onChangeComplete = rstest.fn();
  render(
    <ColorPicker
      open
      showText
      defaultValue="#ff0000"
      presets={[{ label: 'Brand', colors: ['#00ff00'] }]}
      onChange={(color) => {
        color.cleared = true;
      }}
      onChangeComplete={(color) => {
        onChangeComplete(color.cleared);
        color.cleared = true;
      }}
    />,
  );
  fireEvent.click(
    await screen.findByRole('button', { name: 'Preset #00ff00' }),
  );

  expect(onChangeComplete).toHaveBeenCalledExactlyOnceWith(false);
  expect(
    document.querySelector('[data-tao-color-description]'),
  ).toHaveTextContent('#00ff00');
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
  const format = screen.getByRole('combobox', { name: 'Color format' });
  expect(format).toHaveAttribute('data-tao-select');
  fireEvent.keyDown(format, { key: 'ArrowDown' });
  fireEvent.click(await screen.findByRole('option', { name: 'RGB' }));
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
  const completed: Color[] = [];
  render(
    <ColorPicker
      open
      mode={['single', 'gradient']}
      defaultValue="#12345680"
      disabledAlpha
      onChange={(value) => values.push(value)}
      onChangeComplete={(value) => completed.push(value)}
    />,
  );
  expect(
    await screen.findByRole('radiogroup', { name: 'Color mode' }),
  ).toHaveAttribute('data-tao-segmented');
  fireEvent.click(screen.getByRole('radio', { name: 'Gradient' }));
  expect(values.at(-1)?.isGradient()).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Add color stop' }));
  expect(values.at(-1)?.getColors()).toHaveLength(3);
  expect(
    values
      .at(-1)
      ?.getColors()
      .map((stop) => stop.percent),
  ).toEqual([0, 50, 100]);
  fireEvent.keyDown(screen.getByRole('slider', { name: 'Stop position' }), {
    key: 'ArrowRight',
    keyCode: 39,
  });
  expect(
    values
      .at(-1)
      ?.getColors()
      .map((stop) => stop.percent),
  ).toEqual([0, 51, 100]);
  fireEvent.keyUp(screen.getByRole('slider', { name: 'Stop position' }), {
    key: 'ArrowRight',
    keyCode: 39,
  });
  expect(
    completed
      .at(-1)
      ?.getColors()
      .map((stop) => stop.percent),
  ).toEqual([0, 51, 100]);
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
  expect(await screen.findByRole('radio', { name: 'Single' })).toBeChecked();
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
  expect(screen.getByRole('radio', { name: 'Gradient' })).toBeChecked();
  expect(screen.getByRole('button', { name: 'Add color stop' })).toBeTruthy();
  fireEvent.change(screen.getByRole('textbox', { name: 'Hex color' }), {
    target: { value: '#00ff00' },
  });
  expect(values.at(-1)?.isGradient()).toBe(true);
  expect(values.at(-1)?.getColors()).toHaveLength(2);
  expect(values.at(-1)?.getColors()[1].color.toHexString()).toBe('#0000ff');
  rerender(<ColorPicker open value="#123456" mode={['single', 'gradient']} />);
  expect(screen.getByRole('radio', { name: 'Single' })).toBeChecked();
  expect(screen.queryByRole('button', { name: 'Add color stop' })).toBeNull();
});
test('changing the allowed modes selects an available editor', async () => {
  const { rerender } = render(
    <ColorPicker open defaultValue="#1677ff" mode={['single', 'gradient']} />,
  );
  await screen.findByRole('radiogroup', { name: 'Color mode' });
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
test('disabling a ColorPicker disables its custom native button', async () => {
  const onClick = rstest.fn();
  const onOpenChange = rstest.fn();
  render(
    <ColorPicker disabled onOpenChange={onOpenChange}>
      <button type="button" disabled={false} onClick={onClick}>
        Pick accent
      </button>
    </ColorPicker>,
  );
  const trigger = screen.getByRole('button', { name: 'Pick accent' });

  await userEvent.click(trigger);

  expect(trigger).toBeDisabled();
  expect(onClick).not.toHaveBeenCalled();
  expect(onOpenChange).not.toHaveBeenCalled();
});

test('disabling an uncontrolled ColorPicker closes its interaction before reenable', async () => {
  const picker = (disabled: boolean) => (
    <ColorPicker disabled={disabled}>
      <button type="button">Pick accent</button>
    </ColorPicker>
  );
  const view = render(picker(false));
  const trigger = screen.getByRole('button', { name: 'Pick accent' });
  await userEvent.click(trigger);
  expect(screen.getByRole('dialog', { name: 'Color picker' })).toBeVisible();
  view.rerender(picker(true));
  expect(screen.queryByRole('dialog', { name: 'Color picker' })).toBeNull();

  view.rerender(picker(false));

  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('dialog', { name: 'Color picker' })).toBeNull();
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

test('shared controls respect local enabled state and preset disclosure', async () => {
  render(
    <TaoProvider disabled>
      <ColorPicker
        disabled={false}
        open
        disabledFormat
        allowClear
        mode={['single', 'gradient']}
        presets={[
          {
            key: 'brand',
            label: 'Brand',
            defaultOpen: false,
            colors: ['#00ff00'],
          },
        ]}
      />
    </TaoProvider>,
  );
  const hex = await screen.findByRole('textbox', { name: 'Hex color' });
  expect(hex).not.toBeDisabled();
  expect(hex.closest('[data-tao-input]')).toBeTruthy();
  expect(
    screen.getByRole('combobox', { name: 'Color format' }),
  ).toHaveAttribute('data-tao-disabled');
  expect(screen.getByRole('radio', { name: 'Gradient' })).not.toBeDisabled();
  expect(
    screen.getByRole('button', { name: 'Clear color' }),
  ).not.toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Preset #00ff00' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Brand' }));
  expect(screen.getByRole('button', { name: 'Preset #00ff00' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Brand' }));
  expect(screen.queryByRole('button', { name: 'Preset #00ff00' })).toBeNull();
});
