import {
  Children,
  type CSSProperties,
  createContext,
  Fragment,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  useContext,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import {
  resolveResponsiveValue,
  type TaoBreakpointMap,
  useBreakpoint,
} from '../../utils/breakpoint';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Popover, type PopoverProps } from '../popover/popover';
import './avatar.css';

export type AvatarSemanticPart = 'root' | 'image' | 'icon' | 'content';
export type AvatarSize =
  | 'small'
  | 'medium'
  | 'middle'
  | 'default'
  | 'large'
  | number
  | TaoBreakpointMap<number>;
export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'onError'> {
  shape?: 'circle' | 'square';
  size?: AvatarSize;
  gap?: number;
  src?: ReactNode;
  srcSet?: string;
  icon?: ReactNode;
  prefixCls?: string;
  rootClassName?: string;
  alt?: string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  onError?: () => boolean;
  classNames?: SemanticClassNames<AvatarSemanticPart>;
  styles?: SemanticStyles<AvatarSemanticPart>;
}
export type AvatarGroupSemanticPart = 'root' | 'overflow';
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
  rootClassName?: string;
  size?: AvatarSize;
  shape?: 'circle' | 'square';
  max?: {
    count?: number;
    style?: CSSProperties;
    popover?: Omit<PopoverProps, 'children'>;
  };
  /** @deprecated Use max.count. */
  maxCount?: number;
  /** @deprecated Use max.style. */
  maxStyle?: CSSProperties;
  /** @deprecated Use max.popover.placement. */
  maxPopoverPlacement?: 'top' | 'bottom';
  /** @deprecated Use max.popover.trigger. */
  maxPopoverTrigger?: 'hover' | 'focus' | 'click';
  classNames?: SemanticClassNames<AvatarGroupSemanticPart>;
  styles?: SemanticStyles<AvatarGroupSemanticPart>;
}
export interface AvatarGroupRef {
  nativeElement: HTMLDivElement;
}
const GroupContext = createContext<Pick<AvatarGroupProps, 'size' | 'shape'>>(
  {},
);

const AvatarRoot = forwardRef<HTMLSpanElement, AvatarProps>((props, ref) => {
  const ctx = useTaoConfig();
  const group = useContext(GroupContext);
  const {
    shape = group.shape ?? 'circle',
    size = group.size ?? ctx.size,
    gap = 4,
    src,
    srcSet,
    icon,
    prefixCls,
    rootClassName,
    alt,
    crossOrigin,
    onError,
    classNames,
    styles,
    children,
    className,
    style,
    draggable,
    ...rest
  } = props;
  const node = useRef<HTMLSpanElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  useImperativeHandle(ref, () => node.current!);
  const screens = useBreakpoint();
  const dimensions =
    typeof size === 'object' ? resolveResponsiveValue(size, screens) : size;
  const [failedSource, setFailedSource] = useState<{
    src: ReactNode;
    srcSet?: string;
  }>();
  const failed = failedSource?.src === src && failedSource?.srcSet === srcSet;
  const hasImage =
    typeof src === 'string' ? !failed && src !== '' : isValidElement(src);
  const hasIcon =
    icon !== null && icon !== undefined && typeof icon !== 'boolean';
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    if (hasImage || hasIcon) return;
    const element = node.current;
    const content = text.current;
    if (!element || !content) return;
    const measure = () => {
      const width = element.offsetWidth;
      const textWidth = content.offsetWidth;
      setScale(
        width > gap * 2 && textWidth > 0
          ? Math.min(1, (width - gap * 2) / textWidth)
          : 1,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(content);
    return () => observer.disconnect();
  }, [gap, hasImage, hasIcon]);
  const dimensionsStyle: CSSProperties =
    typeof dimensions === 'number'
      ? {
          width: dimensions,
          height: dimensions,
          fontSize:
            hasIcon || typeof size === 'object' ? dimensions / 2 : undefined,
        }
      : {};
  return (
    <span
      {...rest}
      ref={node}
      data-tao-avatar=""
      data-tao-shape={shape}
      data-tao-size={
        typeof dimensions === 'string'
          ? dimensions === 'middle' || dimensions === 'default'
            ? 'medium'
            : dimensions
          : undefined
      }
      data-tao-image={hasImage || undefined}
      data-tao-icon={hasIcon || undefined}
      className={cx(prefixCls, classNames?.root, className, rootClassName)}
      style={{ ...dimensionsStyle, ...styles?.root, ...style }}
    >
      {hasImage ? (
        typeof src === 'string' ? (
          <img
            src={src}
            srcSet={srcSet}
            alt={alt ?? ''}
            draggable={draggable}
            crossOrigin={crossOrigin}
            className={classNames?.image}
            style={styles?.image}
            onError={() => {
              if (onError?.() !== false) setFailedSource({ src, srcSet });
            }}
          />
        ) : (
          src
        )
      ) : hasIcon ? (
        <span
          data-tao-avatar-icon=""
          className={classNames?.icon}
          style={styles?.icon}
        >
          {icon}
        </span>
      ) : (
        <span
          ref={text}
          data-tao-avatar-content=""
          className={classNames?.content}
          style={{ transform: `scale(${scale})`, ...styles?.content }}
        >
          {children}
        </span>
      )}
    </span>
  );
});
AvatarRoot.displayName = 'Avatar';

function flattenChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flattenChildren(child.props.children)
      : [child],
  );
}
const AvatarGroup = forwardRef<AvatarGroupRef, AvatarGroupProps>(
  (props, ref) => {
    const parent = useContext(GroupContext);
    const {
      prefixCls,
      rootClassName,
      size = parent.size,
      shape = parent.shape,
      max,
      maxCount,
      maxStyle,
      maxPopoverPlacement,
      maxPopoverTrigger,
      className,
      style,
      classNames,
      styles,
      children,
      ...rest
    } = props;
    const node = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({ nativeElement: node.current! }));
    const items = flattenChildren(children);
    const count = max?.count || maxCount;
    const hasOverflow =
      count !== undefined && count > 0 && count < items.length;
    const visible = hasOverflow ? items.slice(0, count) : items;
    const hidden = hasOverflow ? items.slice(count) : [];
    return (
      <GroupContext.Provider value={{ size, shape }}>
        <div
          {...rest}
          ref={node}
          data-tao-avatar-group=""
          className={cx(
            prefixCls && `${prefixCls}-group`,
            classNames?.root,
            className,
            rootClassName,
          )}
          style={{ ...styles?.root, ...style }}
        >
          {visible}
          {hasOverflow && (
            <Popover
              content={<div data-tao-avatar-overflow-list="">{hidden}</div>}
              destroyOnHidden
              {...max?.popover}
              placement={
                max?.popover?.placement ?? maxPopoverPlacement ?? 'top'
              }
              trigger={max?.popover?.trigger ?? maxPopoverTrigger ?? 'hover'}
            >
              <button
                type="button"
                data-tao-avatar-overflow=""
                aria-label={`${hidden.length} more users`}
                className={classNames?.overflow}
                style={styles?.overflow}
              >
                <AvatarRoot style={max?.style ?? maxStyle}>
                  +{hidden.length}
                </AvatarRoot>
              </button>
            </Popover>
          )}
        </div>
      </GroupContext.Provider>
    );
  },
);
AvatarGroup.displayName = 'Avatar.Group';
export const Avatar = Object.assign(AvatarRoot, { Group: AvatarGroup });
