import {
  type AriaAttributes,
  type ForwardedRef,
  forwardRef,
  type ReactNode,
  type Ref,
  useState,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './switch.css';

export type SwitchSemanticPart = 'root' | 'handle';

export interface SwitchProps
  extends Pick<
    AriaAttributes,
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'aria-errormessage'
    | 'aria-invalid'
    | 'aria-required'
  > {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium';
  checkedChildren?: ReactNode;
  unCheckedChildren?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  classNames?: SemanticClassNames<SwitchSemanticPart>;
  styles?: SemanticStyles<SwitchSemanticPart>;
  ref?: Ref<HTMLButtonElement>;
}

export const Switch = forwardRef(function Switch(
  {
    checked,
    defaultChecked,
    onChange,
    disabled,
    loading,
    size = 'medium',
    checkedChildren,
    unCheckedChildren,
    className,
    style,
    classNames,
    styles,
    ...ariaProps
  }: SwitchProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const ctx = useTaoConfig();
  const resolvedDisabled = disabled ?? ctx.disabled ?? false;
  const isDisabled = resolvedDisabled || loading;
  const controlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(
    defaultChecked ?? false,
  );
  const resolvedChecked = controlled ? checked : internalChecked;

  const handleChange = () => {
    const next = !resolvedChecked;
    if (!controlled) setInternalChecked(next);
    onChange?.(next);
  };

  return (
    <button
      {...ariaProps}
      aria-busy={loading || undefined}
      ref={ref}
      type="button"
      role="switch"
      aria-checked={resolvedChecked}
      disabled={isDisabled}
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      data-tao-switch=""
      data-tao-size={size}
      data-tao-checked={resolvedChecked || undefined}
      onClick={handleChange}
    >
      {/* The travel area follows the track width, including label content. */}
      <span data-tao-switch-handle-track="">
        <span
          className={classNames?.handle}
          style={styles?.handle}
          data-tao-switch-handle=""
        >
          {loading && <LoadingIcon />}
        </span>
      </span>
      {/* Inner: two stacked lines, slide via margin */}
      <span data-tao-switch-inner="">
        <span data-tao-switch-inner-checked="">{checkedChildren}</span>
        <span data-tao-switch-inner-unchecked="">{unCheckedChildren}</span>
      </span>
    </button>
  );
});

function LoadingIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-tao-switch-loading=""
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
