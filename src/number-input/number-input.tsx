import type { InputHTMLAttributes, ReactNode } from 'react';
import { type UseNumberInputOptions, useNumberInput } from './use-number-input';

export interface NumberInputProps
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

export function NumberInput(props: NumberInputProps) {
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
    <span className={containerClassName} data-rh-number-input="">
      {prefix !== undefined && <span data-rh-prefix="">{prefix}</span>}
      <input {...nativeAttrs} {...inputProps} className={className} />
      {suffix !== undefined && <span data-rh-suffix="">{suffix}</span>}
    </span>
  );
}
