import {
  type CSSProperties,
  type ReactNode,
  type UIEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cx, type SemanticClassNames, type SemanticStyles } from '../../utils/semantic';
import './scroll-area.css';

// ---- Types ----

export type ScrollAreaSemanticPart = 'root' | 'viewport' | 'scrollbar' | 'thumb';

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
    thumbYRatio: 0,    // thumb height as fraction of track
    thumbXRatio: 0,    // thumb width as fraction of track
    thumbYOffset: 0,   // thumb top position as fraction
    thumbXOffset: 0,   // thumb left position as fraction
    atTop: true,
    atBottom: true,
    atLeft: true,
    atRight: true,
  });

  const updateScrollState = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;

    const {
      scrollTop, scrollLeft,
      scrollHeight, scrollWidth,
      clientHeight, clientWidth,
    } = el;

    const hasV = scrollHeight > clientHeight + 1;
    const hasH = scrollWidth > clientWidth + 1;

    setScrollState({
      hasVertical: hasV,
      hasHorizontal: hasH,
      thumbYRatio: hasV ? clientHeight / scrollHeight : 0,
      thumbXRatio: hasH ? clientWidth / scrollWidth : 0,
      thumbYOffset: hasV ? scrollTop / (scrollHeight - clientHeight) : 0,
      thumbXOffset: hasH ? scrollLeft / (scrollWidth - clientWidth) : 0,
      atTop: scrollTop <= 1,
      atBottom: scrollTop + clientHeight >= scrollHeight - 1,
      atLeft: scrollLeft <= 1,
      atRight: scrollLeft + clientWidth >= scrollWidth - 1,
    });
  }, []);

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
        const nearBottom = scrollTop + clientHeight >= scrollHeight - scrollEndThreshold;
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
  const dragging = useRef<{ axis: 'x' | 'y'; startPos: number; startScroll: number } | null>(null);

  const handleThumbPointerDown = useCallback(
    (axis: 'x' | 'y', e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = viewportRef.current;
      if (!el) return;

      const pos = axis === 'y' ? e.clientY : e.clientX;
      const scroll = axis === 'y' ? el.scrollTop : el.scrollLeft;
      dragging.current = { axis, startPos: pos, startScroll: scroll };

      const handleMove = (ev: PointerEvent) => {
        if (!dragging.current || !viewportRef.current) return;
        const { axis: a, startPos: sp, startScroll: ss } = dragging.current;
        const delta = (a === 'y' ? ev.clientY : ev.clientX) - sp;
        const vp = viewportRef.current;
        const trackSize = a === 'y' ? vp.clientHeight : vp.clientWidth;
        const contentSize = a === 'y' ? vp.scrollHeight : vp.scrollWidth;
        const scrollDelta = (delta / trackSize) * contentSize;

        if (a === 'y') vp.scrollTop = ss + scrollDelta;
        else vp.scrollLeft = ss + scrollDelta;
      };

      const handleUp = () => {
        dragging.current = null;
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', handleUp);
      };

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointerup', handleUp);
    },
    [],
  );

  // ---- Track click (jump to position) ----
  const handleTrackClick = useCallback(
    (axis: 'x' | 'y', e: React.MouseEvent) => {
      const el = viewportRef.current;
      if (!el) return;
      // Don't handle if click was on thumb
      if ((e.target as HTMLElement).hasAttribute('data-tao-scroll-thumb')) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const clickPos = axis === 'y'
        ? (e.clientY - rect.top) / rect.height
        : (e.clientX - rect.left) / rect.width;

      if (axis === 'y') {
        el.scrollTop = clickPos * (el.scrollHeight - el.clientHeight);
      } else {
        el.scrollLeft = clickPos * (el.scrollWidth - el.clientWidth);
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
          <div data-tao-scroll-shadow="top" data-tao-visible={!scrollState.atTop || undefined} />
          <div data-tao-scroll-shadow="bottom" data-tao-visible={!scrollState.atBottom || undefined} />
        </>
      )}
      {scrollShadow && showHorizontal && (
        <>
          <div data-tao-scroll-shadow="left" data-tao-visible={!scrollState.atLeft || undefined} />
          <div data-tao-scroll-shadow="right" data-tao-visible={!scrollState.atRight || undefined} />
        </>
      )}

      {/* Vertical scrollbar */}
      {showVertical && scrollState.hasVertical && (
        <div
          data-tao-scrollbar=""
          data-tao-orientation="vertical"
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
              top: `${scrollState.thumbYOffset * (1 - scrollState.thumbYRatio) * 100}%`,
              ...styles?.thumb,
            }}
            onPointerDown={(e) => handleThumbPointerDown('y', e)}
          />
        </div>
      )}

      {/* Horizontal scrollbar */}
      {showHorizontal && scrollState.hasHorizontal && (
        <div
          data-tao-scrollbar=""
          data-tao-orientation="horizontal"
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
              left: `${scrollState.thumbXOffset * (1 - scrollState.thumbXRatio) * 100}%`,
              ...styles?.thumb,
            }}
            onPointerDown={(e) => handleThumbPointerDown('x', e)}
          />
        </div>
      )}
    </div>
  );
}
