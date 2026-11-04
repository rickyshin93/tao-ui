import type { Tab, TabBarExtraContent } from '@rc-component/tabs';
import {
  Children,
  type CSSProperties,
  Fragment,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  useImperativeHandle,
  useRef,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Skeleton } from '../skeleton/skeleton';
import { CardTabs, type CardTabsProps } from './card-tabs';
import './card.css';

export type { CardTabsProps } from './card-tabs';
export type CardSemanticPart =
  | 'root'
  | 'header'
  | 'body'
  | 'extra'
  | 'title'
  | 'actions'
  | 'cover';
export type CardSize = 'small' | 'medium' | 'middle' | 'default';
export type CardType = 'inner';
export interface CardTabListType extends Omit<Tab, 'label'> {
  label?: ReactNode;
  tab?: ReactNode;
}
export interface CardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  prefixCls?: string;
  rootClassName?: string;
  title?: ReactNode;
  extra?: ReactNode;
  /** @deprecated Use variant. */
  bordered?: boolean;
  /** @deprecated Use styles.header. */
  headStyle?: CSSProperties;
  /** @deprecated Use styles.body. */
  bodyStyle?: CSSProperties;
  loading?: boolean;
  hoverable?: boolean;
  size?: CardSize;
  type?: CardType;
  cover?: ReactNode;
  actions?: ReactNode[];
  tabList?: CardTabListType[];
  tabBarExtraContent?: TabBarExtraContent;
  onTabChange?: (key: string) => void;
  activeTabKey?: string;
  defaultActiveTabKey?: string;
  tabProps?: CardTabsProps;
  variant?: 'borderless' | 'outlined';
  classNames?:
    | SemanticClassNames<CardSemanticPart>
    | ((info: { props: CardProps }) => SemanticClassNames<CardSemanticPart>);
  styles?:
    | SemanticStyles<CardSemanticPart>
    | ((info: { props: CardProps }) => SemanticStyles<CardSemanticPart>);
}
export type CardGridSemanticPart = 'root';
export interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
  hoverable?: boolean;
  classNames?: SemanticClassNames<CardGridSemanticPart>;
  styles?: SemanticStyles<CardGridSemanticPart>;
}
export interface CardGridRef {
  nativeElement: HTMLDivElement;
}
export type CardMetaSemanticPart =
  | 'root'
  | 'section'
  | 'avatar'
  | 'title'
  | 'description';
export interface CardMetaProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  prefixCls?: string;
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  classNames?:
    | SemanticClassNames<CardMetaSemanticPart>
    | ((info: {
        props: CardMetaProps;
      }) => SemanticClassNames<CardMetaSemanticPart>);
  styles?:
    | SemanticStyles<CardMetaSemanticPart>
    | ((info: {
        props: CardMetaProps;
      }) => SemanticStyles<CardMetaSemanticPart>);
}
export interface CardMetaRef {
  nativeElement: HTMLDivElement;
}
const renderable = (node: ReactNode) =>
  node !== null && node !== undefined && typeof node !== 'boolean';

