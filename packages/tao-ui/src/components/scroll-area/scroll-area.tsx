import {
  type CSSProperties,
  type ReactNode,
  type UIEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTaoConfig, useTaoDirection } from '../../provider/tao-provider';
import { getScrollLeft, setScrollLeft } from '../../utils/scroll-left';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './scroll-area.css';

// ---- Types ----

export type ScrollAreaSemanticPart =
  | 'root'
  | 'viewport'
  | 'scrollbar'
  | 'thumb';

export type ScrollAreaType = 'auto' | 'always' | 'hover' | 'scroll';

export interface ScrollAreaProps {
  children?: ReactNode;
  /** Scrollbar visibility behavior */
  type?: ScrollAreaType;
  /** Scroll direction */
  direction?: 'vertical' | 'horizontal' | 'both';
  /** Max height — enables vertical scroll */
  maxHeight?: number | string;
  /** Max width — enables horizontal scroll */
  maxWidth?: number | string;
  /** Scrollbar size in px */
  scrollbarSize?: number;
  /** Offset from edges in px */
  scrollbarOffset?: number;
  /** Show scroll shadows at edges */
  scrollShadow?: boolean;
  /** Callback on scroll */
  onScroll?: (e: UIEvent<HTMLDivElement>) => void;
  /** Callback when scrolled to bottom (threshold in px) */
  onScrollEnd?: () => void;
  /** Threshold in px for onScrollEnd */
  scrollEndThreshold?: number;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<ScrollAreaSemanticPart>;
  styles?: SemanticStyles<ScrollAreaSemanticPart>;
}

// ---- ScrollArea ----

