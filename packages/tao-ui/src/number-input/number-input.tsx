import type { InputHTMLAttributes, ReactNode } from 'react';
import { type UseNumberInputOptions, useNumberInput } from './use-number-input';

export interface HeadlessInputNumberProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      | 'value'
      | 'defaultValue'
      | 'onChange'
      | 'onBlur'
      | 'min'
      | 'max'
      | 'prefix'
    >,
    UseNumberInputOptions {
  prefix?: ReactNode;
  suffix?: ReactNode;
  containerClassName?: string;
  className?: string;
}

const HOOK_KEYS = [
  'value',
  'defaultValue',
  'onChange',
  'onBlur',
  'decimalSeparator',
  'thousandsSeparator',
  'decimalPlaces',
  'padDecimalsOnBlur',
  'isPercentage',
  'allowNegative',
  'min',
  'max',
] as const;

// Unstyled numeric field: number-input logic (useNumberInput) wired into a bare
// span container with prefix / suffix slots — bring your own box CSS. For the
// batteries-included version use `InputNumber`; for full control use the
// `useNumberInput` hook directly.
export function HeadlessInputNumber(props: HeadlessInputNumberProps) {
  const { prefix, suffix, containerClassName, className, ...rest } = props;

  const hookOpts: UseNumberInputOptions = {};
  const nativeAttrs: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(rest)) {
    if ((HOOK_KEYS as readonly string[]).includes(key)) {
      (hookOpts as Record<string, unknown>)[key] = val;
    } else {
      nativeAttrs[key] = val;
    }
  }

  const { inputProps } = useNumberInput(hookOpts);

  return (
    <span className={containerClassName} data-tao-number-input="">
      {prefix !== undefined && <span data-tao-prefix="">{prefix}</span>}
      <input {...nativeAttrs} {...inputProps} className={className} />
      {suffix !== undefined && <span data-tao-suffix="">{suffix}</span>}
    </span>
  );
}

/**
 * @deprecated Renamed to `HeadlessInputNumber` to avoid confusion with the
 * styled `InputNumber`. This alias will be removed in a future release.
 */
export const NumberInput = HeadlessInputNumber;
/** @deprecated Use `HeadlessInputNumberProps`. */
export type NumberInputProps = HeadlessInputNumberProps;
