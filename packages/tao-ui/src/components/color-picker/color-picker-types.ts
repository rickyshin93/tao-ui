import type { CSSProperties, FC, Key, ReactNode } from 'react';
import type { PopoverPlacement } from '../popover/popover';
import type {
  Color,
  ColorFormatType,
  ColorValueType,
  LineGradientType,
  ModeType,
} from './color';
export type ColorPickerSemanticPart =
  | 'root'
  | 'body'
  | 'content'
  | 'description'
  | 'popup.root'
  | 'popup.container';
export interface ColorPickerClassNames {
  root?: string;
  body?: string;
  content?: string;
  description?: string;
  popup?: { root?: string; container?: string };
}
export interface ColorPickerStyles {
  root?: CSSProperties;
  body?: CSSProperties;
  content?: CSSProperties;
  description?: CSSProperties;
  popupOverlayInner?: CSSProperties;
  popup?: { root?: CSSProperties; container?: CSSProperties };
}
export interface PresetsItem {
  label: ReactNode;
  colors: (string | Color | LineGradientType)[];
  defaultOpen?: boolean;
  key?: Key;
}
type SemanticValue<Value> =
  | Value
  | ((info: { props: ColorPickerProps }) => Value);
export interface ColorPickerProps {
  prefixCls?: string;
  className?: string;
  rootClassName?: string;
  style?: CSSProperties;
  classNames?: SemanticValue<ColorPickerClassNames>;
  styles?: SemanticValue<ColorPickerStyles>;
  mode?: ModeType | ModeType[];
  value?: ColorValueType;
  defaultValue?: ColorValueType;
  children?: ReactNode;
  open?: boolean;
  disabled?: boolean;
  placement?: PopoverPlacement;
  trigger?: 'click' | 'hover';
  format?: ColorFormatType;
  defaultFormat?: ColorFormatType;
  allowClear?: boolean;
  presets?: PresetsItem[];
  arrow?: boolean | { pointAtCenter?: boolean };
  panelRender?: (
    panel: ReactNode,
    extra: { components: { Picker: FC; Presets: FC } },
  ) => ReactNode;
  showText?: boolean | ((color: Color) => ReactNode);
  size?: 'small' | 'medium' | 'middle' | 'large';
  disabledAlpha?: boolean;
  disabledFormat?: boolean;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  autoAdjustOverflow?: boolean;
  destroyTooltipOnHide?: boolean;
  destroyOnHidden?: boolean;
  onOpenChange?: (open: boolean) => void;
  onFormatChange?: (format?: ColorFormatType) => void;
  onChange?: (value: Color, css: string) => void;
  onClear?: () => void;
  onChangeComplete?: (value: Color) => void;
  [key: `data-${string}`]: string;
}
