import {
  type ForwardedRef,
  forwardRef,
  type Ref,
  type TextareaHTMLAttributes,
  useCallback,
  useLayoutEffect,
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
import {
  InputClear,
  type InputFocusOptions,
  type InputSemanticValue,
  type InputVariant,
  type TextControlProps,
  useTextControl,
  useTextControlRef,
} from '../input/input-shared';
import './textarea.css';

export type TextareaSemanticPart = 'root' | 'textarea' | 'clear' | 'count';
export type TextareaRef = HTMLTextAreaElement & {
  textArea: HTMLTextAreaElement;
  nativeElement: HTMLDivElement;
  focus: (options?: InputFocusOptions) => void;
};

export interface AutoSizeOptions {
  minRows?: number;
  maxRows?: number;
}

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    TextControlProps<HTMLTextAreaElement> {
  size?: TaoSize;
  variant?: InputVariant;
  error?: boolean;
  status?: TaoStatus;
  ref?: Ref<HTMLTextAreaElement>;
  /** Auto-grow height to fit content. `true` grows freely; pass min/max rows to clamp. */
  autoSize?: boolean | AutoSizeOptions;
  classNames?: InputSemanticValue<
    SemanticClassNames<TextareaSemanticPart>,
    TextareaProps
  >;
  styles?: InputSemanticValue<
    SemanticStyles<TextareaSemanticPart>,
    TextareaProps
  >;
}

export const Textarea = forwardRef(function Textarea(
  props: TextareaProps,
  ref: ForwardedRef<HTMLTextAreaElement>,
) {
  const {
    size,
    variant,
    error,
    status,
    disabled,
    autoSize,
    className,
    style,
    classNames: customClassNames,
    styles: customStyles,
    allowClear,
    onClear,
    count,
    showCount,
    onPressEnter,
    onKeyDown,
    onCompositionStart,
    onCompositionEnd,
    value,
    defaultValue,
    onChange,
    ...rest
  } = props;
  const classNames =
    typeof customClassNames === 'function'
      ? customClassNames({ props })
      : customClassNames;
  const styles =
    typeof customStyles === 'function' ? customStyles({ props }) : customStyles;
  const ctx = useTaoConfig();
  const resolvedSize = size ?? ctx.size;
  const resolvedVariant = variant ?? ctx.variant;
  const resolvedDisabled = disabled ?? ctx.disabled;
  const innerRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const field = useTextControl(props, innerRef);
  useTextControlRef(ref, innerRef, rootRef);

  const resize = useCallback(() => {
    const el = innerRef.current;
    if (!el || !autoSize) return;
    el.style.height = 'auto';
    const cs = getComputedStyle(el);
    const lineHeight = Number.parseFloat(cs.lineHeight) || 0;
    const padV =
      Number.parseFloat(cs.paddingTop) + Number.parseFloat(cs.paddingBottom);
    const opts = typeof autoSize === 'object' ? autoSize : {};
    let height = el.scrollHeight;
    if (opts.minRows) {
      height = Math.max(height, opts.minRows * lineHeight + padV);
    }
    let overflowY = 'hidden';
    if (opts.maxRows) {
      const max = opts.maxRows * lineHeight + padV;
      if (height > max) {
        height = max;
        overflowY = 'auto';
      }
    }
    el.style.height = `${height}px`;
    el.style.overflowY = overflowY;
  }, [autoSize]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure on value change
  useLayoutEffect(() => {
    resize();
  }, [resize, field.value]);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el || !autoSize) return;
    let width: number | undefined;
    let frame = 0;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === width) return;
      width = entry.contentRect.width;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(resize);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [autoSize, resize]);

  return (
    <div
      ref={rootRef}
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      data-tao-control=""
      data-tao-textarea=""
      data-tao-size={resolvedSize}
      data-tao-variant={resolvedVariant}
      data-tao-error={status === 'error' || error || undefined}
      data-tao-warning={status === 'warning' || undefined}
      data-disabled={resolvedDisabled || undefined}
    >
      <textarea
        {...rest}
        value={field.value}
        ref={innerRef}
        className={classNames?.textarea}
        style={styles?.textarea}
        disabled={resolvedDisabled}
        aria-invalid={status === 'error' || error ? true : rest['aria-invalid']}
        data-tao-autosize={autoSize ? '' : undefined}
        onChange={(e) => {
          if (autoSize) resize();
          field.change(e);
        }}
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
    </div>
  );
});
