import type { ReactNode } from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './switch.css';

export type SwitchSemanticPart = 'root' | 'handle';

export interface SwitchProps {
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
}

export function Switch({
  checked,
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
}: SwitchProps) {
  const ctx = useTaoConfig();
  const resolvedDisabled = disabled ?? ctx.disabled ?? false;
  const isDisabled = resolvedDisabled || loading;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      disabled={isDisabled}
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      data-tao-switch=""
      data-tao-size={size}
      data-tao-checked={checked || undefined}
      onClick={() => onChange?.(!checked)}
    >
      {/* Handle: absolute positioned circle */}
      <div
        className={classNames?.handle}
        style={styles?.handle}
        data-tao-switch-handle=""
      >
        {loading && <LoadingIcon />}
      </div>
      {/* Inner: two stacked lines, slide via margin */}
      <span data-tao-switch-inner="">
        <span data-tao-switch-inner-checked="">{checkedChildren}</span>
        <span data-tao-switch-inner-unchecked="">{unCheckedChildren}</span>
      </span>
    </button>
  );
}

function LoadingIcon() {
  return (
    <svg
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
