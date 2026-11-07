import {
  Children,
  type CSSProperties,
  Fragment,
  type HTMLAttributes,
  isValidElement,
  type Key,
  type ReactNode,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Spinner } from '../spinner/spinner';
import './timeline.css';
export type ItemPosition = 'left' | 'right' | 'start' | 'end';
export type ItemPlacement = 'start' | 'end';
export type TimelineMode = ItemPosition | 'alternate';
export type TimelineSemanticPart =
  | 'root'
  | 'item'
  | 'itemWrapper'
  | 'itemIcon'
  | 'itemSection'
  | 'itemHeader'
  | 'itemTitle'
  | 'itemContent'
  | 'itemRail';
export type TimelineItemSemanticPart =
  | 'root'
  | 'wrapper'
  | 'icon'
  | 'section'
  | 'header'
  | 'title'
  | 'content'
  | 'rail';
export interface TimelineItemType {
  color?: string;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<TimelineItemSemanticPart>;
  styles?: SemanticStyles<TimelineItemSemanticPart>;
  placement?: ItemPlacement;
  position?: ItemPosition;
  loading?: boolean;
  key?: Key;
  title?: ReactNode;
  content?: ReactNode;
  label?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  dot?: ReactNode;
}
export interface TimelineProps
  extends Omit<HTMLAttributes<HTMLOListElement>, 'children'> {
  prefixCls?: string;
  rootClassName?: string;
  variant?: 'filled' | 'outlined';
  mode?: TimelineMode;
  orientation?: 'horizontal' | 'vertical';
  titleSpan?: string | number;
  items?: TimelineItemType[];
  children?: ReactNode;
  pending?: ReactNode;
  pendingDot?: ReactNode;
  reverse?: boolean;
  classNames?:
    | SemanticClassNames<TimelineSemanticPart>
    | ((info: {
        props: TimelineProps;
      }) => SemanticClassNames<TimelineSemanticPart>);
  styles?:
    | SemanticStyles<TimelineSemanticPart>
    | ((info: {
        props: TimelineProps;
      }) => SemanticStyles<TimelineSemanticPart>);
}
function childItems(
  children: ReactNode,
  parentKeys: (string | null)[] = [],
): TimelineItemType[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<TimelineItemType>(child)) return [];
    const keys = [...parentKeys, child.key];
    return child.type === Fragment
      ? childItems(child.props.children, keys)
      : [{ ...child.props, key: JSON.stringify(keys) }];
  });
}
const colors: Record<string, string> = {
  blue: 'var(--tao-color-primary)',
  red: 'var(--tao-color-error)',
  green: 'var(--tao-color-success)',
  gray: 'var(--tao-color-text-quaternary)',
};
const normalizedPlacement = (placement: ItemPosition): ItemPlacement =>
  placement === 'right' || placement === 'end' ? 'end' : 'start';
function TimelineRoot(props: TimelineProps) {
  const config = useTaoConfig();
  const {
    prefixCls,
    rootClassName,
    variant = config.variant === 'filled' ? 'filled' : 'outlined',
    mode = 'start',
    orientation = 'vertical',
    titleSpan = 12,
    items,
    children,
    pending,
    pendingDot,
    reverse,
    classNames,
    styles,
    className,
    style,
    ...rest
  } = props;
  const actualMode = mode === 'alternate' ? mode : normalizedPlacement(mode);
  const defaultPlacement = (index: number): ItemPlacement =>
    actualMode === 'alternate'
      ? index % 2 === 0
        ? 'start'
        : 'end'
      : actualMode;
  const resolved = (items ?? childItems(children)).map((item, index) => ({
    ...item,
    renderKey: item.key === undefined ? `item:${index}` : `key:${item.key}`,
    title: item.title ?? item.label,
    content: item.content ?? item.children,
    icon: item.icon ?? item.dot,
    placement: normalizedPlacement(
      item.placement ?? item.position ?? defaultPlacement(index),
    ),
  }));
  if (pending || pending === 0)
    resolved.push({
      renderKey: 'pending',
      content: pending,
      icon: pendingDot,
      loading: true,
      placement: defaultPlacement(resolved.length),
      title: undefined,
    });
  if (reverse) resolved.reverse();
  const split =
    actualMode === 'alternate' ||
    (orientation === 'vertical' &&
      resolved.some((item) => item.title || item.title === 0));
  const merged = {
    ...props,
    variant,
    mode: actualMode,
    orientation,
    items: resolved,
  };
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: merged })
      : classNames;
  const slots =
    typeof styles === 'function' ? styles({ props: merged }) : styles;
  const span =
    actualMode === 'alternate'
      ? '50%'
      : typeof titleSpan === 'number'
        ? `${(titleSpan / 24) * 100}%`
        : titleSpan;
  return (
    <ol
      {...rest}
      data-tao-timeline=""
      data-tao-orientation={orientation}
      data-tao-mode={actualMode}
      data-tao-split={split || undefined}
      data-tao-variant={variant}
      className={cx(prefixCls, classes?.root, className, rootClassName)}
      style={
        {
          '--tao-timeline-title-span': span,
          ...slots?.root,
          ...style,
        } as CSSProperties
      }
    >
      {resolved.map((item) => {
        function part(
          rootPart: TimelineSemanticPart,
          localPart: TimelineItemSemanticPart,
        ) {
          return {
            className: cx(classes?.[rootPart], item.classNames?.[localPart]),
            style: { ...slots?.[rootPart], ...item.styles?.[localPart] },
          };
        }
        const icon =
          item.icon ?? (item.loading ? <Spinner size="small" /> : null);
        return (
          <li
            key={item.renderKey}
            data-tao-timeline-item=""
            data-tao-placement={item.placement}
            data-tao-loading={item.loading || undefined}
            className={cx(classes?.item, item.classNames?.root, item.className)}
            style={
              {
                '--tao-timeline-color': item.color
                  ? (colors[item.color] ?? item.color)
                  : undefined,
                ...slots?.item,
                ...item.styles?.root,
                ...item.style,
              } as CSSProperties
            }
          >
            <div
              data-tao-timeline-wrapper=""
              {...part('itemWrapper', 'wrapper')}
            >
              <span
                data-tao-timeline-rail=""
                aria-hidden="true"
                {...part('itemRail', 'rail')}
              />
              <span
                data-tao-timeline-icon=""
                data-tao-custom={icon !== null || undefined}
                {...part('itemIcon', 'icon')}
              >
                {icon}
              </span>
              <div
                data-tao-timeline-section=""
                {...part('itemSection', 'section')}
              >
                <div
                  data-tao-timeline-header=""
                  {...part('itemHeader', 'header')}
                >
                  <div
                    data-tao-timeline-title=""
                    {...part('itemTitle', 'title')}
                  >
                    {item.title}
                  </div>
                </div>
                <div
                  data-tao-timeline-content=""
                  {...part('itemContent', 'content')}
                >
                  {item.content}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
function TimelineItem(_props: TimelineItemType) {
  return null;
}
export const Timeline = Object.assign(TimelineRoot, { Item: TimelineItem });
