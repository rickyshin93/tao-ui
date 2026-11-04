import {
  Children,
  type CSSProperties,
  createContext,
  Fragment,
  forwardRef,
  type HTMLAttributes,
  type Key,
  type ReactElement,
  type ReactNode,
  type Ref,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Empty } from '../empty/empty';
import { type ListPagination, ListPaginationControl } from './list-pagination';

export type { ListPagination } from './list-pagination';

import { Spinner, type SpinnerProps } from '../spinner/spinner';
import './list.css';

export type ListSemanticPart =
  | 'root'
  | 'header'
  | 'items'
  | 'footer'
  | 'pagination'
  | 'empty';
export type ListItemSemanticPart = 'root' | 'actions' | 'extra';
export type ListItemMetaSemanticPart =
  | 'root'
  | 'avatar'
  | 'content'
  | 'title'
  | 'description';
export type ListItemSemanticName = ListItemSemanticPart;
export type ListItemSemanticClassNames =
  SemanticClassNames<ListItemSemanticPart>;
export type ListItemSemanticStyles = SemanticStyles<ListItemSemanticPart>;
export type ListSize = 'small' | 'default' | 'medium' | 'large';
export type ListItemLayout = 'horizontal' | 'vertical';
export type ColumnCount = number;
export type ColumnType =
  | 'gutter'
  | 'column'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'xxl'
  | 'xxxl';
type Breakpoint = Exclude<ColumnType, 'gutter' | 'column'>;
type Gutter = number | Partial<Record<Breakpoint, number>>;
export interface ListGridType extends Partial<Record<Breakpoint, number>> {
  column?: number;
  gutter?: Gutter | [Gutter, Gutter];
}
export interface ListLocale {
  emptyText: ReactNode;
}
export interface ListProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  bordered?: boolean;
  rootClassName?: string;
  children?: ReactNode;
  dataSource?: readonly T[];
  extra?: ReactNode;
  grid?: ListGridType;
  itemLayout?: ListItemLayout;
  loading?: boolean | SpinnerProps;
  loadMore?: ReactNode;
  pagination?: ListPagination | false;
  prefixCls?: string;
  rowKey?: ((item: T) => Key) | keyof T;
  renderItem?: (item: T, index: number) => ReactNode;
  size?: ListSize;
  split?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  locale?: ListLocale;
  classNames?: SemanticClassNames<ListSemanticPart>;
  styles?: SemanticStyles<ListSemanticPart>;
}
export interface ListConsumerProps {
  grid?: ListGridType;
  itemLayout?: ListItemLayout;
}
const ListContext = createContext<ListConsumerProps>({});
export interface ListItemProps extends HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
  extra?: ReactNode;
  actions?: ReactNode[];
  colStyle?: CSSProperties;
  classNames?: ListItemSemanticClassNames;
  styles?: ListItemSemanticStyles;
}
export interface ListItemMetaProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  avatar?: ReactNode;
  description?: ReactNode;
  prefixCls?: string;
  title?: ReactNode;
  classNames?: SemanticClassNames<ListItemMetaSemanticPart>;
  styles?: SemanticStyles<ListItemMetaSemanticPart>;
}
export interface ListItemMetaRef {
  nativeElement: HTMLDivElement;
}

