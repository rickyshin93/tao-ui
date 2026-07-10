import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { type TaoSize, useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './button.css';

export type ButtonSemanticPart = 'root';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: TaoSize;
  disabled?: boolean;
  loading?: boolean;
  children?: ReactNode;
  classNames?: SemanticClassNames<ButtonSemanticPart>;
  styles?: SemanticStyles<ButtonSemanticPart>;
}

export function Button({
  variant = 'primary',
  size,
  disabled,
  loading,
  children,
  className,
  style,
  classNames,
  styles,
  ...rest
}: ButtonProps) {
  const ctx = useTaoConfig();
  const resolvedSize = size ?? ctx.size;
  const resolvedDisabled = disabled ?? ctx.disabled ?? false;
  const isDisabled = resolvedDisabled || loading;

  return (
    <button
      type="button"
      {...rest}
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-tao-button=""
      data-tao-variant={variant}
      data-tao-size={resolvedSize}
    >
      {children}
    </button>
  );
}
