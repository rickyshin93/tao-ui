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
  type TaoVariant,
  useTaoConfig,
} from '../../provider/tao-provider';
import { mergeRefs } from '../../utils/refs';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './textarea.css';

export type TextareaSemanticPart = 'root' | 'textarea';

export interface AutoSizeOptions {
  minRows?: number;
  maxRows?: number;
}

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?: TaoSize;
  variant?: TaoVariant;
  error?: boolean;
  status?: TaoStatus;
  ref?: Ref<HTMLTextAreaElement>;
  /** Auto-grow height to fit content. `true` grows freely; pass min/max rows to clamp. */
  autoSize?: boolean | AutoSizeOptions;
  classNames?: SemanticClassNames<TextareaSemanticPart>;
  styles?: SemanticStyles<TextareaSemanticPart>;
}

export const Textarea = forwardRef(function Textarea(
  {
    size,
    variant,
    error,
    status,
    disabled,
    autoSize,
    className,
    style,
    classNames,
    styles,
    onChange,
    ...rest
  }: TextareaProps,
  ref: ForwardedRef<HTMLTextAreaElement>,
) {
  const ctx = useTaoConfig();
  const resolvedSize = size ?? ctx.size;
  const resolvedVariant = variant ?? ctx.variant;
  const resolvedDisabled = disabled ?? ctx.disabled;
  const innerRef = useRef<HTMLTextAreaElement>(null);

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
  }, [resize, rest.value, rest.defaultValue]);

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
        value={'value' in rest ? (rest.value ?? '') : undefined}
        ref={mergeRefs(innerRef, ref)}
        className={classNames?.textarea}
        style={styles?.textarea}
        disabled={resolvedDisabled}
        aria-invalid={status === 'error' || error ? true : rest['aria-invalid']}
        data-tao-autosize={autoSize ? '' : undefined}
        onChange={(e) => {
          if (autoSize) resize();
          onChange?.(e);
        }}
      />
    </div>
  );
});
