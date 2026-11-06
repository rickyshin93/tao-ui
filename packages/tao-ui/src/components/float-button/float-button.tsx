import {
  type CSSProperties,
  createContext,
  type DOMAttributes,
  forwardRef,
  type HTMLAttributeAnchorTarget,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useContext,
  useEffect,
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
import { Badge, type BadgeProps } from '../badge/badge';
import { Tooltip, type TooltipProps } from '../tooltip/tooltip';
import './float-button.css';
export type FloatButtonElement = HTMLAnchorElement & HTMLButtonElement;
export interface FloatButtonRef {
  nativeElement: FloatButtonElement | null;
}
export type FloatButtonType = 'default' | 'primary';
export type FloatButtonShape = 'circle' | 'square';
export type FloatButtonGroupTrigger = 'click' | 'hover';
export type FloatButtonBadgeProps = Omit<
  BadgeProps,
  'status' | 'text' | 'title' | 'children'
>;
export type FloatButtonSemanticPart = 'root' | 'icon' | 'content';
export interface FloatButtonProps extends DOMAttributes<FloatButtonElement> {
  prefixCls?: string;
  className?: string;
  rootClassName?: string;
  style?: CSSProperties;
  classNames?:
    | SemanticClassNames<FloatButtonSemanticPart>
    | ((info: {
        props: FloatButtonProps;
      }) => SemanticClassNames<FloatButtonSemanticPart>);
  styles?:
    | SemanticStyles<FloatButtonSemanticPart>
    | ((info: {
        props: FloatButtonProps;
      }) => SemanticStyles<FloatButtonSemanticPart>);
  icon?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  type?: FloatButtonType;
  shape?: FloatButtonShape;
  tooltip?: ReactNode | Omit<TooltipProps, 'children'>;
  href?: string;
  target?: HTMLAttributeAnchorTarget;
  badge?: FloatButtonBadgeProps;
  disabled?: boolean;
  htmlType?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}
interface GroupConfig {
  shape: FloatButtonShape;
  classNames?: SemanticClassNames<FloatButtonSemanticPart>;
  styles?: SemanticStyles<FloatButtonSemanticPart>;
}
const GroupContext = createContext<GroupConfig | null>(null);
function ActionIcon({
  kind = 'action',
}: {
  kind?: 'action' | 'close' | 'top';
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <path
        d={
          kind === 'close'
            ? 'M6 6l12 12M18 6 6 18'
            : kind === 'top'
              ? 'M5 5h14M6 14l6-6 6 6M12 8v13'
              : 'M6 3h9l4 4v14H6zM9 11h7M9 15h7'
        }
      />
    </svg>
  );
}
const FloatButtonRoot = forwardRef<FloatButtonElement, FloatButtonProps>(
  (props, ref) => {
    const config = useTaoConfig();
    const group = useContext(GroupContext);
    const {
      prefixCls,
      className,
      rootClassName,
      style,
      type = 'default',
      shape = 'circle',
      icon,
      description,
      content,
      tooltip,
      badge,
      disabled = config.disabled,
      htmlType = 'button',
      href,
      target,
      classNames,
      styles,
      children: _children,
      ...rest
    } = props;
    const actualShape = group?.shape ?? shape;
    const label = content ?? description;
    const merged = { ...props, type, shape: actualShape, disabled };
    const classes =
      typeof classNames === 'function'
        ? classNames({ props: merged })
        : classNames;
    const slots =
      typeof styles === 'function' ? styles({ props: merged }) : styles;
    const Tag = href ? 'a' : 'button';
    const node = useRef<FloatButtonElement | null>(null);
    useImperativeHandle(ref, () => node.current!);
    const hasLabel =
      label !== null && label !== undefined && typeof label !== 'boolean';
    const glyph = icon ?? (!hasLabel ? <ActionIcon /> : null);
    const button = (
      <Tag
        {...rest}
        ref={(element: HTMLAnchorElement | HTMLButtonElement | null) => {
          node.current = element as FloatButtonElement | null;
        }}
        href={disabled ? undefined : href}
        target={target}
        type={href ? undefined : htmlType}
        disabled={href ? undefined : disabled}
        aria-disabled={(href && disabled) || undefined}
        tabIndex={href && disabled ? -1 : undefined}
        aria-label={
          props['aria-label'] ??
          (!hasLabel
            ? typeof tooltip === 'string'
              ? tooltip
              : 'Action'
            : undefined)
        }
        data-tao-float-button=""
        data-tao-type={type}
        data-tao-shape={actualShape}
        data-tao-in-group={group !== null || undefined}
        className={cx(
          prefixCls,
          group?.classNames?.root,
          classes?.root,
          className,
          rootClassName,
        )}
        style={{ ...group?.styles?.root, ...slots?.root, ...style }}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          rest.onClick?.(event as ReactMouseEvent<FloatButtonElement>);
        }}
      >
        {glyph !== null && (
          <span
            data-tao-float-button-icon=""
            className={cx(group?.classNames?.icon, classes?.icon)}
            style={{ ...group?.styles?.icon, ...slots?.icon }}
          >
            {glyph}
          </span>
        )}
        {hasLabel && (
          <span
            data-tao-float-button-content=""
            className={cx(group?.classNames?.content, classes?.content)}
            style={{ ...group?.styles?.content, ...slots?.content }}
          >
            {label}
          </span>
        )}
        {badge && (
          <span data-tao-float-button-badge="">
            <Badge {...badge} />
          </span>
        )}
      </Tag>
    );
    const tooltipProps =
      tooltip &&
      typeof tooltip === 'object' &&
      !Array.isArray(tooltip) &&
      !('$$typeof' in tooltip)
        ? (tooltip as Omit<TooltipProps, 'children'>)
        : { title: tooltip as ReactNode };
    return tooltip ? <Tooltip {...tooltipProps}>{button}</Tooltip> : button;
  },
);
FloatButtonRoot.displayName = 'FloatButton';
export type FloatButtonGroupSemanticPart =
  | 'root'
  | 'list'
  | 'item'
  | 'itemIcon'
  | 'itemContent'
  | 'trigger'
  | 'triggerIcon'
  | 'triggerContent';
