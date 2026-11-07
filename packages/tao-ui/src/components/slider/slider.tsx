import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import RcSlider, {
  type SliderProps as RcSliderProps,
  type SliderRef,
} from '@rc-component/slider';
import {
  type CSSProperties,
  cloneElement,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  TaoPortalScope,
  useTaoConfig,
  useTaoDirection,
} from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import type { TooltipProps } from '../tooltip/tooltip';
import '../tooltip/tooltip.css';
import './slider.css';
import { interopDefault } from '../../utils/interop-default';

const RcSliderComponent = /*#__PURE__*/ interopDefault(RcSlider);

export type { SliderRef };
export type SliderSemanticPart =
  | 'root'
  | 'tracks'
  | 'track'
  | 'rail'
  | 'handle';
export type SliderMarks = RcSliderProps['marks'];
export type Formatter = ((value?: number) => ReactNode) | null;
export interface SliderTooltipProps
  extends Omit<TooltipProps, 'children' | 'title' | 'placement'> {
  prefixCls?: string;
  placement?:
    | 'top'
    | 'topLeft'
    | 'topRight'
    | 'bottom'
    | 'bottomLeft'
    | 'bottomRight'
    | 'left'
    | 'leftTop'
    | 'leftBottom'
    | 'right'
    | 'rightTop'
    | 'rightBottom';
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
  formatter?: Formatter;
  autoAdjustOverflow?: boolean;
}
export interface SliderBaseProps
  extends Omit<
    RcSliderProps,
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'onAfterChange'
    | 'onChangeComplete'
    | 'range'
    | 'classNames'
    | 'styles'
  > {
  rootClassName?: string;
  orientation?: 'horizontal' | 'vertical';
  direction?: 'ltr' | 'rtl';
  tooltip?: SliderTooltipProps;
  classNames?:
    | SemanticClassNames<SliderSemanticPart>
    | ((info: {
        props: SliderProps;
      }) => SemanticClassNames<SliderSemanticPart>);
  styles?:
    | SemanticStyles<SliderSemanticPart>
    | ((info: { props: SliderProps }) => SemanticStyles<SliderSemanticPart>);
}
export interface SliderSingleProps extends SliderBaseProps {
  range?: false;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onAfterChange?: (value: number) => void;
  onChangeComplete?: (value: number) => void;
}
export interface SliderRangeProps extends SliderBaseProps {
  range: Exclude<RcSliderProps['range'], false | undefined>;
  value?: number[];
  defaultValue?: number[];
  onChange?: (value: number[]) => void;
  onAfterChange?: (value: number[]) => void;
  onChangeComplete?: (value: number[]) => void;
}
export type SliderProps = SliderSingleProps | SliderRangeProps;

