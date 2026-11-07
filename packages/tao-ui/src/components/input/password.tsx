import { forwardRef, type ReactNode, useState } from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import { BaseInput, type InputProps } from './base-input';

export interface VisibilityToggle {
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  tabIndex?: number;
}
export interface PasswordProps extends InputProps {
  visibilityToggle?: boolean | VisibilityToggle;
  iconRender?: (visible: boolean) => ReactNode;
}
export const Password = forwardRef<HTMLInputElement, PasswordProps>(
  function Password(
    { visibilityToggle = true, iconRender, suffix, disabled, ...props },
    ref,
  ) {
    const ctx = useTaoConfig();
    const [innerVisible, setVisible] = useState(false);
    if (visibilityToggle === false && innerVisible) setVisible(false);
    const config = typeof visibilityToggle === 'object' ? visibilityToggle : {};
    const visible =
      visibilityToggle !== false && (config.visible ?? innerVisible);
    const resolvedDisabled = disabled ?? ctx.disabled;
    return (
      <BaseInput
        {...props}
        disabled={resolvedDisabled}
        ref={ref}
        type={visible ? 'text' : 'password'}
        suffix={
          <>
            {suffix}
            {visibilityToggle && (
              <button
                type="button"
                data-tao-input-action=""
                aria-label={
                  visible
                    ? (ctx.locale.hidePassword ?? 'Hide password')
                    : (ctx.locale.showPassword ?? 'Show password')
                }
                aria-pressed={visible}
                tabIndex={config.tabIndex}
                disabled={resolvedDisabled}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (config.visible === undefined) setVisible(!visible);
                  config.onVisibleChange?.(!visible);
                }}
              >
                {iconRender ? (
                  iconRender(visible)
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    {!visible && <path d="m3 3 18 18" />}
                  </svg>
                )}
              </button>
            )}
          </>
        }
      />
    );
  },
);
