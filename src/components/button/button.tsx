import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
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
  /** Left-leading decorative icon (non-loading state). */
  icon?: ReactNode;
  /** Icon shown while loading. Defaults to a built-in spinner. */
  loadingIcon?: ReactNode;
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
  classNames?: SemanticClassNames<ButtonSemanticPart>;
  styles?: SemanticStyles<ButtonSemanticPart>;
}

export function Button({
  variant = 'primary',
  size,
  disabled,
  loading,
  icon,
  loadingIcon,
  children,
  ref,
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

  // Icon slot stays mounted in both states; only opacity toggles, so loading
  // never adds/removes DOM and never triggers reflow/repaint flicker.
  const hasIconSlot = icon != null || loading;

  return (
    <button
      ref={ref}
      type="button"
      {...rest}
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-tao-button=""
      data-tao-has-icon={hasIconSlot || undefined}
      data-tao-variant={variant}
      data-tao-size={resolvedSize}
    >
      {hasIconSlot && (
        <span data-tao-button-icon="" data-tao-loading={loading || undefined}>
          {icon != null && <span data-tao-button-icon-idle="">{icon}</span>}
          <span data-tao-button-icon-spin="">
            {loadingIcon ?? <LoadingSpinner />}
          </span>
        </span>
      )}
      {children}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <svg
      data-tao-button-spinner=""
      viewBox="0 0 50 50"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="90 40"
      />
    </svg>
  );
}
