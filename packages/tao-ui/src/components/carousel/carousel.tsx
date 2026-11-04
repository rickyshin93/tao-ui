import SlickCarousel, {
  type CustomArrowProps,
  type Settings,
} from '@ant-design/react-slick';
import {
  Children,
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { useTaoInternalConfig } from '../../provider/tao-provider';
import { interopDefault } from '../../utils/interop-default';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './carousel.css';

const SlickCarouselComponent = /*#__PURE__*/ interopDefault(SlickCarousel);

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
  innerSlider: NonNullable<SlickCarousel['innerSlider']>;
}
type InnerSlider = NonNullable<SlickCarousel['innerSlider']> & {
  autoPlay: CarouselRef['autoPlay'];
};
function Arrow({
  currentSlide: _current,
  slideCount: _count,
  ...props
}: CustomArrowProps & { 'aria-label': string }) {
  return (
    <button type="button" {...props}>
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
      rtl = false,
      children,
      effect = 'scrollx',
      slickGoTo,
      prefixCls,
      classNames,
      styles,
      appendDots,
      ...rest
    } = props;
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
    const isRtl = rtl && !isVertical;
    const sliderRef = useRef<SlickCarousel>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const count = Children.count(children);
    useImperativeHandle(
      ref,
      () => ({
        nativeElement: rootRef.current!,
        goTo: (slide, dontAnimate = false) =>
          sliderRef.current!.slickGoTo(slide, dontAnimate),
        next: () => sliderRef.current!.slickNext(),
        prev: () => sliderRef.current!.slickPrev(),
        autoPlay: (playType) =>
          (sliderRef.current!.innerSlider as InnerSlider).autoPlay(playType),
        get innerSlider() {
          return sliderRef.current!.innerSlider!;
        },
      }),
      [],
    );
    useEffect(() => {
      if (count > 0)
        sliderRef.current!.slickGoTo(
          isRtl ? count - initialSlide - 1 : initialSlide,
          true,
        );
    }, [count, initialSlide, isRtl]);
    useEffect(() => {
      if (slickGoTo !== undefined) sliderRef.current!.slickGoTo(slickGoTo);
    }, [slickGoTo]);
    return (
      <div
        ref={rootRef}
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
          appendDots={
            appendDots ?? ((items) => <ul style={styles?.dots}>{items}</ul>)
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
          {children}
        </SlickCarouselComponent>
      </div>
    );
  },
);