const CardGrid = forwardRef<CardGridRef, CardGridProps>(
  (
    {
      prefixCls,
      hoverable = true,
      classNames,
      styles,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const node = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({ nativeElement: node.current! }));
    return (
      <div
        {...rest}
        ref={node}
        data-tao-card-grid=""
        data-tao-hoverable={hoverable || undefined}
        className={cx(
          prefixCls && `${prefixCls}-grid`,
          classNames?.root,
          className,
        )}
        style={{ ...styles?.root, ...style }}
      />
    );
  },
);
CardGrid.displayName = 'Card.Grid';
const CardMeta = forwardRef<CardMetaRef, CardMetaProps>((props, ref) => {
  const {
    prefixCls,
    avatar,
    title,
    description,
    classNames,
    styles,
    className,
    style,
    ...rest
  } = props;
  const classes =
    typeof classNames === 'function' ? classNames({ props }) : classNames;
  const slots = typeof styles === 'function' ? styles({ props }) : styles;
  const node = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({ nativeElement: node.current! }));
  return (
    <div
      {...rest}
      ref={node}
      data-tao-card-meta=""
      className={cx(prefixCls && `${prefixCls}-meta`, classes?.root, className)}
      style={{ ...slots?.root, ...style }}
    >
      {renderable(avatar) && (
        <div
          data-tao-card-meta-avatar=""
          className={classes?.avatar}
          style={slots?.avatar}
        >
          {avatar}
        </div>
      )}
      {(renderable(title) || renderable(description)) && (
        <div
          data-tao-card-meta-section=""
          className={classes?.section}
          style={slots?.section}
        >
          {renderable(title) && (
            <div
              data-tao-card-meta-title=""
              className={classes?.title}
              style={slots?.title}
            >
              {title}
            </div>
          )}
          {renderable(description) && (
            <div
              data-tao-card-meta-description=""
              className={classes?.description}
              style={slots?.description}
            >
              {description}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
CardMeta.displayName = 'Card.Meta';
function containsGrid(children: ReactNode): boolean {
  return Children.toArray(children).some(
    (child) =>
      isValidElement<{ children?: ReactNode }>(child) &&
      (child.type === CardGrid ||
        (child.type === Fragment && containsGrid(child.props.children))),
  );
}
const CardRoot = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const ctx = useTaoConfig();
  const {
    prefixCls,
    rootClassName,
    title,
    extra,
    bordered,
    headStyle,
    bodyStyle,
    loading,
    hoverable,
    size = ctx.size === 'small' ? 'small' : 'medium',
    type,
    cover,
    actions,
    tabList,
    tabBarExtraContent,
    onTabChange,
    activeTabKey,
    defaultActiveTabKey,
    tabProps = {},
    variant = bordered === false ? 'borderless' : 'outlined',
    classNames,
    styles,
    className,
    style,
    children,
    ...rest
  } = props;
  const mergedProps = { ...props, size, variant };
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: mergedProps })
      : classNames;
  const slots =
    typeof styles === 'function' ? styles({ props: mergedProps }) : styles;
  const hasBody = loading || Children.toArray(children).length > 0;
  return (
    <div
      {...rest}
      ref={ref}
      data-tao-card=""
      data-tao-size={size === 'small' ? 'small' : 'medium'}
      data-tao-variant={variant}
      data-tao-type={type}
      data-tao-loading={loading || undefined}
      data-tao-hoverable={hoverable || undefined}
      data-tao-has-grid={containsGrid(children) || undefined}
      className={cx(prefixCls, classes?.root, className, rootClassName)}
      style={{ ...slots?.root, ...style }}
    >
      {(renderable(title) || renderable(extra) || tabList) && (
        <div
          data-tao-card-header=""
          className={classes?.header}
          style={{ ...headStyle, ...slots?.header }}
        >
          {(renderable(title) || renderable(extra)) && (
            <div data-tao-card-heading="">
              {renderable(title) && (
                <div
                  data-tao-card-title=""
                  className={classes?.title}
                  style={slots?.title}
                >
                  {title}
                </div>
              )}
              {renderable(extra) && (
                <div
                  data-tao-card-extra=""
                  className={classes?.extra}
                  style={slots?.extra}
                >
                  {extra}
                </div>
              )}
            </div>
          )}
          {tabList && (
            <CardTabs
              size={size === 'small' ? 'small' : 'large'}
              direction={rest.dir === 'rtl' ? 'rtl' : 'ltr'}
              {...tabProps}
              {...(activeTabKey !== undefined
                ? { activeKey: activeTabKey }
                : {
                    defaultActiveKey:
                      defaultActiveTabKey ?? tabProps.defaultActiveKey,
                  })}
              tabBarExtraContent={tabBarExtraContent}
              items={tabList.map(({ tab, ...item }) => ({
                label: tab,
                ...item,
              }))}
              onChange={(key) => {
                tabProps.onChange?.(key);
                onTabChange?.(key);
              }}
            />
          )}
        </div>
      )}
      {renderable(cover) && (
        <div
          data-tao-card-cover=""
          className={classes?.cover}
          style={slots?.cover}
        >
          {cover}
        </div>
      )}
      {hasBody && (
        <div
          data-tao-card-body=""
          className={classes?.body}
          style={{ ...bodyStyle, ...slots?.body }}
        >
          {loading ? (
            <Skeleton loading active title={false} paragraph={{ rows: 4 }}>
              {children}
            </Skeleton>
          ) : (
            children
          )}
        </div>
      )}
      {!!actions?.length && (
        <ul
          data-tao-card-actions=""
          className={classes?.actions}
          style={slots?.actions}
        >
          {Children.toArray(actions).map((action, index) => {
            const key = isValidElement(action) ? action.key : `action-${index}`;
            return <li key={key}>{action}</li>;
          })}
        </ul>
      )}
    </div>
  );
});
CardRoot.displayName = 'Card';
export const Card = Object.assign(CardRoot, { Grid: CardGrid, Meta: CardMeta });