const Meta = forwardRef<ListItemMetaRef, ListItemMetaProps>(
  (
    {
      avatar,
      title,
      description,
      prefixCls,
      className,
      classNames,
      styles,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const root = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({ nativeElement: root.current! }));
    return (
      <div
        {...rest}
        ref={root}
        data-tao-list-meta=""
        className={cx(prefixCls, classNames?.root, className)}
        style={{ ...styles?.root, ...style }}
      >
        {avatar != null && (
          <div
            data-tao-list-meta-avatar=""
            className={classNames?.avatar}
            style={styles?.avatar}
          >
            {avatar}
          </div>
        )}
        {(title != null || description != null) && (
          <div
            data-tao-list-meta-content=""
            className={classNames?.content}
            style={styles?.content}
          >
            {title != null && (
              <h4
                data-tao-list-meta-title=""
                className={classNames?.title}
                style={styles?.title}
              >
                {title}
              </h4>
            )}
            {description != null && (
              <div
                data-tao-list-meta-description=""
                className={classNames?.description}
                style={styles?.description}
              >
                {description}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    );
  },
);
Meta.displayName = 'List.Item.Meta';
const ItemRoot = forwardRef<HTMLDivElement, ListItemProps>(
  (
    {
      children,
      prefixCls,
      extra,
      actions,
      className,
      classNames,
      style,
      styles,
      colStyle,
      ...rest
    },
    ref,
  ) => {
    const { itemLayout = 'horizontal', grid } = useContext(ListContext);
    const actionNodes = actions?.length ? (
      <ul
        data-tao-list-item-actions=""
        className={classNames?.actions}
        style={styles?.actions}
      >
        {actions.map((action, index) => (
          <li key={String(index)}>{action}</li>
        ))}
      </ul>
    ) : null;
    return (
      <li data-tao-list-item-wrapper="">
        <div
          {...rest}
          ref={ref}
          data-tao-list-item=""
          data-tao-layout={itemLayout}
          data-tao-grid={grid ? '' : undefined}
          className={cx(prefixCls, classNames?.root, className)}
          style={{ ...colStyle, ...styles?.root, ...style }}
        >
          <div data-tao-list-item-main="">
            {children}
            {itemLayout === 'vertical' && actionNodes}
          </div>
          {itemLayout !== 'vertical' && actionNodes}
          {extra != null && (
            <div
              data-tao-list-item-extra=""
              className={classNames?.extra}
              style={styles?.extra}
            >
              {extra}
            </div>
          )}
        </div>
      </li>
    );
  },
);
ItemRoot.displayName = 'List.Item';
const Item = Object.assign(ItemRoot, { Meta });

function gridVariables(grid?: ListGridType): CSSProperties {
  if (!grid) return {};
  const result: Record<string, string | number> = {
    '--tao-list-columns': grid.column ?? 1,
  };
  for (const bp of ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'] as const)
    if (grid[bp]) result[`--tao-list-columns-${bp}`] = grid[bp];
  const [horizontal, vertical] = Array.isArray(grid.gutter)
    ? grid.gutter
    : [grid.gutter, grid.gutter];
  for (const [axis, value] of [
    ['x', horizontal],
    ['y', vertical],
  ] as const) {
    if (typeof value === 'number')
      result[`--tao-list-gap-${axis}`] = `${value}px`;
    else if (value)
      for (const [bp, size] of Object.entries(value))
        result[`--tao-list-gap-${axis}-${bp}`] = `${size}px`;
  }
  return result as CSSProperties;
}

function ListRoot<T>(
  {
    bordered = false,
    split = true,
    dataSource = [],
    renderItem,
    rowKey,
    children,
    grid,
    itemLayout = 'horizontal',
    size,
    loading = false,
    header,
    footer,
    extra,
    loadMore,
    pagination = false,
    locale,
    prefixCls,
    rootClassName,
    className,
    classNames,
    styles,
    style,
    ...rest
  }: ListProps<T>,
  ref: Ref<HTMLDivElement>,
) {
  const config = useTaoConfig();
  const paging = pagination || {};
  const [page, setPage] = useState(paging.defaultCurrent ?? 1);
  const [pageSize, setPageSize] = useState(paging.defaultPageSize ?? 10);
  const total = paging.total ?? dataSource.length;
  const resolvedPageSize = paging.pageSize ?? pageSize;
  const current = Math.max(
    1,
    Math.min(paging.current ?? page, Math.ceil(total / resolvedPageSize)),
  );
  const start = (current - 1) * resolvedPageSize;
  const data =
    pagination && dataSource.length > start
      ? dataSource.slice(start, start + resolvedPageSize)
      : dataSource;
  const spinner =
    typeof loading === 'boolean' ? { spinning: loading } : loading;
  const isLoading = spinner.spinning ?? typeof loading === 'object';
  const paginationNode =
    pagination && !(paging.hideOnSinglePage && total <= resolvedPageSize) ? (
      <div
        data-tao-list-pagination=""
        data-tao-align={paging.align ?? 'end'}
        className={classNames?.pagination}
        style={styles?.pagination}
      >
        <ListPaginationControl
          {...paging}
          total={total}
          current={current}
          pageSize={resolvedPageSize}
          onChange={(next, nextSize, info) => {
            setPage(next);
            setPageSize(nextSize);
            if (info) paging.onChange?.(next, nextSize, info);
            else paging.onChange?.(next, nextSize);
          }}
        />
      </div>
    ) : null;
  const content = data.length
    ? data.map((value, index) => {
        const key =
          typeof rowKey === 'function'
            ? rowKey(value)
            : rowKey
              ? (value[rowKey] as Key)
              : ((value as { key?: Key })?.key ?? index);
        return <Fragment key={key}>{renderItem?.(value, index)}</Fragment>;
      })
    : children;
  return (
    <ListContext.Provider value={{ grid, itemLayout }}>
      <div
        {...rest}
        ref={ref}
        data-tao-list=""
        data-tao-size={size === 'default' ? 'medium' : (size ?? config.size)}
        data-tao-bordered={bordered ? '' : undefined}
        data-tao-split={split ? '' : undefined}
        data-tao-grid={grid ? '' : undefined}
        className={cx(prefixCls, classNames?.root, rootClassName, className)}
        style={{ ...gridVariables(grid), ...styles?.root, ...style }}
      >
        {(paging.position === 'top' || paging.position === 'both') &&
          paginationNode}
        {header != null && (
          <div
            data-tao-list-header=""
            className={classNames?.header}
            style={styles?.header}
          >
            {header}
          </div>
        )}
        <Spinner {...spinner} spinning={isLoading}>
          <ul
            data-tao-list-items=""
            className={classNames?.items}
            style={styles?.items}
          >
            {Children.count(content) ? (
              content
            ) : isLoading ? (
              <li data-tao-list-loading="" />
            ) : (
              <li
                data-tao-list-empty=""
                className={classNames?.empty}
                style={styles?.empty}
              >
                {locale?.emptyText ?? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </li>
            )}
          </ul>
        </Spinner>
        {extra}
        {loadMore}
        {footer != null && (
          <div
            data-tao-list-footer=""
            className={classNames?.footer}
            style={styles?.footer}
          >
            {footer}
          </div>
        )}
        {paging.position !== 'top' && paginationNode}
      </div>
    </ListContext.Provider>
  );
}
export const List = Object.assign(
  forwardRef(ListRoot) as <T>(
    props: ListProps<T> & { ref?: Ref<HTMLDivElement> },
  ) => ReactElement,
  { Item },
);
