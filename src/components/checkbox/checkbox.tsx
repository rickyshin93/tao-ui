import {
  type ChangeEvent,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { type TaoSize, useTaoConfig } from '../../provider/tao-provider';
import { cx, type SemanticClassNames, type SemanticStyles } from '../../utils/semantic';
import './checkbox.css';

export type CheckboxSemanticPart = 'root' | 'indicator' | 'label';

// ---- Group Context ----

interface CheckboxGroupContextValue {
  value: string[];
  disabled: boolean;
  onChange: (itemValue: string, checked: boolean) => void;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

// ---- Checkbox ----

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  children?: ReactNode;
  classNames?: SemanticClassNames<CheckboxSemanticPart>;
  styles?: SemanticStyles<CheckboxSemanticPart>;
}

export function Checkbox({
  checked,
  indeterminate,
  disabled,
  onChange,
  value,
  children,
  classNames,
  styles,
}: CheckboxProps) {
  const ctx = useTaoConfig();
  const groupCtx = useContext(CheckboxGroupContext);
  const inputRef = useRef<HTMLInputElement>(null);

  const resolvedDisabled = disabled ?? groupCtx?.disabled ?? ctx.disabled ?? false;
  const resolvedChecked = groupCtx
    ? groupCtx.value.includes(value ?? '')
    : checked;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (groupCtx && value != null) {
        groupCtx.onChange(value, e.target.checked);
      } else {
        onChange?.(e);
      }
    },
    [groupCtx, value, onChange],
  );

  return (
    <label
      data-tao-checkbox-wrapper=""
      data-tao-disabled={resolvedDisabled || undefined}
      className={cx(classNames?.root)}
      style={styles?.root}
    >
      <input
        ref={inputRef}
        type="checkbox"
        checked={resolvedChecked}
        disabled={resolvedDisabled}
        onChange={handleChange}
        aria-checked={indeterminate ? 'mixed' : undefined}
        data-tao-checkbox-input=""
      />
      <span
        data-tao-checkbox=""
        data-tao-checked={resolvedChecked || undefined}
        data-tao-indeterminate={indeterminate || undefined}
        className={cx(classNames?.indicator)}
        style={styles?.indicator}
      >
        {resolvedChecked && !indeterminate && <CheckIcon />}
        {indeterminate && <MinusIcon />}
      </span>
      {children != null && <span data-tao-checkbox-label="" className={cx(classNames?.label)} style={styles?.label}>{children}</span>}
    </label>
  );
}

// ---- CheckboxGroup ----

export type CheckboxOptionType = { label: ReactNode; value: string; disabled?: boolean } | string;

export interface CheckboxGroupProps {
  options?: CheckboxOptionType[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  disabled?: boolean;
  size?: TaoSize;
  direction?: 'horizontal' | 'vertical';
  children?: ReactNode;
}

export function CheckboxGroup({
  options,
  value = [],
  onChange,
  disabled,
  direction = 'horizontal',
  children,
}: CheckboxGroupProps) {
  const ctx = useTaoConfig();
  const resolvedDisabled = disabled ?? ctx.disabled ?? false;

  const handleItemChange = useCallback(
    (itemValue: string, checked: boolean) => {
      const next = checked
        ? [...value, itemValue]
        : value.filter((v) => v !== itemValue);
      onChange?.(next);
    },
    [value, onChange],
  );

  const groupCtxValue: CheckboxGroupContextValue = {
    value,
    disabled: resolvedDisabled,
    onChange: handleItemChange,
  };

  const normalizedOptions = options?.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt,
  );

  return (
    <CheckboxGroupContext.Provider value={groupCtxValue}>
      <div data-tao-checkbox-group="" data-tao-direction={direction}>
        {normalizedOptions
          ? normalizedOptions.map((opt) => (
              <Checkbox
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.label}
              </Checkbox>
            ))
          : children}
      </div>
    </CheckboxGroupContext.Provider>
  );
}

// ---- Icons ----

function CheckIcon() {
  return (
    <svg data-tao-checkbox-icon="" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg data-tao-checkbox-icon="" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
