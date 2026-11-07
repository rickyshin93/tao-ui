import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type Key,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
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
import './masonry.css';
export type MasonrySemanticPart = 'root' | 'item';
export type MasonryGutter =
  | number
  | string
  | undefined
  | TaoBreakpointMap<number>;
export interface MasonryItemType<T = unknown> {
  key: Key;
  column?: number;
  height?: number;
  children?: ReactNode;
  data: T;
}
export interface MasonryProps<T = unknown>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  prefixCls?: string;
  rootClassName?: string;
  gutter?: MasonryGutter | [MasonryGutter, MasonryGutter];
  items?: MasonryItemType<T>[];
  itemRender?: (itemInfo: MasonryItemType<T> & { index: number }) => ReactNode;
  columns?: number | TaoBreakpointMap<number>;
  onLayoutChange?: (sortInfo: { key: Key; column: number }[]) => void;
  fresh?: boolean;
  children?: ReactNode;
  classNames?:
    | SemanticClassNames<MasonrySemanticPart>
    | ((info: {
        props: MasonryProps<T>;
      }) => SemanticClassNames<MasonrySemanticPart>);
  styles?:
    | SemanticStyles<MasonrySemanticPart>
    | ((info: {
        props: MasonryProps<T>;
      }) => SemanticStyles<MasonrySemanticPart>);
}
export interface MasonryRef {
  nativeElement: HTMLDivElement;
}
interface Layout {
  height: number;
  positions: { key: Key; column: number; top: number }[];
}
const EMPTY_ITEMS: MasonryItemType<never>[] = [];
function resolveColumn(column: number | undefined, count: number) {
  return column !== undefined && Number.isFinite(column)
    ? Math.max(0, Math.min(Math.floor(column), count - 1))
    : undefined;
}

function measureHeight(element: HTMLDivElement) {
  const style = getComputedStyle(element);
  if (style.display === 'none') return 0;
  if (!style.height.endsWith('px'))
    return element.getBoundingClientRect().height;
  const height = Number.parseFloat(style.height);
  if (style.boxSizing !== 'content-box') return height;
  return [
    style.paddingTop,
    style.paddingBottom,
    style.borderTopWidth,
    style.borderBottomWidth,
  ].reduce((total, size) => total + (Number.parseFloat(size) || 0), height);
}

function MasonryInner<T>(
  props: MasonryProps<T>,
  ref: React.ForwardedRef<MasonryRef>,
) {
  const {
    prefixCls,
    rootClassName,
    gutter = 0,
    items = EMPTY_ITEMS,
    itemRender,
    columns,
    onLayoutChange,
    fresh = false,
    classNames,
    styles,
    className,
    style,
    children: _children,
    onLoad,
    onError,
    ...rest
  } = props;
  const screens = useBreakpoint();
  const requestedCount =
    typeof columns === 'number'
      ? columns
      : columns
        ? (resolveResponsiveValue(columns, screens) ?? columns.xs ?? 1)
        : 3;
  const count = Number.isFinite(requestedCount)
    ? Math.max(1, Math.floor(requestedCount))
    : 1;
  const gaps = Array.isArray(gutter) ? gutter : [gutter, gutter];
  const horizontal = resolveResponsiveValue(gaps[0] ?? 0, screens) ?? 0;
  const vertical = resolveResponsiveValue(gaps[1] ?? horizontal, screens) ?? 0;
  const root = useRef<HTMLDivElement>(null);
  const refs = useRef(new Map<Key, HTMLDivElement>());
  const callback = useRef(onLayoutChange);
  const previousColumns = useRef<{ key: Key; column: number }[]>([]);
  const [layout, setLayout] = useState<Layout>({ height: 0, positions: [] });
  useImperativeHandle(ref, () => ({ nativeElement: root.current! }));
  useLayoutEffect(() => {
    callback.current = onLayoutChange;
  }, [onLayoutChange]);
  const measure = useCallback(() => {
    const element = root.current!;
    const gap = Number.parseFloat(getComputedStyle(element).rowGap) || 0;
    const heights = Array<number>(count).fill(0);
    const positions = items.map((item) => {
      const column =
        resolveColumn(item.column, count) ??
        heights.indexOf(Math.min(...heights));
      const top = heights[column];
      const node = refs.current.get(item.key);
      heights[column] +=
        (node ? measureHeight(node) : (item.height ?? 0)) + gap;
      return { key: item.key, column, top };
    });
    const next = {
      height: Math.max(0, ...heights) - (items.length ? gap : 0),
      positions,
    };
    setLayout((previous) =>
      previous.height === next.height &&
      previous.positions.length === positions.length &&
      previous.positions.every(
        (position, index) =>
          position.key === positions[index].key &&
          position.column === positions[index].column &&
          position.top === positions[index].top,
      )
        ? previous
        : next,
    );
    if (
      positions.length !== previousColumns.current.length ||
      positions.some(
        (item, i) =>
          item.key !== previousColumns.current[i].key ||
          item.column !== previousColumns.current[i].column,
      )
    ) {
      previousColumns.current = positions;
      callback.current?.(positions.map(({ key, column }) => ({ key, column })));
    }
  }, [count, items]);
  useLayoutEffect(() => {
    measure();
  });
  useLayoutEffect(() => {
    const observer = new ResizeObserver(measure);
    observer.observe(root.current!);
    if (fresh)
      refs.current.forEach((element) => {
        observer.observe(element);
      });
    return () => observer.disconnect();
  }, [measure, fresh]);
  const merged = { ...props, columns: count };
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: merged })
      : classNames;
  const slots =
    typeof styles === 'function' ? styles({ props: merged }) : styles;
  const gap = typeof horizontal === 'number' ? `${horizontal}px` : horizontal;
  const width = `calc((100% - (${count} - 1) * ${gap}) / ${count})`;
  return (
    <div
      {...rest}
      ref={root}
      data-tao-masonry=""
      className={cx(prefixCls, classes?.root, className, rootClassName)}
      style={{
        height: layout.height,
        rowGap: vertical,
        ...slots?.root,
        ...style,
      }}
      onLoad={(event) => {
        measure();
        onLoad?.(event);
      }}
      onError={(event) => {
        measure();
        onError?.(event);
      }}
    >
      {items.map((item, index) => {
        const position =
          layout.positions[index]?.key === item.key
            ? layout.positions[index]
            : undefined;
        const column =
          position?.column ??
          resolveColumn(item.column, count) ??
          index % count;
        return (
          <div
            key={item.key}
            ref={(node) => {
              if (node) refs.current.set(item.key, node);
              else refs.current.delete(item.key);
            }}
            data-tao-masonry-item=""
            data-tao-column={column}
            className={classes?.item}
            style={
              {
                ...slots?.item,
                position: 'absolute',
                width,
                height: item.height,
                insetInlineStart: `calc((${width} + ${gap}) * ${column})`,
                top: position?.top ?? 0,
              } as CSSProperties
            }
          >
            {item.children ?? itemRender?.({ ...item, index, column })}
          </div>
        );
      })}
    </div>
  );
}
export const Masonry = forwardRef(MasonryInner) as <T = unknown>(
  props: MasonryProps<T> & RefAttributes<MasonryRef>,
) => ReactElement;
