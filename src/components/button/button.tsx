import {
  type ForwardedRef,
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
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
  /** Visual emphasis for the action. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'bare';
  /** Control height and horizontal spacing. Inherits from TaoProvider. */
  size?: TaoSize;
  /** Prevents interaction. Inherits from TaoProvider. */
  disabled?: boolean;
  /** Shows the loading icon, sets aria-busy, and prevents interaction. */
  loading?: boolean;
  /** Left-leading decorative icon (non-loading state). */
  icon?: ReactNode;
  /** Icon shown while loading. Defaults to a built-in spinner. */
  loadingIcon?: ReactNode;
  /** Button label or inline content. */
  children?: ReactNode;
  /** Ref forwarded to the native button element. */
  ref?: Ref<HTMLButtonElement>;
  /** Semantic class overrides keyed by ButtonSemanticPart. */
  classNames?: SemanticClassNames<ButtonSemanticPart>;
  /** Semantic style overrides keyed by ButtonSemanticPart. */
  styles?: SemanticStyles<ButtonSemanticPart>;
}

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size,
    disabled,
    loading,
    icon,
    loadingIcon,
    children,
    className,
    style,
    classNames,
    styles,
    ...rest
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
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
});

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
