import {
  type ChangeEvent,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
} from 'react';
import { type TaoSize, useTaoConfig } from '../../provider/tao-provider';
import { cx, type SemanticClassNames, type SemanticStyles } from '../../utils/semantic';
import './radio.css';

export type RadioSemanticPart = 'root' | 'indicator' | 'label';

// ---- Group Context ----

interface RadioGroupContextValue {
  name?: string;
  value?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

// ---- Radio ----

export interface RadioProps {
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
  name?: string;
  classNames?: SemanticClassNames<RadioSemanticPart>;
  styles?: SemanticStyles<RadioSemanticPart>;
}

export function Radio({
  value,
  checked,
  disabled,
  onChange,
  children,
  name,
  classNames,
  styles,
}: RadioProps) {
  const ctx = useTaoConfig();
  const groupCtx = useContext(RadioGroupContext);

  const resolvedDisabled = disabled ?? groupCtx?.disabled ?? ctx.disabled ?? false;
  const resolvedChecked = groupCtx ? groupCtx.value === value : checked;
  const resolvedName = groupCtx?.name ?? name;

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (groupCtx && value != null) {
        groupCtx.onChange(value);
      } else {
        onChange?.(e);
      }
    },
    [groupCtx, value, onChange],
  );

  return (
    <label
      data-tao-radio-wrapper=""
      data-tao-disabled={resolvedDisabled || undefined}
      className={cx(classNames?.root)}
      style={styles?.root}
    >
      <input
        type="radio"
        name={resolvedName}
        value={value}
        checked={resolvedChecked}
        disabled={resolvedDisabled}
        onChange={handleChange}
        data-tao-radio-input=""
      />
      <span
        data-tao-radio=""
        data-tao-checked={resolvedChecked || undefined}
        className={cx(classNames?.indicator)}
        style={styles?.indicator}
      />
      {children != null && <span data-tao-radio-label="" className={cx(classNames?.label)} style={styles?.label}>{children}</span>}
    </label>
  );
}

// ---- RadioGroup ----

export type RadioOptionType = { label: ReactNode; value: string; disabled?: boolean } | string;

export interface RadioGroupProps {
  options?: RadioOptionType[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  size?: TaoSize;
  direction?: 'horizontal' | 'vertical';
  name?: string;
  children?: ReactNode;
}

export function RadioGroup({
  options,
  value,
  onChange,
  disabled,
  direction = 'horizontal',
  name,
  children,
}: RadioGroupProps) {
  const ctx = useTaoConfig();
  const resolvedDisabled = disabled ?? ctx.disabled ?? false;

  const handleChange = useCallback(
    (itemValue: string) => {
      onChange?.(itemValue);
    },
    [onChange],
  );

  const groupCtxValue: RadioGroupContextValue = {
    name,
    value,
    disabled: resolvedDisabled,
    onChange: handleChange,
  };

  const normalizedOptions = options?.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt,
  );

  return (
    <RadioGroupContext.Provider value={groupCtxValue}>
      <div data-tao-radio-group="" data-tao-direction={direction} role="radiogroup">
        {normalizedOptions
          ? normalizedOptions.map((opt) => (
              <Radio
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.label}
              </Radio>
            ))
          : children}
      </div>
    </RadioGroupContext.Provider>
  );
}
