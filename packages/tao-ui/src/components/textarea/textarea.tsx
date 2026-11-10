import {
  type ForwardedRef,
  forwardRef,
  type Ref,
  type TextareaHTMLAttributes,
  useCallback,
  useLayoutEffect,
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
  const countRef = useRef<HTMLSpanElement>(null);
  const field = useTextControl(props, innerRef);
  const hasCount = field.counter != null;
  useTextControlRef(ref, innerRef, rootRef);
  const [measuredStyle, setMeasuredStyle] = useState<{
    height: number;
    overflowY: 'auto' | 'hidden';
  }>();

  const resize = useCallback(() => {
    const el = innerRef.current;
    if (!el || !autoSize) return;
    const previousHeight = el.style.height;
    el.style.height = 'auto';
    const cs = getComputedStyle(el);
    const lineHeight = Number.parseFloat(cs.lineHeight) || 0;
    const padding =
      (Number.parseFloat(cs.paddingTop) || 0) +
      (Number.parseFloat(cs.paddingBottom) || 0);
    const border =
      (Number.parseFloat(cs.borderTopWidth) || 0) +
      (Number.parseFloat(cs.borderBottomWidth) || 0);
    // scrollHeight includes padding and excludes borders.
    const offset = cs.boxSizing === 'content-box' ? -padding : border;
    const rowOffset = padding + offset;
    const opts = typeof autoSize === 'object' ? autoSize : {};
    let height = Math.max(0, el.scrollHeight + offset);
    if (opts.minRows) {
      height = Math.max(height, opts.minRows * lineHeight + rowOffset);
    }
    let overflowY: 'auto' | 'hidden' = 'hidden';
    if (opts.maxRows) {
      const max = opts.maxRows * lineHeight + rowOffset;
      if (height > max) {
        height = max;
        overflowY = 'auto';
      }
    }
    el.style.height = previousHeight;
    setMeasuredStyle((previous) =>
      previous?.height === height && previous.overflowY === overflowY
        ? previous
        : { height, overflowY },
    );
  }, [autoSize]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure on value change
  useLayoutEffect(() => {
    resize();
  }, [resize, field.value]);

  useLayoutEffect(() => {
    if (!hasCount) return;
    const count = countRef.current;
    const root = rootRef.current;
    if (!count || !root) return;
    const update = () => {
      root.style.setProperty('--tao-textarea-count-width', `${count.offsetWidth}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(count);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--tao-textarea-count-width');
    };
  }, [hasCount]);

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
        style={
          autoSize
            ? { ...styles?.textarea, ...measuredStyle }
            : styles?.textarea
        }
        disabled={resolvedDisabled}
        aria-invalid={status === 'error' || error ? true : rest['aria-invalid']}
        data-tao-autosize={autoSize ? '' : undefined}
        onChange={field.change}
        onBlur={field.blur}
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
          field.endComposition(event);
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
      {hasCount && (
        <span
          ref={countRef}
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
