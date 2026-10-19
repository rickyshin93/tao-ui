import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useCallback,
} from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './tag.css';

// ---- Types ----

export type TagSemanticPart = 'root' | 'icon' | 'content' | 'close';

export type TagColor =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | (string & {});

export type TagVariant = 'filled' | 'solid' | 'outlined';

export interface TagProps {
  children?: ReactNode;
  color?: TagColor;
  variant?: TagVariant;
  icon?: ReactNode;
  closeIcon?: ReactNode | boolean;
  onClose?: (e: MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<TagSemanticPart>;
  styles?: SemanticStyles<TagSemanticPart>;
}

export interface CheckableTagProps {
  children?: ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ---- Close Icon ----

function CloseIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <path
        d="M3 3l6 6M9 3l-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---- Tag ----

export function Tag({
  children,
  color = 'default',
  variant = 'filled',
  icon,
  closeIcon,
  onClose,
  disabled = false,
  className,
  style,
  classNames,
  styles,
}: TagProps) {
  const isPreset = [
    'default',
    'primary',
    'success',
    'warning',
    'error',
  ].includes(color);
  const showClose =
    closeIcon !== false && closeIcon !== null && (closeIcon || onClose);

  const handleClose = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (disabled) return;
      onClose?.(e);
    },
    [disabled, onClose],
  );

  const customColorStyle: CSSProperties | undefined =
    !isPreset && color
      ? {
          ...(variant === 'solid'
            ? { background: color, color: '#fff', borderColor: color }
            : variant === 'outlined'
              ? {
                  color,
                  borderColor: `color-mix(in oklch, ${color} 36%, transparent)`,
                }
              : {
                  background: `color-mix(in oklab, ${color} 10%, var(--tao-color-bg-base))`,
                  color,
                  borderColor: `color-mix(in oklab, ${color} 18%, var(--tao-color-bg-base))`,
                }),
        }
      : undefined;

  return (
    <span
      data-tao-tag=""
      data-tao-color={isPreset ? color : undefined}
      data-tao-variant={variant}
      data-tao-disabled={disabled || undefined}
      data-tao-closable={showClose || undefined}
      className={cx(classNames?.root, className)}
      style={{ ...customColorStyle, ...styles?.root, ...style }}
    >
      {icon != null && (
        <span
          data-tao-tag-icon=""
          className={cx(classNames?.icon)}
          style={styles?.icon}
        >
          {icon}
        </span>
      )}
      {children != null && (
        <span
          data-tao-tag-content=""
          className={cx(classNames?.content)}
          style={styles?.content}
        >
          {children}
        </span>
      )}
      {showClose && (
        <button
          type="button"
          data-tao-tag-close=""
          aria-label="Close"
          disabled={disabled}
          onClick={handleClose}
          className={cx(classNames?.close)}
          style={styles?.close}
        >
          {closeIcon === true || closeIcon === undefined ? (
            <CloseIcon />
          ) : (
            closeIcon
          )}
        </button>
      )}
    </span>
  );
}

// ---- CheckableTag ----

export function CheckableTag({
  children,
  checked = false,
  onChange,
  disabled = false,
  icon,
  className,
  style,
}: CheckableTagProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: CheckableTag intentionally keeps one inline tag element with checkbox semantics.
    <span
      data-tao-tag=""
      data-tao-checkable=""
      data-tao-checked={checked || undefined}
      data-tao-disabled={disabled || undefined}
      role="checkbox"
      aria-checked={checked}
      tabIndex={disabled ? undefined : 0}
      className={className}
      style={style}
      onClick={() => !disabled && onChange?.(!checked)}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onChange?.(!checked);
        }
      }}
    >
      {icon != null && <span data-tao-tag-icon="">{icon}</span>}
      {children != null && <span data-tao-tag-content="">{children}</span>}
    </span>
  );
}

Tag.CheckableTag = CheckableTag;
