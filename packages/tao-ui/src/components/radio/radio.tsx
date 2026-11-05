import {
  type AriaAttributes,
  type ForwardedRef,
  forwardRef,
  type ChangeEvent,
  createContext,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useState,
} from 'react';
import { type TaoSize, useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
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

export interface RadioProps
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
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
  name?: string;
  classNames?: SemanticClassNames<RadioSemanticPart>;
  styles?: SemanticStyles<RadioSemanticPart>;
  ref?: Ref<HTMLInputElement>;
}

export const Radio = forwardRef(function Radio(
  {
    value,
    checked,
    defaultChecked,
    disabled,
    required,
    'aria-required': ariaRequired,
    onChange,
    children,
    name,
    classNames,
    styles,
    ...ariaProps
  }: RadioProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const ctx = useTaoConfig();
  const groupCtx = useContext(RadioGroupContext);

  const resolvedDisabled =
    disabled ?? groupCtx?.disabled ?? ctx.disabled ?? false;
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
      <span data-tao-radio-control="">
        <input
          {...ariaProps}
          required={
            required ?? (ariaRequired === true || ariaRequired === 'true')
          }
          ref={ref}
          type="radio"
          name={resolvedName}
          value={value}
          checked={resolvedChecked}
          defaultChecked={defaultChecked}
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
      </span>
      {children != null && (
        <span
          data-tao-radio-label=""
          className={cx(classNames?.label)}
          style={styles?.label}
        >
          {children}
        </span>
      )}
    </label>
  );
});

// ---- RadioGroup ----

export type RadioOptionType =
  | { label: ReactNode; value: string; disabled?: boolean }
  | string;

export interface RadioGroupProps
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
  defaultValue,
  onChange,
  disabled,
  direction = 'horizontal',
  name,
  children,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-errormessage': ariaErrorMessage,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
}: RadioGroupProps) {
  const ctx = useTaoConfig();
  const resolvedDisabled = disabled ?? ctx.disabled ?? false;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const resolvedValue = isControlled ? value : internalValue;

  const handleChange = useCallback(
    (itemValue: string) => {
      if (!isControlled) setInternalValue(itemValue);
      onChange?.(itemValue);
    },
    [onChange, isControlled],
  );

  const groupCtxValue: RadioGroupContextValue = {
    name,
    value: resolvedValue,
    disabled: resolvedDisabled,
    onChange: handleChange,
  };

  const normalizedOptions = options?.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt,
  );

  return (
    <RadioGroupContext.Provider value={groupCtxValue}>
      <div
        data-tao-radio-group=""
        data-tao-direction={direction}
        role="radiogroup"
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-errormessage={ariaErrorMessage}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
      >
        {normalizedOptions
          ? normalizedOptions.map((opt) => (
              <Radio key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </Radio>
            ))
          : children}
      </div>
    </RadioGroupContext.Provider>
  );
}