function SliderTip({
  children,
  value,
  dragging,
  disabled,
  vertical,
  direction,
  options,
}: {
  children: ReactElement;
  value: number;
  dragging: boolean;
  disabled: boolean;
  vertical: boolean;
  direction: 'ltr' | 'rtl';
  options: SliderTooltipProps;
}) {
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState(options.defaultOpen ?? false);
  const pointerDriven = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  const {
    formatter,
    open,
    placement = vertical ? (direction === 'rtl' ? 'left' : 'right') : 'top',
    getPopupContainer,
    autoAdjustOverflow = true,
    arrow = true,
    prefixCls,
    className,
    classNames,
    styles,
    style,
    color,
    mouseEnterDelay = 0.1,
    mouseLeaveDelay = 0.1,
    onOpenChange,
    defaultOpen,
  } = options;
  const title =
    formatter === null ? null : formatter ? formatter(value) : String(value);
  const side = placement.startsWith('top')
    ? 'top'
    : placement.startsWith('bottom')
      ? 'bottom'
      : placement.startsWith('left')
        ? 'left'
        : 'right';
  const align =
    placement.endsWith('Left') || placement.endsWith('Top')
      ? 'start'
      : placement.endsWith('Right') || placement.endsWith('Bottom')
        ? 'end'
        : 'center';
  const visible =
    title != null &&
    typeof title !== 'boolean' &&
    title !== '' &&
    (open ?? (!disabled && (dragging || active)));
  return (
    <TooltipPrimitive.Provider delayDuration={mouseEnterDelay * 1000}>
      <TooltipPrimitive.Root
        defaultOpen={defaultOpen}
        open={visible}
        onOpenChange={(next) => {
          clearTimeout(closeTimer.current);
          const update = () => {
            setActive(next);
            onOpenChange?.(next);
          };
          if (!next && pointerDriven.current && mouseLeaveDelay > 0)
            closeTimer.current = setTimeout(update, mouseLeaveDelay * 1000);
          else update();
        }}
      >
        <TooltipPrimitive.Trigger
          asChild
          ref={setTrigger}
          onPointerEnter={() => {
            pointerDriven.current = true;
            clearTimeout(closeTimer.current);
          }}
          onBlur={() => {
            pointerDriven.current = false;
          }}
        >
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal
          container={
            trigger && getPopupContainer
              ? getPopupContainer(trigger)
              : undefined
          }
        >
          <TaoPortalScope direction={direction}>
            <TooltipPrimitive.Content
              data-tao-tooltip-content=""
              side={side}
              align={align}
              sideOffset={8}
              avoidCollisions={autoAdjustOverflow}
              updatePositionStrategy="always"
              className={cx(prefixCls, classNames?.content, className)}
              style={{
                ...(color ? { backgroundColor: color } : {}),
                ...styles?.content,
                ...style,
              }}
            >
              {title}
              {arrow && (
                <TooltipPrimitive.Arrow asChild>
                  <span
                    data-tao-tooltip-arrow=""
                    className={classNames?.arrow}
                    style={{
                      ...(color
                        ? ({ '--tao-tooltip-arrow-bg': color } as CSSProperties)
                        : {}),
                      ...styles?.arrow,
                    }}
                  />
                </TooltipPrimitive.Arrow>
              )}
            </TooltipPrimitive.Content>
          </TaoPortalScope>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

const withValueSnapshot = (callback: RcSliderProps['onChange']) =>
  callback
    ? (value: number | number[]) =>
        callback(Array.isArray(value) ? [...value] : value)
    : undefined;

export const Slider = forwardRef<SliderRef, SliderProps>((props, ref) => {
  const {
    prefixCls = 'tao-slider',
    classNames,
    styles,
    rootClassName,
    className,
    style,
    orientation,
    vertical = false,
    direction: directionProp,
    disabled,
    keyboard,
    tooltip = {},
    handleRender,
    reverse,
    ...rest
  } = props;
  const [direction, directionRef] = useTaoDirection(directionProp);
  const config = useTaoConfig();
  const resolvedDisabled = disabled ?? config.disabled;
  const resolvedVertical = orientation ? orientation === 'vertical' : vertical;
  const mergedProps = {
    ...props,
    disabled: resolvedDisabled,
    vertical: resolvedVertical,
  };
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: mergedProps })
      : classNames;
  const semanticStyles =
    typeof styles === 'function' ? styles({ props: mergedProps }) : styles;
  const allDisabled = Array.isArray(resolvedDisabled)
    ? resolvedDisabled.every(Boolean)
    : resolvedDisabled;
  const editableRange = typeof props.range === 'object' && props.range.editable;
  const deletion = useRef<{ value?: number[] } | null>(null);
  const engineProps = rest as RcSliderProps;
  const onChange = withValueSnapshot(engineProps.onChange);
  const onAfterChange = withValueSnapshot(engineProps.onAfterChange);
  const onChangeComplete = withValueSnapshot(engineProps.onChangeComplete);
  return (
    <div
      ref={directionRef}
      data-tao-slider=""
      data-tao-vertical={resolvedVertical ? '' : undefined}
      data-tao-disabled={allDisabled ? '' : undefined}
      dir={direction}
    >
      <RcSliderComponent
        {...engineProps}
        ref={ref}
        prefixCls={prefixCls}
        disabled={resolvedDisabled}
        keyboard={keyboard}
        onBeforeChange={withValueSnapshot(engineProps.onBeforeChange)}
        onChange={
          editableRange
            ? (value) => {
                if (deletion.current && Array.isArray(value))
                  deletion.current.value = value;
                onChange?.(value);
              }
            : onChange
        }
        onAfterChange={onAfterChange}
        onChangeComplete={onChangeComplete}
        vertical={resolvedVertical}
        reverse={direction === 'rtl' && !resolvedVertical ? !reverse : reverse}
        className={cx(classes?.root, rootClassName, className)}
        style={{ ...semanticStyles?.root, ...style }}
        classNames={{
          tracks: cx('tao-slider-tracks-slot', classes?.tracks),
          track: cx('tao-slider-track-slot', classes?.track),
          rail: cx('tao-slider-rail-slot', classes?.rail),
          handle: cx('tao-slider-handle-slot', classes?.handle),
        }}
        styles={semanticStyles}
        handleRender={(node, info) => {
          const handleDisabled = Array.isArray(resolvedDisabled)
            ? !!resolvedDisabled[info.index]
            : !!resolvedDisabled;
          // rc-slider completes on keyup even when it ignored the keydown.
          let handle = node;
          if (handleDisabled || keyboard === false)
            handle = cloneElement(node, { onKeyUp: undefined });
          else if (editableRange)
            handle = cloneElement(node, {
              onKeyDown: (event) => {
                const keyCode = event.which || event.keyCode;
                if (keyCode !== 8 && keyCode !== 46) {
                  node.props.onKeyDown?.(event);
                  return;
                }
                // Deleting a handle removes the keydown target before keyup.
                const change: { value?: number[] } = {};
                deletion.current = change;
                try {
                  node.props.onKeyDown?.(event);
                } finally {
                  deletion.current = null;
                }
                if (change.value) {
                  onAfterChange?.(change.value);
                  onChangeComplete?.(change.value);
                }
              },
            });
          return (
            <SliderTip
              key={info.index}
              value={info.value}
              dragging={info.dragging}
              disabled={handleDisabled}
              vertical={resolvedVertical}
              direction={direction}
              options={tooltip}
            >
              {handleRender ? handleRender(handle, info) : handle}
            </SliderTip>
          );
        }}
      />
    </div>
  );
});
Slider.displayName = 'Slider';
