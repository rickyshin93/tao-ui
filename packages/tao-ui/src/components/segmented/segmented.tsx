import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type RefAttributes,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Tooltip, type TooltipProps } from '../tooltip/tooltip';
import './segmented.css';
export type SegmentedValue = string | number;
export type SegmentedSemanticPart = 'root' | 'item' | 'label' | 'icon';
export interface SegmentedLabeledOption<ValueType = SegmentedValue> {
  value: ValueType;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  title?: string;
  className?: string;
  tooltip?: string | Omit<TooltipProps, 'children'>;
}
export type SegmentedOptions<ValueType = SegmentedValue> = (
  | ValueType
  | SegmentedLabeledOption<ValueType>
)[];
export interface SegmentedProps<ValueType = SegmentedValue>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  prefixCls?: string;
  rootClassName?: string;
  options: SegmentedOptions<ValueType>;
  value?: ValueType;
  defaultValue?: ValueType;
  onChange?: (value: ValueType) => void;
  disabled?: boolean;
  name?: string;
  block?: boolean;
  size?: 'small' | 'medium' | 'middle' | 'large';
  vertical?: boolean;
  orientation?: 'horizontal' | 'vertical';
  direction?: 'ltr' | 'rtl';
  shape?: 'default' | 'round';
  motionName?: string;
  classNames?:
    | SemanticClassNames<SegmentedSemanticPart>
    | ((info: {
        props: SegmentedProps<ValueType>;
      }) => SemanticClassNames<SegmentedSemanticPart>);
  styles?:
    | SemanticStyles<SegmentedSemanticPart>
    | ((info: {
        props: SegmentedProps<ValueType>;
      }) => SemanticStyles<SegmentedSemanticPart>);
}
function SegmentedInner<ValueType>(
  props: SegmentedProps<ValueType>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const config = useTaoConfig();
  const id = useId();
  const {
    prefixCls,
    rootClassName,
    options,
    value,
    defaultValue,
    onChange,
    disabled = config.disabled,
    name = id,
    block,
    size = config.size,
    vertical,
    orientation,
    direction,
    shape = 'default',
    motionName = 'tao-segmented-thumb-motion',
    classNames,
    styles,
    className,
    style,
    onKeyDown,
    ...rest
  } = props;
  const resolved = options.map((option) =>
    typeof option === 'object' && option !== null
      ? (option as SegmentedLabeledOption<ValueType>)
      : { value: option as ValueType, label: String(option) },
  );
  const [internal, setInternal] = useState(defaultValue ?? resolved[0]?.value);
  const selected = value !== undefined ? value : internal;
  const axis = orientation ?? (vertical ? 'vertical' : 'horizontal');
  const merged = {
    ...props,
    value: selected,
    disabled,
    size,
    shape,
    orientation: axis,
  };
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: merged })
      : classNames;
  const slots =
    typeof styles === 'function' ? styles({ props: merged }) : styles;
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!);
  const [thumb, setThumb] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    moving: boolean;
  } | null>(null);
  useLayoutEffect(() => {
    const container = root.current!;
    const item = container.querySelector<HTMLElement>(
      '[data-tao-segmented-item][data-tao-checked]',
    );
    if (!item) {
      setThumb(null);
      return;
    }
    const measure = () => {
      const bounds = container.getBoundingClientRect();
      const target = item.getBoundingClientRect();
      const next = {
        x: target.left - bounds.left,
        y: target.top - bounds.top,
        width: target.width,
        height: target.height,
      };
      setThumb((previous) =>
        previous &&
        previous.x === next.x &&
        previous.y === next.y &&
        previous.width === next.width &&
        previous.height === next.height
          ? previous
          : { ...next, moving: previous !== null },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(item);
    return () => observer.disconnect();
  });
  function select(next: ValueType) {
    if (next === selected) return;
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }
  return (
    <div
      {...rest}
      ref={root}
      role="radiogroup"
      aria-orientation={axis}
      dir={direction ?? props.dir}
      data-tao-segmented=""
      data-tao-has-thumb={thumb !== null || undefined}
      data-tao-disabled={disabled || undefined}
      data-tao-block={block || undefined}
      data-tao-size={size === 'middle' ? 'medium' : size}
      data-tao-orientation={axis}
      data-tao-shape={shape}
      className={cx(prefixCls, classes?.root, className, rootClassName)}
      style={{ ...slots?.root, ...style }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || disabled) return;
        const target = event.target as HTMLInputElement;
        if (target.type !== 'radio') return;
        const radios = Array.from(
          event.currentTarget.querySelectorAll<HTMLInputElement>(
            'input[type="radio"]:not(:disabled)',
          ),
        );
        const index = radios.indexOf(target);
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        const previous =
          axis === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
        const next =
          axis === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
        let nextIndex: number;
        if (event.key === previous)
          nextIndex = (index - 1 + radios.length) % radios.length;
        else if (event.key === next) nextIndex = (index + 1) % radios.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = radios.length - 1;
        else return;
        event.preventDefault();
        const radio = radios[nextIndex];
        if (radio) {
          radio.focus();
          radio.click();
        }
      }}
    >
      {thumb && (
        <span
          aria-hidden="true"
          data-tao-segmented-thumb=""
          className={cx(
            motionName,
            thumb.moving && `${motionName}-appear`,
            thumb.moving && `${motionName}-appear-active`,
          )}
          style={{
            width: thumb.width,
            height: thumb.height,
            transform: `translate(${thumb.x}px, ${thumb.y}px)`,
          }}
          onTransitionEnd={() =>
            setThumb((previous) =>
              previous ? { ...previous, moving: false } : previous,
            )
          }
        />
      )}
      {resolved.map((option) => {
        const isDisabled = disabled || option.disabled;
        const key = `${typeof option.value}:${String(option.value)}`;
        const item = (
          <label
            key={key}
            data-tao-segmented-item=""
            data-tao-checked={option.value === selected || undefined}
            data-tao-disabled={isDisabled || undefined}
            className={cx(classes?.item, option.className)}
            style={slots?.item}
            title={
              option.title ??
              (typeof option.label === 'string' ||
              typeof option.label === 'number'
                ? String(option.label)
                : undefined)
            }
          >
            <input
              type="radio"
              name={name}
              value={String(option.value)}
              checked={option.value === selected}
              disabled={isDisabled}
              onChange={() => select(option.value)}
              aria-label={
                option.label === undefined ? String(option.value) : undefined
              }
            />
            <span
              data-tao-segmented-label=""
              className={classes?.label}
              style={slots?.label}
            >
              {option.icon !== undefined && (
                <span
                  data-tao-segmented-icon=""
                  className={classes?.icon}
                  style={slots?.icon}
                >
                  {option.icon}
                </span>
              )}
              {option.label}
            </span>
          </label>
        );
        return option.tooltip ? (
          <Tooltip
            key={key}
            {...(typeof option.tooltip === 'string'
              ? { title: option.tooltip }
              : option.tooltip)}
          >
            {item}
          </Tooltip>
        ) : (
          item
        );
      })}
    </div>
  );
}
export const Segmented = forwardRef(SegmentedInner) as <
  ValueType = SegmentedValue,
>(
  props: SegmentedProps<ValueType> & RefAttributes<HTMLDivElement>,
) => React.ReactElement;
