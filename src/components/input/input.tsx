import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import {
  type TaoSize,
  type TaoVariant,
  useTaoConfig,
} from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './input.css';

export type InputSemanticPart = 'root' | 'input' | 'prefix' | 'suffix';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: TaoSize;
  variant?: TaoVariant;
  prefix?: ReactNode;
  suffix?: ReactNode;
  error?: boolean;
  classNames?: SemanticClassNames<InputSemanticPart>;
  styles?: SemanticStyles<InputSemanticPart>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size,
    variant,
    prefix,
    suffix,
    error,
    disabled,
    className,
    style,
    classNames,
    styles,
    ...rest
  },
  ref,
) {
  const ctx = useTaoConfig();
  const resolvedSize = size ?? ctx.size;
  const resolvedVariant = variant ?? ctx.variant;
  const resolvedDisabled = disabled ?? ctx.disabled;

  return (
    <div
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      data-tao-control=""
      data-tao-input=""
      data-tao-size={resolvedSize}
      data-tao-variant={resolvedVariant}
      data-tao-error={error || undefined}
    >
      {prefix != null && (
        <span
          className={classNames?.prefix}
          style={styles?.prefix}
          data-tao-prefix=""
        >
          {prefix}
        </span>
      )}
      <input
        {...rest}
        ref={ref}
        className={classNames?.input}
        style={styles?.input}
        disabled={resolvedDisabled}
        aria-invalid={error || undefined}
      />
      {suffix != null && (
        <span
          className={classNames?.suffix}
          style={styles?.suffix}
          data-tao-suffix=""
        >
          {suffix}
        </span>
      )}
    </div>
  );
});
