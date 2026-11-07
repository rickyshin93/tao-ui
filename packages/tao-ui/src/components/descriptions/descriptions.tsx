import {
  Children,
  type CSSProperties,
  Fragment,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type Key,
  type ReactNode,
  useImperativeHandle,
  useRef,
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
import './descriptions.css';

export type DescriptionsSemanticPart =
  | 'root'
  | 'header'
  | 'title'
  | 'extra'
  | 'label'
  | 'content';
export type DescriptionsItemSemanticPart = 'label' | 'content';
export interface DescriptionsItemProps {
  prefixCls?: string;
  className?: string;
  style?: CSSProperties;
  label?: ReactNode;
  labelStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  classNames?: SemanticClassNames<DescriptionsItemSemanticPart>;
  styles?: SemanticStyles<DescriptionsItemSemanticPart>;
  span?: number | 'filled' | TaoBreakpointMap<number>;
  children?: ReactNode;
}
export interface DescriptionsItemType
  extends Omit<DescriptionsItemProps, 'prefixCls'> {
  key?: Key;
}
export interface DescriptionsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  prefixCls?: string;
  rootClassName?: string;
  bordered?: boolean;
  size?: 'small' | 'medium' | 'middle' | 'large' | 'default';
  title?: ReactNode;
  extra?: ReactNode;
  column?: number | TaoBreakpointMap<number>;
  layout?: 'horizontal' | 'vertical';
  colon?: boolean;
  labelStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  classNames?:
    | SemanticClassNames<DescriptionsSemanticPart>
    | ((info: {
        props: DescriptionsProps;
      }) => SemanticClassNames<DescriptionsSemanticPart>);
  styles?:
    | SemanticStyles<DescriptionsSemanticPart>
    | ((info: {
        props: DescriptionsProps;
      }) => SemanticStyles<DescriptionsSemanticPart>);
  items?: DescriptionsItemType[];
}
export interface DescriptionsRef {
  nativeElement: HTMLDivElement;
}
const renderable = (value: ReactNode) =>
  value !== undefined && value !== null && typeof value !== 'boolean';
