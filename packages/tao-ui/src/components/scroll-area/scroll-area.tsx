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
  const firedScrollEnd = useRef(false);
  const lastScrollTop = useRef(0);
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
    const nearBottom =
      direction !== 'horizontal' &&
      scrollHeight > clientHeight &&
      scrollTop + clientHeight >= scrollHeight - scrollEndThreshold;
    if (!nearBottom) firedScrollEnd.current = false;
    return nearBottom;
  }, [direction, textDirection, scrollEndThreshold]);

  // Observe content size changes
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateScrollState);
    const observeContent = () => {
      observer.disconnect();
      observer.observe(el);
      for (const child of el.children) observer.observe(child);
      updateScrollState();
    };
    const mutations = new MutationObserver(observeContent);
    mutations.observe(el, { childList: true });
    observeContent();
    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, [updateScrollState]);

  // ---- Scroll handler ----
  const handleScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      const movedVertically = scrollTop !== lastScrollTop.current;
      lastScrollTop.current = scrollTop;
      const nearBottom = updateScrollState();
      onScrollProp?.(e);

      if (
        onScrollEnd &&
        movedVertically &&
        nearBottom &&
        !firedScrollEnd.current
      ) {
        firedScrollEnd.current = true;
        onScrollEnd();
      }
    },
    [updateScrollState, onScrollProp, onScrollEnd],
  );

  // ---- Thumb drag ----
  const activeDrag = useRef<{ thumb: Element; cleanup: () => void } | null>(
    null,
  );
  useEffect(() => () => activeDrag.current?.cleanup(), []);
  useEffect(() => {
    const drag = activeDrag.current;
    if (drag && !viewportRef.current?.parentElement?.contains(drag.thumb)) {
      drag.cleanup();
    }
  });

  const handleThumbPointerDown = useCallback(
    (axis: 'x' | 'y', e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      activeDrag.current?.cleanup();
      const el = viewportRef.current;
      if (!el) return;

      const thumb = e.currentTarget;
      const ownerDocument = thumb.ownerDocument;
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
        ownerDocument.removeEventListener('pointermove', handleMove);
        ownerDocument.removeEventListener('pointerup', handleEnd);
        ownerDocument.removeEventListener('pointercancel', handleEnd);
        activeDrag.current = null;
      };
      const handleEnd = (ev: PointerEvent) => {
        if (ev.pointerId === pointerId) cleanup();
      };
      activeDrag.current = { thumb, cleanup };

      ownerDocument.addEventListener('pointermove', handleMove);
      ownerDocument.addEventListener('pointerup', handleEnd);
      ownerDocument.addEventListener('pointercancel', handleEnd);
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
      const trackSize = axis === 'y' ? rect.height : rect.width;
      if (trackSize <= 0) return;
      const clickPos =
        (axis === 'y' ? e.clientY - rect.top : e.clientX - rect.left) /
        trackSize;

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