export function ScrollArea({
  children,
  type = 'hover',
  direction = 'vertical',
  maxHeight,
  maxWidth,
  scrollbarSize = 6,
  scrollbarOffset = 2,
  scrollShadow = false,
  onScroll: onScrollProp,
  onScrollEnd,
  scrollEndThreshold = 10,
  className,
  style,
  classNames,
  styles,
}: ScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  // ---- Scrollbar state ----
  const [scrollState, setScrollState] = useState({
    hasVertical: false,
    hasHorizontal: false,
    thumbYRatio: 0, // thumb height as fraction of track
    thumbXRatio: 0, // thumb width as fraction of track
    thumbYOffset: 0, // thumb top position as fraction
    thumbXOffset: 0, // thumb left position as fraction
    atTop: true,
    atBottom: true,
    atLeft: true,
    atRight: true,
  });

  const [textDirection, directionRef] = useTaoDirection(undefined, 'self');
  const { locale } = useTaoConfig();
  const updateScrollState = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, scrollWidth, clientHeight, clientWidth } =
      el;

    const scrollLeft = getScrollLeft(
      el,
      getComputedStyle(el).direction || textDirection,
    );
    const hasV = scrollHeight > clientHeight + 1;
    const hasH = scrollWidth > clientWidth + 1;

    setScrollState({
      hasVertical: hasV,
      hasHorizontal: hasH,
      thumbYRatio: hasV ? clientHeight / scrollHeight : 0,
      thumbXRatio: hasH ? clientWidth / scrollWidth : 0,
      thumbYOffset: hasV
        ? Math.max(0, Math.min(1, scrollTop / (scrollHeight - clientHeight)))
        : 0,
      thumbXOffset: hasH
        ? Math.max(0, Math.min(1, scrollLeft / (scrollWidth - clientWidth)))
        : 0,
      atTop: scrollTop <= 1,
      atBottom: scrollTop + clientHeight >= scrollHeight - 1,
      atLeft: scrollLeft <= 1,
      atRight: scrollLeft + clientWidth >= scrollWidth - 1,
    });
  }, [textDirection]);

  // Observe content size changes
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    updateScrollState();
    const observer = new ResizeObserver(() => updateScrollState());
    observer.observe(el);
    // Also observe first child if exists
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [updateScrollState]);

  // ---- Scroll handler ----
  const firedScrollEnd = useRef(false);

  const handleScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => {
      updateScrollState();
      onScrollProp?.(e);

      // onScrollEnd detection
      if (onScrollEnd) {
        const el = e.currentTarget;
        const { scrollTop, scrollHeight, clientHeight } = el;
        const nearBottom =
          scrollTop + clientHeight >= scrollHeight - scrollEndThreshold;
        if (nearBottom && !firedScrollEnd.current) {
          firedScrollEnd.current = true;
          onScrollEnd();
        } else if (!nearBottom) {
          firedScrollEnd.current = false;
        }
      }
    },
    [updateScrollState, onScrollProp, onScrollEnd, scrollEndThreshold],
  );

  // ---- Thumb drag ----
  const dragCleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => dragCleanup.current?.(), []);

  const handleThumbPointerDown = useCallback(
    (axis: 'x' | 'y', e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCleanup.current?.();
      const el = viewportRef.current;
      if (!el) return;

      const thumb = e.currentTarget;
      const track = thumb.parentElement;
      if (!track) return;
      const pos = axis === 'y' ? e.clientY : e.clientX;
      const scroll = axis === 'y' ? el.scrollTop : getScrollLeft(el);
      const pointerId = e.pointerId;

      const handleMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId || !viewportRef.current) return;
        const delta = (axis === 'y' ? ev.clientY : ev.clientX) - pos;
        const vp = viewportRef.current;
        const trackRect = track.getBoundingClientRect();
        const thumbRect = thumb.getBoundingClientRect();
        const travel =
          axis === 'y'
            ? trackRect.height - thumbRect.height
            : trackRect.width - thumbRect.width;
        const maxScroll =
          axis === 'y'
            ? vp.scrollHeight - vp.clientHeight
            : vp.scrollWidth - vp.clientWidth;
        if (travel <= 0 || maxScroll <= 0) return;
        const nextScroll = Math.max(
          0,
          Math.min(maxScroll, scroll + (delta / travel) * maxScroll),
        );

        if (axis === 'y') vp.scrollTop = nextScroll;
        else setScrollLeft(vp, nextScroll);
      };

      const cleanup = () => {
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', handleEnd);
        document.removeEventListener('pointercancel', handleEnd);
        dragCleanup.current = null;
      };
      const handleEnd = (ev: PointerEvent) => {
        if (ev.pointerId === pointerId) cleanup();
      };
      dragCleanup.current = cleanup;

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointerup', handleEnd);
      document.addEventListener('pointercancel', handleEnd);
    },
    [],
  );

  // ---- Track click (jump to position) ----
  const handleTrackClick = useCallback(
    (axis: 'x' | 'y', e: React.MouseEvent) => {
      const el = viewportRef.current;
      if (!el) return;
      // Don't handle if click was on thumb
      if ((e.target as HTMLElement).hasAttribute('data-tao-scroll-thumb'))
        return;

      const rect = e.currentTarget.getBoundingClientRect();
      const clickPos =
        axis === 'y'
          ? (e.clientY - rect.top) / rect.height
          : (e.clientX - rect.left) / rect.width;

      if (axis === 'y') {
        el.scrollTop = clickPos * (el.scrollHeight - el.clientHeight);
      } else {
        setScrollLeft(el, clickPos * (el.scrollWidth - el.clientWidth));
      }
    },
    [],
  );

  // ---- Compute styles ----
  const showVertical = direction === 'vertical' || direction === 'both';
  const showHorizontal = direction === 'horizontal' || direction === 'both';

  const rootStyle: CSSProperties = {
    maxHeight: maxHeight ?? undefined,
    maxWidth: maxWidth ?? undefined,
  };

  const viewportStyle: CSSProperties = {
    overflowY: showVertical ? 'scroll' : 'hidden',
    overflowX: showHorizontal ? 'scroll' : 'hidden',
    ...styles?.viewport,
  };

  const scrollbarVars = {
    '--tao-scrollbar-size': `${scrollbarSize}px`,
    '--tao-scrollbar-offset': `${scrollbarOffset}px`,
  } as CSSProperties;

  return (
    <div
      ref={directionRef}
      data-tao-scroll-area=""
      data-tao-scroll-type={type}
      data-tao-has-v={scrollState.hasVertical || undefined}
      data-tao-has-h={scrollState.hasHorizontal || undefined}
      className={cx(classNames?.root, className)}
      style={{ ...rootStyle, ...scrollbarVars, ...styles?.root, ...style }}
    >
      <div
        ref={viewportRef}
        data-tao-scroll-viewport=""
        className={cx(classNames?.viewport)}
        style={viewportStyle}
        onScroll={handleScroll}
      >
        {children}
      </div>

      {/* Scroll shadows */}
      {scrollShadow && showVertical && (
        <>
          <div
            data-tao-scroll-shadow="top"
            data-tao-visible={!scrollState.atTop || undefined}
          />
          <div
            data-tao-scroll-shadow="bottom"
            data-tao-visible={!scrollState.atBottom || undefined}
          />
        </>
      )}
      {scrollShadow && showHorizontal && (
        <>
          <div
            data-tao-scroll-shadow="left"
            data-tao-visible={!scrollState.atLeft || undefined}
          />
          <div
            data-tao-scroll-shadow="right"
            data-tao-visible={!scrollState.atRight || undefined}
          />
        </>
      )}

      {/* Vertical scrollbar */}
      {showVertical && scrollState.hasVertical && (
        <button
          type="button"
          data-tao-scrollbar=""
          data-tao-orientation="vertical"
          aria-label={locale.messages.scrollVertically}
          className={cx(classNames?.scrollbar)}
          style={styles?.scrollbar}
          onClick={(e) => handleTrackClick('y', e)}
        >
          <div
            data-tao-scroll-thumb=""
            data-tao-orientation="vertical"
            className={cx(classNames?.thumb)}
            style={{
              height: `${Math.max(scrollState.thumbYRatio * 100, 10)}%`,
              top: `${scrollState.thumbYOffset * 100}%`,
              transform: `translateY(-${scrollState.thumbYOffset * 100}%)`,
              ...styles?.thumb,
            }}
            onPointerDown={(e) => handleThumbPointerDown('y', e)}
          />
        </button>
      )}

      {/* Horizontal scrollbar */}
      {showHorizontal && scrollState.hasHorizontal && (
        <button
          type="button"
          data-tao-scrollbar=""
          data-tao-orientation="horizontal"
          aria-label={locale.messages.scrollHorizontally}
          className={cx(classNames?.scrollbar)}
          style={styles?.scrollbar}
          onClick={(e) => handleTrackClick('x', e)}
        >
          <div
            data-tao-scroll-thumb=""
            data-tao-orientation="horizontal"
            className={cx(classNames?.thumb)}
            style={{
              width: `${Math.max(scrollState.thumbXRatio * 100, 10)}%`,
              left: `${scrollState.thumbXOffset * 100}%`,
              transform: `translateX(-${scrollState.thumbXOffset * 100}%)`,
              ...styles?.thumb,
            }}
            onPointerDown={(e) => handleThumbPointerDown('x', e)}
          />
        </button>
      )}
    </div>
  );
}
