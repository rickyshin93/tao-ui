import {
  Color as BaseColor,
  type ColorGenInput,
} from '@rc-component/color-picker';

export type ColorFormatType = 'hex' | 'rgb' | 'hsb';
export type ModeType = 'single' | 'gradient';
export type LineGradientType = { color: string | Color; percent: number }[];
export type ColorValueType = string | Color | null | LineGradientType;
export type GradientColor = { color: Color; percent: number }[];

export class Color {
  private base: BaseColor;
  private stops?: GradientColor;
  cleared: boolean;

  constructor(value: ColorGenInput<Color> | LineGradientType | null = '') {
    if (value instanceof Color) {
      this.base = new BaseColor(value.toRgb());
      this.stops = value.stops?.map((stop) => ({
        percent: stop.percent,
        color: new Color(stop.color),
      }));
      this.cleared = value.cleared;
    } else if (Array.isArray(value)) {
      this.stops = value.length
        ? value.map((stop) => ({
            percent: stop.percent,
            color: new Color(stop.color),
          }))
        : undefined;
      this.base = new BaseColor(this.stops?.[0].color.toRgb() ?? 'transparent');
      this.cleared = value.length === 0;
    } else {
      this.base = new BaseColor(value || 'transparent');
      this.cleared = !value;
    }
  }
  toHsb() {
    return this.base.toHsb();
  }
  toHsbString() {
    return this.base.toHsbString();
  }
  toHex() {
    return this.base.toHexString().replace(/^#/, '');
  }
  toHexString() {
    return this.base.toHexString();
  }
  toRgb() {
    return this.base.toRgb();
  }
  toRgbString() {
    return this.base.toRgbString();
  }
  isGradient() {
    return !!this.stops && !this.cleared;
  }
  getColors(): GradientColor {
    return this.stops ?? [{ color: this, percent: 0 }];
  }
  toCssString() {
    return this.stops
      ? `linear-gradient(90deg, ${this.stops.map((stop) => `${stop.color.toRgbString()} ${stop.percent}%`).join(', ')})`
      : this.toRgbString();
  }
  equals(other: Color | null): boolean {
    if (!other || this.isGradient() !== other.isGradient()) return false;
    if (!this.isGradient()) return this.toHexString() === other.toHexString();
    const right = other.getColors();
    return (
      this.getColors().length === right.length &&
      this.getColors().every(
        (stop, index) =>
          stop.percent === right[index].percent &&
          stop.color.equals(right[index].color),
      )
    );
  }
}
export type { ColorGenInput };
export { Color as AggregationColor };
