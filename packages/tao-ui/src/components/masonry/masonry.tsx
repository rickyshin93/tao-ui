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
  const count =
    typeof columns === 'number'
      ? columns
      : columns
        ? (resolveResponsiveValue(columns, screens) ?? columns.xs ?? 1)
        : 3;
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
      const column = Math.min(
        item.column ?? heights.indexOf(Math.min(...heights)),
        count - 1,
      );
      const top = heights[column];
      heights[column] +=
        (refs.current.get(item.key)?.getBoundingClientRect().height ??
          item.height ??
          0) + gap;
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
    const order = positions.map(({ key, column }) => ({ key, column }));
    if (
      order.length !== previousColumns.current.length ||
      order.some(
        (item, i) =>
          item.key !== previousColumns.current[i].key ||
          item.column !== previousColumns.current[i].column,
      )
    ) {
      previousColumns.current = order;
      callback.current?.(order);
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
          position?.column ?? Math.min(item.column ?? index % count, count - 1);
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
