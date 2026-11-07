import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type RefAttributes,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTaoConfig, useTaoDirection } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Tooltip, type TooltipProps } from '../tooltip/tooltip';
import { mergeRefs } from '../../utils/refs';
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
  const resolved = useMemo(
    () =>
      options.map((option) =>
        typeof option === 'object' && option !== null
          ? (option as SegmentedLabeledOption<ValueType>)
          : { value: option as ValueType, label: String(option) },
      ),
    [options],
  );
  const firstEnabledValue = resolved.find((option) => !option.disabled)?.value;
  const initialValue = resolved.some(
    (option) => option.value === defaultValue && !option.disabled,
  )
    ? defaultValue
    : firstEnabledValue;
  const [internal, setInternal] = useState(initialValue);
  const controlled = 'value' in props;
  const internalAvailable = resolved.some(
    (option) => option.value === internal && !option.disabled,
  );
  if (!controlled && !internalAvailable && internal !== initialValue)
    setInternal(initialValue);
  const selected = controlled ? value : internalAvailable ? internal : initialValue;
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
  const [resolvedDirection, directionRef] = useTaoDirection(
    direction ??
      (props.dir === 'auto' || props.dir === 'ltr' || props.dir === 'rtl'
        ? props.dir
        : undefined),
  );
  const mergedRootRef = useMemo(
    () => mergeRefs(root, directionRef),
    [directionRef],
  );
  useImperativeHandle(ref, () => root.current!);
  const resetValue = controlled ? selected : initialValue;
  useLayoutEffect(() => {
    const container = root.current;
    if (!container?.closest('form')) return;
    const radios = container.querySelectorAll<HTMLInputElement>(
      ':scope > [data-tao-segmented-item] > input',
    );
    // Native reset must use the current default or the value owned by the caller.
    resolved.forEach((option, index) => {
      radios[index].defaultChecked = option.value === resetValue;
    });
  }, [resetValue, resolved]);
  useEffect(() => {
    if (controlled) return;
    const form = root.current?.closest('form');
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) setInternal(initialValue);
      });
    };
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  }, [controlled, initialValue]);
  const [thumb, setThumb] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    moving: boolean;
  } | null>(null);
  useLayoutEffect(() => {
    const container = root.current!;
    const items = container.querySelectorAll<HTMLElement>(
      '[data-tao-segmented-item]',
    );
    const item =
      items[resolved.findIndex((option) => option.value === selected)];
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
    for (const element of items) observer.observe(element);
    const attributes = new MutationObserver(measure);
    attributes.observe(container, {
      attributes: true,
      attributeFilter: ['dir', 'style', 'class'],
    });
    return () => {
      observer.disconnect();
      attributes.disconnect();
    };
  }, [resolved, selected]);
  function select(next: ValueType) {
    if (next === selected) return;
    if (!controlled) setInternal(next);
    onChange?.(next);
  }
  return (
    <div
      {...rest}
      ref={mergedRootRef}
      role="radiogroup"
      aria-orientation={axis}
      dir={direction ?? (props.dir === 'auto' ? 'auto' : resolvedDirection)}
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
        if (index < 0) return;
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
                option.label == null ||
                option.label === '' ||
                typeof option.label === 'boolean'
                  ? String(option.value)
                  : undefined
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
