import {
  Fragment,
  forwardRef,
  type HTMLAttributes,
  type HTMLInputTypeAttribute,
  type ReactNode,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  type TaoSize,
  type TaoStatus,
  useTaoConfig,
} from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { FormFieldChangeContext } from '../form/form-context';
import { BaseInput } from './base-input';
import type { InputSemanticValue, InputVariant } from './input-shared';

export type OTPSemanticPart = 'root' | 'input' | 'separator';
export interface OTPRef {
  focus: () => void;
  blur: () => void;
  nativeElement: HTMLDivElement;
}
export interface OTPProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onInput'> {
  value?: string;
  defaultValue?: string;
  length?: number;
  formatter?: (value: string) => string;
  separator?: ReactNode | ((index: number) => ReactNode);
  mask?: boolean | string;
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  disabled?: boolean;
  status?: TaoStatus;
  size?: TaoSize;
  variant?: InputVariant;
  onChange?: (value: string) => void;
  onInput?: (value: string[]) => void;
  classNames?: InputSemanticValue<
    SemanticClassNames<OTPSemanticPart>,
    OTPProps
  >;
  styles?: InputSemanticValue<SemanticStyles<OTPSemanticPart>, OTPProps>;
}
export const OTP = forwardRef<OTPRef, OTPProps>(function OTP(props, ref) {
  const {
    value,
    defaultValue = '',
    length = 6,
    formatter,
    separator,
    mask = false,
    type = 'text',
    autoComplete,
    disabled,
    status,
    size,
    variant,
    onChange,
    onInput,
    classNames: customClassNames,
    styles: customStyles,
    className,
    style,
    autoFocus,
    inputMode,
    ...rest
  } = props;
  if (!Number.isInteger(length) || length < 1)
    throw new RangeError('Input.OTP length must be a positive integer');
  const ctx = useTaoConfig();
  const fieldChange = useContext(FormFieldChangeContext);
  const format = (text: string) =>
    Array.from(formatter ? formatter(text) : text).slice(0, length);
  const formattedValue =
    'value' in props ? format(value ?? '').join('') : undefined;
  const [innerValue, setInnerValue] = useState(() =>
    format('value' in props ? (value ?? '') : defaultValue),
  );
  const [previousValue, setPreviousValue] = useState({ value, formattedValue });
  const [draft, setDraft] = useState<{ index: number; value: string } | null>(
    null,
  );
  // Keep incomplete codes locally: onChange only publishes a complete code.
  if (
    previousValue.value !== value ||
    previousValue.formattedValue !== formattedValue
  ) {
    setPreviousValue({ value, formattedValue });
    setInnerValue(Array.from(formattedValue ?? ''));
    setDraft(null);
  }
  const cells = innerValue.slice(0, length);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const root = useRef<HTMLDivElement>(null);
  const composing = useRef<number | null>(null);
  useEffect(() => {
    if (composing.current !== null && composing.current >= length) {
      composing.current = null;
      setDraft(null);
    }
  }, [length]);
  const classNames =
    typeof customClassNames === 'function'
      ? customClassNames({ props })
      : customClassNames;
  const styles =
    typeof customStyles === 'function' ? customStyles({ props }) : customStyles;
  const focus = (index: number) => {
    inputs.current[index]?.focus();
    inputs.current[index]?.select();
  };
  useImperativeHandle(ref, () => ({
    focus: () => focus(0),
    blur: () =>
      inputs.current.forEach((input) => {
        input?.blur();
      }),
    nativeElement: root.current!,
  }));
  const update = (index: number, text: string) => {
    const chars = format(text);
    const next = Array.from({ length }, (_, i) => cells[i] ?? '');
    if (!chars.length) next[index] = '';
    else
      chars.forEach((char, offset) => {
        if (index + offset < length) next[index + offset] = char;
      });
    while (next.length && !next[next.length - 1]) next.pop();
    if (
      next.length !== cells.length ||
      next.some((char, i) => char !== cells[i])
    ) {
      setInnerValue(next);
      onInput?.([...next]);
      if (next.length === length && next.every(Boolean)) {
        onChange?.(next.join(''));
      } else if (value && fieldChange && onChange === fieldChange.onChange) {
        // Clear the committed form value while keeping the remaining cells editable.
        setPreviousValue({
          value: '',
          formattedValue: format('').join(''),
        });
        fieldChange.collect('');
      }
    }
    if (chars.length) focus(Math.min(index + chars.length, length - 1));
  };
  return (
    <div
      {...rest}
      ref={root}
      role={rest.role ?? 'group'}
      data-tao-input-otp=""
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      {Array.from({ length }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: OTP cells are fixed positions, not reorderable records.
        <Fragment key={`otp-${index}`}>
          <div
            data-tao-otp-cell=""
            data-tao-otp-masked={
              typeof mask === 'string' && cells[index] ? '' : undefined
            }
          >
            <BaseInput
              ref={(node) => {
                inputs.current[index] = node;
              }}
              value={
                draft?.index === index ? draft.value : (cells[index] ?? '')
              }
              autoFocus={autoFocus && index === 0}
              type={mask === true ? 'password' : type}
              inputMode={inputMode}
              autoComplete={autoComplete}
              disabled={disabled}
              status={status}
              size={size}
              variant={variant}
              aria-label={
                ctx.locale.otpLabel?.(index + 1, length) ??
                `Character ${index + 1} of ${length}`
              }
              aria-describedby={rest['aria-describedby']}
              aria-invalid={rest['aria-invalid']}
              classNames={{ input: classNames?.input }}
              styles={{ input: styles?.input }}
              onFocus={(event) => event.currentTarget.select()}
              onChange={(event) => {
                if (composing.current === index)
                  setDraft({ index, value: event.target.value });
                else update(index, event.target.value);
              }}
              onCompositionStart={() => {
                composing.current = index;
              }}
              onCompositionEnd={(event) => {
                composing.current = null;
                setDraft(null);
                update(index, event.currentTarget.value);
              }}
              onPaste={(event) => {
                event.preventDefault();
                update(index, event.clipboardData.getData('text'));
              }}
              onKeyDown={(event) => {
                if (
                  composing.current === index ||
                  event.nativeEvent.isComposing ||
                  event.keyCode === 229
                )
                  return;
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                  event.preventDefault();
                  const direction =
                    getComputedStyle(root.current!).direction === 'rtl'
                      ? -1
                      : 1;
                  focus(
                    Math.min(
                      length - 1,
                      Math.max(
                        0,
                        index +
                          (event.key === 'ArrowRight' ? direction : -direction),
                      ),
                    ),
                  );
                } else if (
                  event.key === 'Backspace' &&
                  !cells[index] &&
                  index > 0
                ) {
                  event.preventDefault();
                  update(index - 1, '');
                  focus(index - 1);
                } else if (event.key === 'Delete') {
                  event.preventDefault();
                  update(index, '');
                }
              }}
            />
            {typeof mask === 'string' && cells[index] && (
              <span data-tao-otp-mask="" aria-hidden="true">
                {mask}
              </span>
            )}
          </div>
          {index < length - 1 && separator != null && (
            <span
              data-tao-otp-separator=""
              className={classNames?.separator}
              style={styles?.separator}
            >
              {typeof separator === 'function' ? separator(index) : separator}
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
});