export interface FloatButtonGroupProps
  extends Omit<FloatButtonProps, 'classNames' | 'styles'> {
  classNames?:
    | SemanticClassNames<FloatButtonGroupSemanticPart>
    | ((info: {
        props: FloatButtonGroupProps;
      }) => SemanticClassNames<FloatButtonGroupSemanticPart>);
  styles?:
    | SemanticStyles<FloatButtonGroupSemanticPart>
    | ((info: {
        props: FloatButtonGroupProps;
      }) => SemanticStyles<FloatButtonGroupSemanticPart>);
  trigger?: FloatButtonGroupTrigger;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeIcon?: ReactNode;
  children: ReactNode;
  placement?: 'top' | 'left' | 'right' | 'bottom';
}
export interface FloatButtonGroupRef {
  nativeElement: HTMLDivElement;
}
const FloatButtonGroup = forwardRef<FloatButtonGroupRef, FloatButtonGroupProps>(
  (props, ref) => {
    const config = useTaoConfig();
    const {
      prefixCls,
      className,
      style,
      classNames,
      styles,
      rootClassName,
      shape = 'circle',
      type = 'default',
      placement = 'top',
      icon,
      closeIcon = <ActionIcon kind="close" />,
      trigger,
      children,
      onOpenChange,
      open,
      onClick,
      disabled = config.disabled,
      ...buttonProps
    } = props;
    const [internal, setInternal] = useState(false);
    const expanded = open ?? internal;
    const root = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<FloatButtonElement>(null);
    useImperativeHandle(ref, () => ({ nativeElement: root.current! }));
    const change = (next: boolean) => {
      if (disabled || next === expanded) return;
      if (open === undefined) setInternal(next);
      onOpenChange?.(next);
    };
    const latestChange = useRef(change);
    useLayoutEffect(() => {
      latestChange.current = change;
    });
    useEffect(() => {
      if (trigger !== 'click') return;
      const outside = (event: MouseEvent) => {
        if (!root.current?.contains(event.target as Node))
          latestChange.current(false);
      };
      document.addEventListener('click', outside, true);
      return () => document.removeEventListener('click', outside, true);
    }, [trigger]);
    const merged = { ...props, shape, type, placement, disabled };
    const classes =
      typeof classNames === 'function'
        ? classNames({ props: merged })
        : classNames;
    const slots =
      typeof styles === 'function' ? styles({ props: merged }) : styles;
    const listConfig: GroupConfig = {
      shape,
      classNames: {
        root: classes?.item,
        icon: classes?.itemIcon,
        content: classes?.itemContent,
      },
      styles: {
        root: slots?.item,
        icon: slots?.itemIcon,
        content: slots?.itemContent,
      },
    };
    const triggerConfig: GroupConfig = {
      shape,
      classNames: {
        root: classes?.trigger,
        icon: classes?.triggerIcon,
        content: classes?.triggerContent,
      },
      styles: {
        root: slots?.trigger,
        icon: slots?.triggerIcon,
        content: slots?.triggerContent,
      },
    };
    return (
      <div
        ref={root}
        role="toolbar"
        aria-label={config.locale.messages.floatingActions}
        data-tao-float-button-group=""
        data-tao-shape={shape}
        data-tao-placement={placement}
        className={cx(
          prefixCls && `${prefixCls}-group`,
          classes?.root,
          className,
          rootClassName,
        )}
        style={{ ...slots?.root, ...style }}
        onMouseEnter={() => {
          if (trigger === 'hover') change(true);
        }}
        onMouseLeave={() => {
          if (trigger === 'hover') change(false);
        }}
        onKeyDown={(event) => {
          if (
            [
              'ArrowUp',
              'ArrowDown',
              'ArrowLeft',
              'ArrowRight',
              'Home',
              'End',
            ].includes(event.key)
          ) {
            const controls = Array.from(
              root.current!.querySelectorAll<HTMLElement>(
                'button:not(:disabled), a[href]',
              ),
            );
            const current = controls.indexOf(event.target as HTMLElement);
            if (current >= 0) {
              event.preventDefault();
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? controls.length - 1
                    : (current +
                        (event.key === 'ArrowUp' || event.key === 'ArrowLeft'
                          ? -1
                          : 1) +
                        controls.length) %
                      controls.length;
              controls[next]?.focus();
            }
          }
          if (event.key === 'Escape' && expanded && trigger) {
            event.preventDefault();
            change(false);
            triggerRef.current?.focus();
          }
        }}
      >
        {(!trigger || expanded) && (
          <GroupContext.Provider value={listConfig}>
            <div
              data-tao-float-button-list=""
              className={classes?.list}
              style={slots?.list}
            >
              {children}
            </div>
          </GroupContext.Provider>
        )}
        {trigger && (
          <GroupContext.Provider value={triggerConfig}>
            <FloatButtonRoot
              {...buttonProps}
              ref={triggerRef}
              type={type}
              icon={expanded ? closeIcon : icon}
              disabled={disabled}
              aria-expanded={expanded}
              onClick={(event) => {
                if (trigger === 'click') change(!expanded);
                onClick?.(event);
              }}
              onFocus={(event) => {
                if (trigger === 'hover') change(true);
                buttonProps.onFocus?.(event);
              }}
            />
          </GroupContext.Provider>
        )}
      </div>
    );
  },
);
FloatButtonGroup.displayName = 'FloatButton.Group';
export interface FloatButtonBackTopProps
  extends Omit<FloatButtonProps, 'target'> {
  visibilityHeight?: number;
  target?: () => HTMLElement | Window | Document;
  duration?: number;
  showProgress?: boolean;
}
export type BackTopProps = FloatButtonBackTopProps;
const defaultTarget = () => document;
function scrollElement(target: HTMLElement | Window | Document): HTMLElement {
  return target === window || target instanceof Document
    ? ((target instanceof Document ? target : document)
        .scrollingElement as HTMLElement)
    : (target as HTMLElement);
}
const BackTop = forwardRef<FloatButtonRef, FloatButtonBackTopProps>(
  (props, ref) => {
    const { locale } = useTaoConfig();
    const {
      visibilityHeight = 400,
      target = defaultTarget,
      duration = 450,
      showProgress = false,
      onClick,
      icon = <ActionIcon kind="top" />,
      style,
      ...rest
    } = props;
    const [scroll, setScroll] = useState({ visible: false, progress: 0 });
    const node = useRef<FloatButtonElement>(null);
    const animation = useRef(0);
    const previousTarget = useRef<HTMLElement | Window | Document | undefined>(
      undefined,
    );
    useImperativeHandle(ref, () => ({ nativeElement: node.current }));
    useEffect(() => () => cancelAnimationFrame(animation.current), []);
    useEffect(() => {
      const container = target();
      if (container !== previousTarget.current)
        cancelAnimationFrame(animation.current);
      previousTarget.current = container;
      const element = scrollElement(container);
      const update = () => {
        const top = element.scrollTop;
        const total = element.scrollHeight - element.clientHeight;
        setScroll({
          visible: top >= visibilityHeight,
          progress: total > 0 ? Math.min(1, Math.max(0, top / total)) : 0,
        });
      };
      container.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      const observer = new ResizeObserver(update);
      observer.observe(element);
      update();
      return () => {
        container.removeEventListener('scroll', update);
        window.removeEventListener('resize', update);
        observer.disconnect();
      };
    }, [target, visibilityHeight]);
    const click: FloatButtonProps['onClick'] = (event) => {
      const element = scrollElement(target());
      const start = element.scrollTop;
      const time = performance.now();
      cancelAnimationFrame(animation.current);
      if (
        duration <= 0 ||
        matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        element.scrollTop = 0;
      else {
        const tick = (now: number) => {
          const progress = Math.min(1, (now - time) / duration);
          element.scrollTop = start * (1 - progress) ** 3;
          if (progress < 1) animation.current = requestAnimationFrame(tick);
        };
        animation.current = requestAnimationFrame(tick);
      }
      onClick?.(event);
    };
    return scroll.visible ? (
      <FloatButtonRoot
        {...rest}
        ref={node}
        icon={icon}
        aria-label={rest['aria-label'] ?? locale.messages.backToTop}
        onClick={click}
        style={
          {
            ...(showProgress
              ? { '--tao-float-progress': `${scroll.progress}turn` }
              : {}),
            ...style,
          } as CSSProperties
        }
        data-tao-show-progress={showProgress || undefined}
      />
    ) : null;
  },
);
BackTop.displayName = 'FloatButton.BackTop';
export const FloatButton = Object.assign(FloatButtonRoot, {
  Group: FloatButtonGroup,
  BackTop,
});
