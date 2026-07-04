import type { ReactNode } from 'react';
import {
  type UseNumberInputOptions,
  useNumberInput,
} from '../../number-input/use-number-input';
import type { TaoSize, TaoVariant } from '../../provider/tao-provider';
import type { SemanticClassNames, SemanticStyles } from '../../utils/semantic';
import { Input, type InputSemanticPart } from '../input/input';

// InputNumber — the batteries-included numeric field (antd naming). It composes
// the headless number logic (useNumberInput: formatting, thousands grouping,
// caret repositioning) with the Input surface (themed box, size / variant /
// error, prefix / suffix, TaoProvider config). Value is a canonical string
// (grouping is display-only), so precision is never lost to a JS number.
//
// Reach for the lower layers when you need full control of the markup:
//   • <HeadlessInputNumber> — same logic, unstyled span (bring your own box)
//   • useNumberInput() — the raw hook, wire it into any element yourself
export type InputNumberSemanticPart = InputSemanticPart;

export interface InputNumberProps extends UseNumberInputOptions {
  prefix?: ReactNode;
  suffix?: ReactNode;
  size?: TaoSize;
  variant?: TaoVariant;
  error?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
  className?: string;
  classNames?: SemanticClassNames<InputNumberSemanticPart>;
  styles?: SemanticStyles<InputNumberSemanticPart>;
}

export function InputNumber({
  prefix,
  suffix,
  size,
  variant,
  error,
  disabled,
  placeholder,
  id,
  name,
  'aria-label': ariaLabel,
  className,
  classNames,
  styles,
  ...hookOptions
}: InputNumberProps) {
  const { inputProps } = useNumberInput(hookOptions);
  const { ref, ...inputRest } = inputProps;
  return (
    <Input
      ref={ref}
      prefix={prefix}
      suffix={suffix}
      size={size}
      variant={variant}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      id={id}
      name={name}
      aria-label={ariaLabel}
      className={className}
      classNames={classNames}
      styles={styles}
      {...inputRest}
    />
  );
}