function childrenToItems(
  children: ReactNode,
  parentKeys: (string | null)[] = [],
): DescriptionsItemType[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<DescriptionsItemProps>(child)) return [];
    const keys = [...parentKeys, child.key];
    return child.type === Fragment
      ? childrenToItems(child.props.children, keys)
      : [{ ...child.props, key: JSON.stringify(keys) }];
  });
}
function DescriptionsItem({ children }: DescriptionsItemProps) {
  return <>{children}</>;
}
type ResolvedItem = Omit<DescriptionsItemProps, 'span'> & {
  key?: Key;
  span: number;
};
const DescriptionsRoot = forwardRef<DescriptionsRef, DescriptionsProps>(
  (props, ref) => {
    const config = useTaoConfig();
    const {
      prefixCls,
      rootClassName,
      bordered,
      size = config.size,
      title,
      extra,
      column,
      layout = 'horizontal',
      colon = true,
      labelStyle,
      contentStyle,
      classNames,
      styles,
      items,
      children,
      className,
      style,
      ...rest
    } = props;
    const screens = useBreakpoint();
    const columns =
      typeof column === 'number'
        ? column
        : (resolveResponsiveValue(column ?? {}, screens) ??
          resolveResponsiveValue({ xs: 1, sm: 2, md: 3, xxxl: 4 }, screens) ??
          3);
    const source = items ?? childrenToItems(children);
    const rows: ResolvedItem[][] = [];
    let current: ResolvedItem[] = [];
    let used = 0;
    source.forEach((item) => {
      const remaining = columns - used;
      const span =
        item.span === 'filled'
          ? remaining
          : Math.min(
              resolveResponsiveValue(item.span ?? 1, screens) ?? 1,
              remaining,
            );
      current.push({ ...item, span });
      used += span;
      if (used >= columns || item.span === 'filled') {
        rows.push(current);
        current = [];
        used = 0;
      }
    });
    if (current.length) {
      current[current.length - 1].span += columns - used;
      rows.push(current);
    }
    const merged = { ...props, column: columns, size, layout, colon };
    const classes =
      typeof classNames === 'function'
        ? classNames({ props: merged })
        : classNames;
    const slots =
      typeof styles === 'function' ? styles({ props: merged }) : styles;
    const node = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({ nativeElement: node.current! }));
    function cell(
      item: ResolvedItem,
      index: number,
      part: 'label' | 'content' | 'item',
      span: number,
    ) {
      const Tag = part === 'label' ? 'th' : 'td';
      const itemLabel = {
        ...labelStyle,
        ...slots?.label,
        ...item.labelStyle,
        ...item.styles?.label,
      };
      const itemContent = {
        ...contentStyle,
        ...slots?.content,
        ...item.contentStyle,
        ...item.styles?.content,
      };
      const partClass =
        part === 'label'
          ? cx(classes?.label, item.classNames?.label)
          : part === 'content'
            ? cx(classes?.content, item.classNames?.content)
            : undefined;
      return (
        <Tag
          key={`${item.key ?? index}-${part}`}
          colSpan={span}
          scope={
            part === 'label'
              ? layout === 'vertical'
                ? 'col'
                : 'row'
              : undefined
          }
          data-tao-descriptions-cell={part}
          className={cx(item.prefixCls, item.className, bordered && partClass)}
          style={{
            ...item.style,
            ...(bordered ? (part === 'label' ? itemLabel : itemContent) : {}),
          }}
        >
          {bordered ? (
            part === 'label' ? (
              item.label
            ) : (
              item.children
            )
          ) : (
            <div data-tao-descriptions-item="">
              {part !== 'content' && renderable(item.label) && (
                <span
                  data-tao-descriptions-label=""
                  data-tao-colon={colon || undefined}
                  className={cx(classes?.label, item.classNames?.label)}
                  style={itemLabel}
                >
                  {item.label}
                </span>
              )}
              {part !== 'label' && renderable(item.children) && (
                <span
                  data-tao-descriptions-content=""
                  className={cx(classes?.content, item.classNames?.content)}
                  style={itemContent}
                >
                  {item.children}
                </span>
              )}
            </div>
          )}
        </Tag>
      );
    }
    return (
      <div
        {...rest}
        ref={node}
        data-tao-descriptions=""
        data-tao-bordered={bordered || undefined}
        data-tao-layout={layout}
        data-tao-size={
          size === 'middle' || size === 'default' ? 'medium' : size
        }
        className={cx(prefixCls, classes?.root, className, rootClassName)}
        style={{ ...slots?.root, ...style }}
      >
        {(renderable(title) || renderable(extra)) && (
          <div
            data-tao-descriptions-header=""
            className={classes?.header}
            style={slots?.header}
          >
            {renderable(title) && (
              <div
                data-tao-descriptions-title=""
                className={classes?.title}
                style={slots?.title}
              >
                {title}
              </div>
            )}
            {renderable(extra) && (
              <div
                data-tao-descriptions-extra=""
                className={classes?.extra}
                style={slots?.extra}
              >
                {extra}
              </div>
            )}
          </div>
        )}
        <div data-tao-descriptions-view="">
          <table>
            <tbody>
              {rows.map((row, index) =>
                layout === 'vertical' ? (
                  <Fragment key={row[0].key ?? index}>
                    <tr>
                      {row.map((item, i) => cell(item, i, 'label', item.span))}
                    </tr>
                    <tr>
                      {row.map((item, i) =>
                        cell(item, i, 'content', item.span),
                      )}
                    </tr>
                  </Fragment>
                ) : (
                  <tr key={row[0].key ?? index}>
                    {row.flatMap((item, i) =>
                      bordered
                        ? [
                            cell(item, i, 'label', 1),
                            cell(item, i, 'content', item.span * 2 - 1),
                          ]
                        : [cell(item, i, 'item', item.span)],
                    )}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);
DescriptionsRoot.displayName = 'Descriptions';
export const Descriptions = Object.assign(DescriptionsRoot, {
  Item: DescriptionsItem,
});
