import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useRef,
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
import './input.css';
import {
  InputClear,
  type InputFocusOptions,
  type InputSemanticValue,
  type InputVariant,
  type TextControlProps,
  useTextControl,
  useTextControlRef,
} from './input-shared';

export type InputSemanticPart =
  | 'root'
  | 'input'
  | 'prefix'
  | 'suffix'
  | 'clear'
  | 'count'
  | 'addonBefore'
  | 'addonAfter';
export type InputRef = HTMLInputElement & {
  input: HTMLInputElement;
  nativeElement: HTMLDivElement;
  focus: (options?: InputFocusOptions) => void;
};

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'>,
    TextControlProps<HTMLInputElement> {
  size?: TaoSize;
  variant?: InputVariant;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Attached content before the input. Prefer composition for complex controls. */
  addonBefore?: ReactNode;
  addonAfter?: ReactNode;
  error?: boolean;
  status?: TaoStatus;
  classNames?: InputSemanticValue<
    SemanticClassNames<InputSemanticPart>,
    InputProps
  >;
  styles?: InputSemanticValue<SemanticStyles<InputSemanticPart>, InputProps>;
}

export const BaseInput = forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    const {
      size,
      variant,
      prefix,
      suffix,
      error,
      status,
      disabled,
      className,
      style,
      classNames: customClassNames,
      styles: customStyles,
      allowClear,
      onClear,
      showCount,
      count,
      onPressEnter,
      addonBefore,
      addonAfter,
      onChange,
      onKeyDown,
      onCompositionStart,
      onCompositionEnd,
      value,
      defaultValue,
      ...rest
    } = props;
    const classNames =
      typeof customClassNames === 'function'
        ? customClassNames({ props })
        : customClassNames;
    const styles =
      typeof customStyles === 'function'
        ? customStyles({ props })
        : customStyles;
    const innerRef = useRef<HTMLInputElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const field = useTextControl(props, innerRef);
    useTextControlRef(ref, innerRef, rootRef);
    const ctx = useTaoConfig();
    const resolvedSize = size ?? ctx.size;
    const resolvedVariant = variant ?? ctx.variant;
    const resolvedDisabled = disabled ?? ctx.disabled;

    return (
      <div
        ref={rootRef}
        className={cx(classNames?.root, className)}
        style={{ ...styles?.root, ...style }}
        data-tao-control=""
        data-tao-input=""
        data-tao-size={resolvedSize}
        data-tao-variant={resolvedVariant}
        data-tao-error={status === 'error' || error || undefined}
        data-tao-warning={status === 'warning' || undefined}
        data-disabled={resolvedDisabled || undefined}
      >
        {addonBefore != null && (
          <span
            data-tao-input-addon=""
            className={classNames?.addonBefore}
            style={styles?.addonBefore}
          >
            {addonBefore}
          </span>
        )}
        {prefix != null && (
          <span
            className={classNames?.prefix}
            style={styles?.prefix}
            data-tao-prefix=""
          >
            {prefix}
          </span>
        )}
        <input
          {...rest}
          value={field.value}
          ref={innerRef}
          className={classNames?.input}
          style={styles?.input}
          disabled={resolvedDisabled}
          aria-invalid={
            status === 'error' || error ? true : rest['aria-invalid']
          }
          onChange={field.change}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (
              event.key === 'Enter' &&
              !event.defaultPrevented &&
              !field.composing.current &&
              !event.nativeEvent.isComposing &&
              event.keyCode !== 229
            )
              onPressEnter?.(event);
          }}
          onCompositionStart={(event) => {
            field.composing.current = true;
            onCompositionStart?.(event);
          }}
          onCompositionEnd={(event) => {
            field.composing.current = false;
            if (
              field.normalize(event.currentTarget.value) !==
              event.currentTarget.value
            )
              field.change({ ...event, target: event.currentTarget });
            onCompositionEnd?.(event);
          }}
        />
        {allowClear && field.value && !resolvedDisabled && !rest.readOnly && (
          <InputClear
            config={allowClear}
            onClick={field.clear}
            className={classNames?.clear}
            style={styles?.clear}
          />
        )}
        {suffix != null && (
          <span
            className={classNames?.suffix}
            style={styles?.suffix}
            data-tao-suffix=""
          >
            {suffix}
          </span>
        )}
        {field.counter != null && (
          <span
            data-tao-input-count=""
            data-tao-exceeded={field.exceeded || undefined}
            className={classNames?.count}
            style={styles?.count}
          >
            {field.counter}
          </span>
        )}
        {addonAfter != null && (
          <span
            data-tao-input-addon=""
            className={classNames?.addonAfter}
            style={styles?.addonAfter}
          >
            {addonAfter}
          </span>
        )}
      </div>
    );
  },
);
