import SlickCarousel, {
  type CustomArrowProps,
  type Settings,
} from '@ant-design/react-slick';
import {
  Children,
  type CSSProperties,
  cloneElement,
  forwardRef,
  isValidElement,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useTaoDirection,
  useTaoInternalConfig,
} from '../../provider/tao-provider';
import { interopDefault } from '../../utils/interop-default';
import { mergeRefs } from '../../utils/refs';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './carousel.css';

const SlickCarouselComponent = /*#__PURE__*/ interopDefault(SlickCarousel);

function useResponsiveSettings(responsive: Settings['responsive']) {
  // null means the initial viewport is still unknown; undefined means no match.
  const [settings, setSettings] = useState<
    Settings | 'unslick' | null | undefined
  >(responsive?.length ? null : undefined);
  useEffect(() => {
    const queries = [...(responsive ?? [])]
      .sort((a, b) => a.breakpoint - b.breakpoint)
      .map(({ breakpoint, settings }) => ({
        media: window.matchMedia(`(max-width: ${breakpoint}px)`),
        settings,
      }));
    const update = () =>
      setSettings(queries.find(({ media }) => media.matches)?.settings);
    update();
    for (const { media } of queries) media.addEventListener('change', update);
    return () => {
      for (const { media } of queries)
        media.removeEventListener('change', update);
    };
  }, [responsive]);
  return settings;
}

export type CarouselEffect = 'scrollx' | 'fade';
export type DotPlacement = 'top' | 'bottom' | 'start' | 'end';
export type CarouselSemanticPart = 'root' | 'dots';
export interface CarouselProps
  extends Omit<
    Settings,
    'dots' | 'dotsClass' | 'autoplay' | 'verticalSwiping'
  > {
  effect?: CarouselEffect;
  style?: CSSProperties;
  prefixCls?: string;
  rootClassName?: string;
  id?: string;
  slickGoTo?: number;
  dotPosition?: DotPlacement | 'left' | 'right';
  dotPlacement?: DotPlacement;
  children?: ReactNode;
  dots?: boolean | { className?: string };
  autoplay?: boolean | { dotDuration?: boolean };
  classNames?: SemanticClassNames<CarouselSemanticPart>;
  styles?: SemanticStyles<CarouselSemanticPart>;
}
export interface CarouselRef {
  nativeElement: HTMLDivElement;
  goTo: (slide: number, dontAnimate?: boolean) => void;
  next: () => void;
  prev: () => void;
  autoPlay: (playType?: 'update' | 'leave' | 'blur') => void;
  innerSlider: SlickCarousel['innerSlider'];
}
type InnerSlider = NonNullable<SlickCarousel['innerSlider']> & {
  autoPlay: CarouselRef['autoPlay'];
};
type DotProps = { onClick?: MouseEventHandler<HTMLElement> };
const defaultPaging = (index: number) => (
  <button type="button">{index + 1}</button>
);
function Arrow({
  currentSlide: _current,
  slideCount: _count,
  ...props
}: CustomArrowProps & { 'aria-label': string }) {
  return (
    <button
      type="button"
      disabled={props.className?.split(' ').includes('slick-disabled')}
      {...props}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d={
            props.className?.includes('slick-prev')
              ? 'm14 5-7 7 7 7'
              : 'm10 5 7 7-7 7'
          }
        />
      </svg>
    </button>
  );
}

