import type { Dayjs } from 'dayjs';

export interface PickerRef {
  focus: (position?: 'start' | 'end') => void;
  blur: () => void;
  nativeElement: HTMLElement | null;
}

import type { ReactNode } from 'react';
import type { TaoSize, TaoVariant } from '../../provider/tao-provider';

export type PickerMode = 'date' | 'month' | 'year';
export type PanelMode = 'date' | 'month' | 'year' | 'decade';

export interface TimeConfig {
  format?: string;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
}

export interface PresetItem {
  label: string;
  value: Dayjs;
}

export interface RangePresetItem {
  label: string;
  value: [Dayjs, Dayjs];
}

export interface SharedPickerProps {
  picker?: PickerMode;
  showTime?: boolean | TimeConfig;
  format?: string;
  disabledDate?: (date: Dayjs) => boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  placeholder?: string;
  size?: TaoSize;
  variant?: TaoVariant;
  disabled?: boolean;
  allowClear?: boolean;
  prefix?: ReactNode;
  suffixIcon?: ReactNode;
  status?: 'error' | 'warning';
  mobile?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function getDefaultFormat(
  picker: PickerMode,
  showTime?: boolean | TimeConfig,
): string {
  if (picker === 'year') return 'YYYY';
  if (picker === 'month') return 'YYYY-MM';
  if (showTime) return 'YYYY-MM-DD HH:mm:ss';
  return 'YYYY-MM-DD';
}
