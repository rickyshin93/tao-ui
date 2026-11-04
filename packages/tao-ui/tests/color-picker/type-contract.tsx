import { type Color, ColorPicker, type ColorPickerProps } from '../../src';

<ColorPicker size="medium" />;
<ColorPicker size="middle" />;
<ColorPicker
  mode={['single', 'gradient']}
  value={[
    { color: '#000000', percent: 0 },
    { color: '#ffffff', percent: 100 },
  ]}
  onChange={(color: Color, css: string) => {
    color.getColors();
    css.toUpperCase();
  }}
/>;

export const invalidSize: ColorPickerProps = {
  // @ts-expect-error arbitrary size values are not part of the public API
  size: 'tiny',
};
