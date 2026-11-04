import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './badge.css';

export type BadgeSemanticPart = 'root' | 'indicator';
export interface BadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'title'> {
  count?: ReactNode;
  showZero?: boolean;
  overflowCount?: number;
  dot?: boolean;
  prefixCls?: string;
  scrollNumberPrefixCls?: string;
  rootClassName?: string;
  status?: 'success' | 'processing' | 'default' | 'error' | 'warning';
  color?: string;
  text?: ReactNode;
  size?: 'small' | 'medium' | 'middle' | 'default';
  offset?: [number | string, number | string];
  title?: string | null | false;
  classNames?:
    | SemanticClassNames<BadgeSemanticPart>
    | ((info: { props: BadgeProps }) => SemanticClassNames<BadgeSemanticPart>);
  styles?:
    | SemanticStyles<BadgeSemanticPart>
    | ((info: { props: BadgeProps }) => SemanticStyles<BadgeSemanticPart>);
}
export type RibbonSemanticPart = 'root' | 'content' | 'indicator';
export interface RibbonProps {
  className?: string;
  prefixCls?: string;
  style?: CSSProperties;
  text?: ReactNode;
  color?: string;
  children?: ReactNode;
  placement?: 'start' | 'end';
  rootClassName?: string;
  classNames?:
    | SemanticClassNames<RibbonSemanticPart>
    | ((info: {
        props: RibbonProps;
      }) => SemanticClassNames<RibbonSemanticPart>);
  styles?:
    | SemanticStyles<RibbonSemanticPart>
    | ((info: { props: RibbonProps }) => SemanticStyles<RibbonSemanticPart>);
}
export interface RibbonRef {
  nativeElement: HTMLDivElement;
}
const presetColors: Record<string, string> = {
  geekblue: 'royalblue',
  volcano: 'orangered',
  success: 'var(--tao-color-success)',
  warning: 'var(--tao-color-warning)',
  error: 'var(--tao-color-error)',
  processing: 'var(--tao-color-primary)',
  default: 'var(--tao-color-text-quaternary)',
};
const renderable = (node: ReactNode) =>
  node !== null && node !== undefined && typeof node !== 'boolean';

const BadgeRoot = forwardRef<HTMLSpanElement, BadgeProps>((props, ref) => {
  const {
    count = null,
    showZero = false,
    overflowCount = 99,
    dot = false,
    prefixCls,
    scrollNumberPrefixCls,
    rootClassName,
    status,
    color,
    text,
    size = 'medium',
    offset,
    title,
    children,
    className,
    style,
    classNames,
    styles,
    ...rest
  } = props;
  const mergedProps = { ...props, count, showZero, overflowCount, dot, size };
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: mergedProps })
      : classNames;
  const slots =
    typeof styles === 'function' ? styles({ props: mergedProps }) : styles;
  const numeric =
    typeof count === 'number' || typeof count === 'string'
      ? Number(count)
      : undefined;
  const label =
    numeric !== undefined && numeric > overflowCount
      ? `${overflowCount}+`
      : count;
  const zero = label === 0 || label === '0' || text === 0 || text === '0';
  const statusMode =
    (status !== undefined || color !== undefined) &&
    (count === null || (zero && !showZero));
  const standaloneStatus =
    !children && statusMode && (!!text || status !== undefined || !zero);
  const asDot = dot && !zero;
  const hidden =
    ((!renderable(label) && !renderable(text)) || (zero && !showZero)) &&
    !asDot;
  const offsetStyle: CSSProperties = offset
    ? {
        marginTop: offset[1],
        insetInlineEnd: -Number.parseFloat(String(offset[0])),
      }
    : {};
  const customColor =
    color === undefined ? undefined : (presetColors[color] ?? color);
  const titleValue =
    title === null || title === false
      ? undefined
      : (title ??
        (typeof count === 'number' || typeof count === 'string'
          ? String(count)
          : undefined));
  const visibleText =
    !hidden && (text === 0 ? showZero : !!text && text !== true);
  const indicatorStyle: CSSProperties = {
    ...offsetStyle,
    ...slots?.indicator,
    ...(!standaloneStatus ? style : {}),
    ...(customColor ? { background: customColor } : {}),
  };
  return (
    <span
      {...rest}
      ref={ref}
      data-tao-badge=""
      data-tao-wrapper={!!children || undefined}
      data-tao-status-only={standaloneStatus || undefined}
      className={cx(prefixCls, classes?.root, className, rootClassName)}
      style={{
        ...slots?.root,
        ...(standaloneStatus ? { ...offsetStyle, ...style } : {}),
      }}
    >
      {children}
      {(standaloneStatus || !hidden) && (
        <span
          data-tao-badge-indicator=""
          data-tao-status={status}
          data-tao-dot={standaloneStatus || asDot || undefined}
          data-tao-size={size === 'small' ? 'small' : 'medium'}
          data-tao-custom={isValidElement(count) || undefined}
          className={cx(scrollNumberPrefixCls, classes?.indicator)}
          title={standaloneStatus ? undefined : titleValue}
          style={indicatorStyle}
        >
          {!standaloneStatus && !asDot && label}
        </span>
      )}
      {visibleText && <span data-tao-badge-text="">{text}</span>}
    </span>
  );
});
BadgeRoot.displayName = 'Badge';
const Ribbon = forwardRef<RibbonRef, RibbonProps>((props, ref) => {
  const {
    className,
    prefixCls,
    style,
    text,
    color,
    children,
    placement = 'end',
    rootClassName,
    classNames,
    styles,
  } = props;
  const mergedProps = { ...props, placement };
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: mergedProps })
      : classNames;
  const slots =
    typeof styles === 'function' ? styles({ props: mergedProps }) : styles;
  const node = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({ nativeElement: node.current! }));
  const ribbonColor =
    color === undefined ? undefined : (presetColors[color] ?? color);
  return (
    <div
      ref={node}
      data-tao-ribbon=""
      data-tao-placement={placement}
      className={cx(
        prefixCls && `${prefixCls}-wrapper`,
        classes?.root,
        rootClassName,
      )}
      style={slots?.root}
    >
      {children}
      <div
        data-tao-ribbon-indicator=""
        className={cx(prefixCls, classes?.indicator, className)}
        style={{
          ...(ribbonColor
            ? ({
                background: ribbonColor,
                '--tao-ribbon-color': ribbonColor,
              } as CSSProperties)
            : {}),
          ...slots?.indicator,
          ...style,
        }}
      >
        <span
          data-tao-ribbon-content=""
          className={classes?.content}
          style={slots?.content}
        >
          {text}
        </span>
      </div>
    </div>
  );
});
Ribbon.displayName = 'Badge.Ribbon';
export const Badge = Object.assign(BadgeRoot, { Ribbon });
