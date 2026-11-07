import RcRate from '@rc-component/rate';
import type {
  RateProps as RcRateProps,
  RateRef as RcRateRef,
} from '@rc-component/rate/lib/Rate.js';
import {
  type AriaAttributes,
  cloneElement,
  forwardRef,
  type HTMLAttributes,
  type ReactElement,
  useMemo,
  useState,
} from 'react';
import {
  type TaoSize,
  useTaoConfig,
  useTaoDirection,
} from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Tooltip, type TooltipProps } from '../tooltip/tooltip';
import './rate.css';
import { interopDefault } from '../../utils/interop-default';

const RcRateComponent = /*#__PURE__*/ interopDefault(RcRate);

export type RateRef = RcRateRef;
export type RateSemanticPart = 'root' | 'item';
export interface RateProps
  extends RcRateProps,
    Pick<AriaAttributes, 'aria-label' | 'aria-labelledby'> {
  rootClassName?: string;
  size?: TaoSize | 'middle';
  readOnly?: boolean;
  tooltips?: (Omit<TooltipProps, 'children'> | string)[];
  classNames?: SemanticClassNames<RateSemanticPart>;
  styles?: SemanticStyles<RateSemanticPart>;
}
const Star = (
  <svg
    data-tao-rate-icon=""
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="m12 2.4 2.96 6 6.62.96-4.8 4.67 1.14 6.6L12 17.52l-5.92 3.11 1.13-6.6-4.79-4.67L9.04 8.4Z" />
  </svg>
);
export const Rate = forwardRef<RateRef, RateProps>((props, ref) => {
  const {
    prefixCls = 'tao-rate',
    rootClassName,
    className,
    classNames,
    style,
    styles,
    tooltips,
    size,
    disabled,
    readOnly = false,
    character = Star,
    characterRender,
    direction: directionProp,
    count = 5,
    keyboard,
    value,
    defaultValue,
    onChange,
    ...rest
  } = props;
  const [direction, directionRef] = useTaoDirection(
    directionProp === undefined
      ? undefined
      : directionProp === 'rtl'
        ? 'rtl'
        : 'ltr',
  );
  const config = useTaoConfig();
  const resolvedDisabled = disabled ?? config.disabled;
  const controlled = 'value' in props;
  const [internalValue, setInternalValue] = useState(defaultValue ?? 0);
  const selectedValue = Math.min(
    count,
    Math.max(0, controlled ? (value ?? 0) : internalValue),
  );
  const numberLocale = config.locale.numberLocale;
  const numberFormat = useMemo(
    () => new Intl.NumberFormat(numberLocale),
    [numberLocale],
  );
  return (
    <span ref={directionRef} dir={direction} style={{ display: 'contents' }}>
      <RcRateComponent
        {...rest}
        direction={direction}
        ref={ref}
        {...{ role: 'radiogroup' }}
        data-tao-rate=""
        data-tao-size={size === 'middle' ? 'medium' : (size ?? config.size)}
        data-tao-disabled={resolvedDisabled ? '' : undefined}
        data-tao-readonly={readOnly ? '' : undefined}
        aria-readonly={readOnly || undefined}
        aria-disabled={resolvedDisabled || undefined}
        prefixCls={prefixCls}
        disabled={resolvedDisabled || readOnly}
        count={count}
        keyboard={keyboard}
        value={selectedValue}
        onChange={(next) => {
          const bounded = Math.min(count, Math.max(0, next));
          if (!controlled) setInternalValue(bounded);
          onChange?.(bounded);
        }}
        character={character}
        className={cx(classNames?.root, rootClassName, className)}
        style={{ ...styles?.root, ...style }}
        characterRender={(node, info) => {
          const index = info.index ?? 0;
          const half =
            !!info.allowHalf &&
            (info.value ?? 0) > index &&
            (info.value ?? 0) < index + 1;
          const item = node as ReactElement<HTMLAttributes<HTMLLIElement>>;
          const radio = item.props.children as ReactElement<
            HTMLAttributes<HTMLDivElement>
          >;
          // The engine's value previews hover, while selection stays committed.
          const checked = selectedValue > index && selectedValue <= index + 1;
          const score = numberFormat.format(
            checked ? selectedValue : index + 1,
          );
          const child = cloneElement(item, {
            ...{
              'data-tao-rate-item': '',
              'data-tao-half': half ? '' : undefined,
              'data-tao-full': (info.value ?? 0) >= index + 1 ? '' : undefined,
            },
            className: cx(
              (node.props as HTMLAttributes<HTMLLIElement>).className,
              classNames?.item,
            ),
            style: styles?.item,
            children: cloneElement(radio, {
              'aria-checked': checked,
              'aria-label': `${score} / ${numberFormat.format(count)}`,
              onKeyDown: keyboard === false ? undefined : radio.props.onKeyDown,
            }),
          });
          const rendered = characterRender
            ? characterRender(child, info)
            : child;
          const tip = tooltips?.[index];
          return tip ? (
            <Tooltip {...(typeof tip === 'string' ? { title: tip } : tip)}>
              {rendered}
            </Tooltip>
          ) : (
            rendered
          );
        }}
      />
    </span>
  );
});
Rate.displayName = 'Rate';
