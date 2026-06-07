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

export type TagSemanticPart = 'root' | 'icon' | 'close';

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
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
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
              ? { color, borderColor: color }
              : {
                  background: `color-mix(in oklch, ${color} 12%, var(--tao-color-bg-base))`,
                  color,
                  borderColor: `color-mix(in oklch, ${color} 30%, var(--tao-color-bg-base))`,
                }),
        }
      : undefined;

  return (
    <span
      data-tao-tag=""
      data-tao-color={isPreset ? color : undefined}
      data-tao-variant={variant}
      data-tao-disabled={disabled || undefined}
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
      {children}
      {showClose && (
        <span
          data-tao-tag-close=""
          role="button"
          tabIndex={disabled ? undefined : 0}
          aria-label="Close"
          onClick={handleClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClose(e as any);
            }
          }}
          className={cx(classNames?.close)}
          style={styles?.close}
        >
          {closeIcon === true || closeIcon === undefined ? (
            <CloseIcon />
          ) : (
            closeIcon
          )}
        </span>
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
      {children}
    </span>
  );
}

Tag.CheckableTag = CheckableTag;
