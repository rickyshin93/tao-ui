import {
  type AriaAttributes,
  type ChangeEvent,
  createContext,
  type ForwardedRef,
  forwardRef,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { type TaoSize, useTaoConfig } from '../../provider/tao-provider';
import { mergeRefs } from '../../utils/refs';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './checkbox.css';

export type CheckboxSemanticPart = 'root' | 'indicator' | 'label';

// ---- Group Context ----

interface CheckboxGroupContextValue {
  value: string[];
  disabled: boolean;
  onChange: (itemValue: string, checked: boolean) => void;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(
  null,
);

// ---- Checkbox ----

export interface CheckboxProps
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
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  children?: ReactNode;
  classNames?: SemanticClassNames<CheckboxSemanticPart>;
  styles?: SemanticStyles<CheckboxSemanticPart>;
  ref?: Ref<HTMLInputElement>;
}

export const Checkbox = forwardRef(function Checkbox(
  {
    checked,
    defaultChecked,
    indeterminate,
    disabled,
    onChange,
    value,
    children,
    classNames,
    styles,
    ...ariaProps
  }: CheckboxProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const ctx = useTaoConfig();
  const groupCtx = useContext(CheckboxGroupContext);
  const inputRef = useRef<HTMLInputElement>(null);

  const resolvedDisabled =
    disabled ?? groupCtx?.disabled ?? ctx.disabled ?? false;
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
      <span data-tao-checkbox-control="">
        <input
          {...ariaProps}
          ref={mergeRefs(inputRef, ref)}
          type="checkbox"
          checked={resolvedChecked}
          defaultChecked={defaultChecked}
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
          {!indeterminate && <CheckIcon />}
          {indeterminate && <MinusIcon />}
        </span>
      </span>
      {children != null && (
        <span
          data-tao-checkbox-label=""
          className={cx(classNames?.label)}
          style={styles?.label}
        >
          {children}
        </span>
      )}
    </label>
  );
});

// ---- CheckboxGroup ----

export type CheckboxOptionType =
  | { label: ReactNode; value: string; disabled?: boolean }
  | string;

export interface CheckboxGroupProps
  extends Pick<
    AriaAttributes,
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'aria-errormessage'
    | 'aria-invalid'
  > {
  id?: string;
  options?: CheckboxOptionType[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  disabled?: boolean;
  size?: TaoSize;
  direction?: 'horizontal' | 'vertical';
  children?: ReactNode;
}

export function CheckboxGroup(props: CheckboxGroupProps) {
  const {
    options,
    value,
    defaultValue,
    onChange,
    disabled,
    direction = 'horizontal',
    children,
  } = props;
  const ctx = useTaoConfig();
  const resolvedDisabled = disabled ?? ctx.disabled ?? false;
  const [internalValue, setInternalValue] = useState(() => [
    ...new Set(defaultValue ?? []),
  ]);
  const isControlled = 'value' in props;
  const resolvedValue = isControlled ? (value ?? []) : internalValue;

  const handleItemChange = useCallback(
    (itemValue: string, checked: boolean) => {
      const next = [
        ...new Set(
          checked
            ? [...resolvedValue, itemValue]
            : resolvedValue.filter((v) => v !== itemValue),
        ),
      ];
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [resolvedValue, onChange, isControlled],
  );

  const groupCtxValue: CheckboxGroupContextValue = {
    value: resolvedValue,
    disabled: resolvedDisabled,
    onChange: handleItemChange,
  };

  const normalizedOptions = options?.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt,
  );

  return (
    <CheckboxGroupContext.Provider value={groupCtxValue}>
      <fieldset
        data-tao-checkbox-group=""
        data-tao-direction={direction}
        id={props.id}
        aria-label={props['aria-label']}
        aria-labelledby={props['aria-labelledby']}
        aria-describedby={props['aria-describedby']}
        aria-errormessage={props['aria-errormessage']}
        aria-invalid={props['aria-invalid']}
      >
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
      </fieldset>
    </CheckboxGroupContext.Provider>
  );
}

// ---- Icons ----

function CheckIcon() {
  return (
    <svg
      data-tao-checkbox-icon=""
      aria-hidden="true"
      focusable="false"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      data-tao-checkbox-icon=""
      aria-hidden="true"
      focusable="false"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