export const Carousel = forwardRef<CarouselRef, CarouselProps>(
  function Carousel(props, ref) {
    const { locale, tokenStyle } = useTaoInternalConfig();
    const { responsive, ...baseProps } = props;
    const responsiveSettings = useResponsiveSettings(responsive);
    const unslick = responsiveSettings === 'unslick';
    const {
      dots = true,
      arrows = false,
      prevArrow,
      nextArrow,
      draggable = false,
      waitForAnimate = false,
      dotPosition,
      dotPlacement,
      vertical,
      rootClassName,
      className,
      style,
      id,
      autoplay = false,
      autoplaySpeed = 3000,
      initialSlide = 0,
      rtl,
      children,
      effect = 'scrollx',
      slickGoTo,
      prefixCls,
      classNames,
      styles,
      appendDots,
      customPaging,
      beforeChange,
      afterChange,
      ...rest
    } = { ...baseProps, ...(unslick ? {} : responsiveSettings) };
    const placement =
      dotPlacement ??
      (dotPosition === 'left'
        ? 'start'
        : dotPosition === 'right'
          ? 'end'
          : dotPosition) ??
      'bottom';
    const isVertical =
      vertical ?? (placement === 'start' || placement === 'end');
    const [direction, directionRef] = useTaoDirection(
      rtl === undefined ? undefined : rtl ? 'rtl' : 'ltr',
    );
    const isRtl = direction === 'rtl' && !isVertical;
    const sliderRef = useRef<SlickCarousel>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const mergedRootRef = useMemo(
      () => mergeRefs(rootRef, directionRef),
      [directionRef],
    );
    const slides = Children.map(children, (child) => {
      if (typeof child === 'string' && !child.trim()) return null;
      return typeof child === 'string' || typeof child === 'number'
        ? <span>{child}</span>
        : child;
    });
    const childCount = slides?.length ?? 0;
    const itemsPerSlide = (rest.rows ?? 1) * (rest.slidesPerRow ?? 1);
    const count = Math.ceil(childCount / itemsPerSlide);
    const ready = count > 0 && !unslick && responsiveSettings !== null;
    // Slick numbers RTL slides from the visual left; the public API counts
    // from the first child, so indexes cross this mirror in both directions.
    const mirror = (index: number) => (isRtl ? count - 1 - index : index);
    const previousPosition = useRef<{
      ready: boolean;
      isRtl: boolean;
      initialSlide: number;
      slickGoTo: number | undefined;
    } | null>(null);
    useImperativeHandle(
      ref,
      () => ({
        nativeElement: rootRef.current!,
        goTo: (slide, dontAnimate = false) =>
          sliderRef.current?.slickGoTo(
            isRtl ? count - 1 - slide : slide,
            dontAnimate,
          ),
        next: () =>
          isRtl
            ? sliderRef.current?.slickPrev()
            : sliderRef.current?.slickNext(),
        prev: () =>
          isRtl
            ? sliderRef.current?.slickNext()
            : sliderRef.current?.slickPrev(),
        autoPlay: (playType) =>
          (sliderRef.current?.innerSlider as InnerSlider | undefined)?.autoPlay(
            playType,
          ),
        get innerSlider() {
          return sliderRef.current?.innerSlider;
        },
      }),
      [count, isRtl],
    );
    useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      // Slick hides slides from assistive technology but leaves their controls focusable.
      const syncSlides = () => {
        for (const slide of root.querySelectorAll(
          '.slick-slide[aria-hidden]',
        )) {
          if (slide.closest('[data-tao-carousel]') === root) {
            slide.toggleAttribute(
              'inert',
              slide.getAttribute('aria-hidden') === 'true',
            );
          }
        }
      };
      syncSlides();
      const observer = new MutationObserver(syncSlides);
      observer.observe(root, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['aria-hidden'],
      });
      return () => observer.disconnect();
    }, []);
    useEffect(() => {
      const previous = previousPosition.current;
      previousPosition.current = { ready, isRtl, initialSlide, slickGoTo };
      if (!ready) return;
      if (slickGoTo !== undefined) {
        if (
          !previous?.ready ||
          previous.isRtl !== isRtl ||
          previous.slickGoTo !== slickGoTo
        ) {
          sliderRef.current?.slickGoTo(
            isRtl ? count - slickGoTo - 1 : slickGoTo,
          );
        }
      } else if (
        !previous?.ready ||
        previous.isRtl !== isRtl ||
        previous.initialSlide !== initialSlide
      ) {
        sliderRef.current?.slickGoTo(
          isRtl ? count - initialSlide - 1 : initialSlide,
          true,
        );
      }
    }, [count, initialSlide, isRtl, ready, slickGoTo]);
    return (
      <div
        ref={mergedRootRef}
        dir={direction}
        data-tao-carousel=""
        data-dot-placement={placement}
        data-vertical={isVertical || undefined}
        data-dot-duration={
          (typeof autoplay === 'object' && autoplay.dotDuration) || undefined
        }
        className={cx(prefixCls, classNames?.root, rootClassName, className)}
        id={id}
        style={
          {
            ...tokenStyle,
            '--tao-carousel-duration': `${autoplaySpeed}ms`,
            ...styles?.root,
            ...style,
          } as CSSProperties
        }
      >
        {unslick ? (
          <div className="regular slider">{children}</div>
        ) : (
          <SlickCarouselComponent
            {...rest}
            ref={sliderRef}
            initialSlide={initialSlide}
            fade={effect === 'fade' || !!rest.fade}
            dots={!!dots}
            dotsClass={cx(
              'slick-dots',
              typeof dots === 'object' && dots.className,
              classNames?.dots,
            )}
            appendDots={(items) => {
              // Slick hands RTL dots over in visual-left order; present them,
              // and their indexes, in slide order.
              const dotItems = Children.toArray(items);
              const ordered = (isRtl ? dotItems.reverse() : dotItems).map(
                (item, index) =>
                  isValidElement<{ children: ReactElement<DotProps> }>(item)
                    ? cloneElement(
                        item,
                        undefined,
                        cloneElement((customPaging ?? defaultPaging)(index), {
                          onClick: item.props.children.props.onClick,
                        }),
                      )
                    : item,
              );
              return appendDots ? (
                appendDots(ordered)
              ) : (
                <ul style={styles?.dots}>{ordered}</ul>
              );
            }}
            customPaging={() => <span />}
            beforeChange={
              beforeChange &&
              ((current, next) => beforeChange(mirror(current), mirror(next)))
            }
            afterChange={
              afterChange && ((current) => afterChange(mirror(current)))
            }
            arrows={arrows}
            prevArrow={
              prevArrow ?? (
                <Arrow aria-label={isRtl ? locale.next : locale.previous} />
              )
            }
            nextArrow={
              nextArrow ?? (
                <Arrow aria-label={isRtl ? locale.previous : locale.next} />
              )
            }
            draggable={draggable}
            vertical={isVertical}
            verticalSwiping={isVertical}
            rtl={isRtl}
            autoplay={!!autoplay}
            autoplaySpeed={autoplaySpeed}
            waitForAnimate={waitForAnimate}
          >
            {slides}
          </SlickCarouselComponent>
        )}
      </div>
    );
  },
);
