import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './affix.css';
export type AffixSemanticPart = 'root' | 'content';
export interface AffixProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  offsetTop?: number;
  offsetBottom?: number;
  onChange?: (affixed?: boolean) => void;
  target?: () => Window | HTMLElement | null;
  prefixCls?: string;
  rootClassName?: string;
  children: ReactNode;
  classNames?: SemanticClassNames<AffixSemanticPart>;
  styles?: SemanticStyles<AffixSemanticPart>;
}
export interface AffixRef {
  updatePosition: (() => void) & { cancel: () => void };
}
interface Position {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  height: number;
}
const getWindow = () => window;
export const Affix = forwardRef<AffixRef, AffixProps>((props, ref) => {
  const {
    offsetTop,
    offsetBottom,
    onChange,
    target = getWindow,
    prefixCls,
    rootClassName,
    className,
    style,
    classNames,
    styles,
    children,
    ...rest
  } = props;
  const holder = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>();
  const affixed = useRef(false);
  const measure = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    measure.current = () => {
      const node = holder.current;
      const inner = content.current;
      const scrollTarget = target();
      if (!node || !inner) return;
      let next: Position | undefined;
      if (scrollTarget) {
        const rect = node.getBoundingClientRect();
        const bounds =
          scrollTarget === window
            ? { top: 0, bottom: window.innerHeight }
            : (scrollTarget as HTMLElement).getBoundingClientRect();
        const topOffset =
          offsetTop ?? (offsetBottom === undefined ? 0 : undefined);
        const top =
          topOffset !== undefined &&
          Math.round(rect.top) - topOffset < Math.round(bounds.top)
            ? bounds.top + topOffset
            : undefined;
        const bottom =
          offsetBottom !== undefined &&
          Math.round(rect.bottom) + offsetBottom > Math.round(bounds.bottom)
            ? window.innerHeight - bounds.bottom + offsetBottom
            : undefined;
        if (top !== undefined || bottom !== undefined)
          next = {
            ...(top !== undefined ? { top } : { bottom }),
            left: rect.left,
            width: rect.width,
            height: inner.getBoundingClientRect().height,
          };
      }
      const fixed = next !== undefined;
      if (fixed !== affixed.current) {
        affixed.current = fixed;
        onChange?.(fixed);
      }
      setPosition((previous) =>
        previous?.top === next?.top &&
        previous?.bottom === next?.bottom &&
        previous?.left === next?.left &&
        previous?.width === next?.width &&
        previous?.height === next?.height
          ? previous
          : next,
      );
    };
  });
  const updatePosition = useMemo(() => {
    let frame: number | undefined;
    const update = () => {
      if (frame === undefined)
        frame = requestAnimationFrame(() => {
          frame = undefined;
          measure.current();
        });
    };
    update.cancel = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
    };
    return update;
  }, []);
  useImperativeHandle(ref, () => ({ updatePosition }), [updatePosition]);
  useEffect(() => {
    const scrollTarget = target();
    const events = [
      'resize',
      'scroll',
      'touchstart',
      'touchmove',
      'touchend',
      'pageshow',
      'load',
    ];
    events.forEach((event) => {
      scrollTarget?.addEventListener(event, updatePosition, { passive: true });
    });
    if (scrollTarget !== window)
      window.addEventListener('resize', updatePosition);
    const observer = new ResizeObserver(updatePosition);
    if (holder.current) observer.observe(holder.current);
    if (content.current) observer.observe(content.current);
    if (scrollTarget instanceof HTMLElement) observer.observe(scrollTarget);
    updatePosition();
    return () => {
      events.forEach((event) => {
        scrollTarget?.removeEventListener(event, updatePosition);
      });
      window.removeEventListener('resize', updatePosition);
      observer.disconnect();
      updatePosition.cancel();
    };
  }, [target, updatePosition]);
  useLayoutEffect(() => {
    updatePosition();
  });
  const fixedStyle: CSSProperties = position
    ? { position: 'fixed', ...position }
    : {};
  return (
    <div
      {...rest}
      ref={holder}
      data-tao-affix=""
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      {position && (
        <div
          aria-hidden="true"
          style={{ width: position.width, height: position.height }}
        />
      )}
      <div
        ref={content}
        data-tao-affix-content=""
        data-tao-affixed={position !== undefined || undefined}
        className={cx(
          classNames?.content,
          position && prefixCls,
          position && rootClassName,
        )}
        style={{ ...styles?.content, ...fixedStyle }}
      >
        {children}
      </div>
    </div>
  );
});
Affix.displayName = 'Affix';
