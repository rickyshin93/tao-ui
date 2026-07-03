import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  type TaoSize,
  type TaoVariant,
  useTaoConfig,
} from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Pagination } from '../pagination/pagination';
import './table.css';

// ---- Types ----

export type TableSemanticPart =
  | 'root'
  | 'scroll'
  | 'table'
  | 'header.wrapper'
  | 'header.row'
  | 'header.cell'
  | 'header.content'
  | 'header.title'
  | 'body.row'
  | 'body.cell'
  | 'selection.cell'
  | 'empty'
  | 'pagination';

export type TableVariant = TaoVariant | 'modern';

export type SortOrder = 'ascend' | 'descend' | null;

export interface TableFilterItem {
  text: ReactNode;
  value: string;
}

export interface TableColumn<T = any> {
  key?: string;
  dataIndex?: string;
  title?: ReactNode;
  render?: (value: any, record: T, index: number) => ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
  onCell?: (
    record: T,
    index: number,
  ) => TdHTMLAttributes<HTMLTableCellElement>;
  onHeaderCell?: (
    column: TableColumn<T>,
  ) => ThHTMLAttributes<HTMLTableCellElement>;

  // Sorting
  sorter?: ((a: T, b: T) => number) | boolean;
  sortOrder?: SortOrder;
  defaultSortOrder?: SortOrder;

  // Filtering
  filters?: TableFilterItem[];
  onFilter?: (value: string, record: T) => boolean;
  filteredValue?: string[];
}

export interface TableRowSelection<T = any> {
  type?: 'checkbox' | 'radio';
  selectedRowKeys?: React.Key[];
  onChange?: (selectedKeys: React.Key[], selectedRows: T[]) => void;
  getCheckboxProps?: (record: T) => { disabled?: boolean };
  fixed?: boolean;
  columnWidth?: number | string;
}

export interface TablePagination {
  current?: number;
  pageSize?: number;
  total?: number;
  defaultCurrent?: number;
  defaultPageSize?: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  showTotal?: (total: number, range: [number, number]) => ReactNode;
}

export interface SorterResult<T = any> {
  column?: TableColumn<T>;
  order: SortOrder;
  field?: string;
}

export type TableSemanticInfo<T = any> = { props: TableProps<T> };
export type TableSemanticClassNames<T = any> =
  | SemanticClassNames<TableSemanticPart>
  | ((info: TableSemanticInfo<T>) => SemanticClassNames<TableSemanticPart>);
export type TableSemanticStyles<T = any> =
  | SemanticStyles<TableSemanticPart>
  | ((info: TableSemanticInfo<T>) => SemanticStyles<TableSemanticPart>);

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  dataSource: T[];
  rowKey: string | ((record: T) => React.Key);
  loading?: boolean;
  pagination?: TablePagination | false;
  onChange?: (
    pagination: { current: number; pageSize: number },
    filters: Record<string, string[] | null>,
    sorter: SorterResult<T>,
  ) => void;
  scroll?: { x?: number | string };
  rowSelection?: TableRowSelection<T>;
  rowClassName?: string | ((record: T, index: number) => string);
  rowStyle?: CSSProperties | ((record: T, index: number) => CSSProperties);
  onRow?: (record: T, index: number) => HTMLAttributes<HTMLTableRowElement>;
  onHeaderRow?: (
    columns: TableColumn<T>[],
    index: number,
  ) => HTMLAttributes<HTMLTableRowElement>;
  size?: TaoSize;
  /**
   * 表面风格。
   * - `borderless`（极简）：无表头底色、单元格透明、仅行底分隔线。
   * - `filled`：表头灰底。
   * - `outlined`：filled + 整体外框 + 列分隔线。
   * - `modern`：轻外框、圆角、克制表头，更接近 shadcn 的表格视觉。
   *
   * 不传时继承 TaoProvider 的 variant；当继承到框架默认 `outlined` 时，
   * Table 回落为 `modern`，让裸用 `<Table>` 默认呈现现代轻外框风格。
   */
  variant?: TableVariant;
  /**
   * 表头灰底开关，默认 `true`。设为 `false` 关掉表头底色（极简表头），
   * 不影响外框 / 列分隔线等其它 variant 表现。
   */
  headerBackground?: boolean;
  emptyText?: ReactNode;
  bordered?: boolean;
  className?: string;
  style?: CSSProperties;
  classNames?: TableSemanticClassNames<T>;
  styles?: TableSemanticStyles<T>;
}

// ---- Helpers ----

function getRowKey<T>(
  record: T,
  rowKey: string | ((record: T) => React.Key),
): React.Key {
  if (typeof rowKey === 'function') return rowKey(record);
  return (record as any)[rowKey];
}

function getColKey<T>(col: TableColumn<T>, index: number): string {
  return col.key ?? col.dataIndex ?? String(index);
}

function getCellValue<T>(record: T, dataIndex?: string): any {
  if (!dataIndex) return undefined;
  return (record as any)[dataIndex];
}

function resolveSemanticClassNames<T>(
  classNames: TableSemanticClassNames<T> | undefined,
  props: TableProps<T>,
): SemanticClassNames<TableSemanticPart> {
  return typeof classNames === 'function' ? classNames({ props }) : (classNames ?? {});
}

function resolveSemanticStyles<T>(
  styles: TableSemanticStyles<T> | undefined,
  props: TableProps<T>,
): SemanticStyles<TableSemanticPart> {
  return typeof styles === 'function' ? styles({ props }) : (styles ?? {});
}

function resolveRowClassName<T>(
  rowClassName: TableProps<T>['rowClassName'],
  record: T,
  index: number,
) {
  return typeof rowClassName === 'function'
    ? rowClassName(record, index)
    : rowClassName;
}

function resolveRowStyle<T>(
  rowStyle: TableProps<T>['rowStyle'],
  record: T,
  index: number,
) {
  return typeof rowStyle === 'function' ? rowStyle(record, index) : rowStyle;
}

// ---- Icons ----

function SortIcon({ order }: { order: SortOrder }) {
  return (
    <span data-tao-table-sort-icon="" data-tao-sort-order={order ?? undefined}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M7 2.5L10 6H4L7 2.5Z"
          fill="currentColor"
          opacity={order === 'ascend' ? 1 : 0.3}
        />
        <path
          d="M7 11.5L4 8H10L7 11.5Z"
          fill="currentColor"
          opacity={order === 'descend' ? 1 : 0.3}
        />
      </svg>
    </span>
  );
}

function FilterIcon({ active }: { active: boolean }) {
  return (
    <span data-tao-table-filter-icon="" data-tao-active={active || undefined}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M2 3h10L8.5 7.5V11L5.5 12V7.5L2 3Z"
          stroke="currentColor"
          fill={active ? 'currentColor' : 'none'}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function LoadingSpinner() {
  return (
    <div data-tao-table-loading="">
      <svg
        data-tao-table-spinner=""
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          opacity="0.2"
        />
        <path
          d="M12 2a10 10 0 019.8 8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2.5 6L5 8.5L9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---- Filter Dropdown ----

function FilterDropdown({
  filters,
  activeValues,
  onSelect,
}: {
  filters: TableFilterItem[];
  activeValues: string[];
  onSelect: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const toggle = (val: string) => {
    const next = activeValues.includes(val)
      ? activeValues.filter((v) => v !== val)
      : [...activeValues, val];
    onSelect(next);
  };

  return (
    <div data-tao-table-filter-dropdown="" ref={ref}>
      <button
        type="button"
        data-tao-table-filter-trigger=""
        onClick={() => setOpen(!open)}
        aria-label="Filter"
      >
        <FilterIcon active={activeValues.length > 0} />
      </button>
      {open && (
        <div data-tao-table-filter-panel="">
          {filters.map((f) => {
            const checked = activeValues.includes(f.value);
            return (
              <label
                key={f.value}
                data-tao-table-filter-option=""
                onClick={() => toggle(f.value)}
              >
                <span
                  data-tao-table-filter-check=""
                  data-tao-checked={checked || undefined}
                >
                  {checked && <CheckIcon />}
                </span>
                <span>{f.text}</span>
              </label>
            );
          })}
          {activeValues.length > 0 && (
            <button
              type="button"
              data-tao-table-filter-reset=""
              onClick={() => onSelect([])}
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Table ----

export function Table<T = any>({
  columns,
  dataSource,
  rowKey,
  loading = false,
  pagination: paginationProp,
  onChange,
  scroll,
  rowSelection,
  size,
  variant,
  headerBackground = true,
  emptyText = 'No Data',
  bordered = false,
  className,
  style,
  classNames,
  styles,
  rowClassName,
  rowStyle,
  onRow,
  onHeaderRow,
}: TableProps<T>) {
  const ctx = useTaoConfig();
  const resolvedSize = size ?? ctx.size;
  // Inherit variant from provider, but treat the framework default `outlined`
  // as `modern` so a bare <Table> uses the modern table skin by default.
  const resolvedVariant: TableVariant =
    variant ?? (ctx.variant === 'outlined' ? 'modern' : ctx.variant);
  // outlined variant draws the full border; `bordered` prop still works for
  // other variants. Modern owns its subtle outer frame; borderless stays
  // frame-free.
  const showBorder =
    resolvedVariant === 'outlined' ||
    resolvedVariant === 'modern' ||
    (bordered && resolvedVariant !== 'borderless');
  const semanticProps: TableProps<T> = {
    columns,
    dataSource,
    rowKey,
    loading,
    pagination: paginationProp,
    onChange,
    scroll,
    rowSelection,
    rowClassName,
    rowStyle,
    onRow,
    onHeaderRow,
    size,
    variant,
    headerBackground,
    emptyText,
    bordered,
    className,
    style,
    classNames,
    styles,
  };
  const resolvedClassNames = resolveSemanticClassNames(classNames, semanticProps);
  const resolvedStyles = resolveSemanticStyles(styles, semanticProps);

  // ---- Sort state ----
  const defaultSortCol = columns.find((c) => c.defaultSortOrder);
  const [sortKey, setSortKey] = useState<string | null>(
    defaultSortCol
      ? getColKey(defaultSortCol, columns.indexOf(defaultSortCol))
      : null,
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    defaultSortCol?.defaultSortOrder ?? null,
  );

  // ---- Filter state ----
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>(
    () => {
      const init: Record<string, string[]> = {};
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        if (col.filters) {
          const key = getColKey(col, i);
          init[key] = col.filteredValue ?? [];
        }
      }
      return init;
    },
  );

  // ---- Pagination state ----
  const hasPagination = paginationProp !== false;
  const paginationConfig =
    paginationProp === false ? undefined : paginationProp;
  const [internalPage, setInternalPage] = useState(
    paginationConfig?.defaultCurrent ?? 1,
  );
  const [internalPageSize, setInternalPageSize] = useState(
    paginationConfig?.defaultPageSize ?? paginationConfig?.pageSize ?? 10,
  );
  const currentPage = paginationConfig?.current ?? internalPage;
  const pageSize = paginationConfig?.pageSize ?? internalPageSize;

  // ---- Build sorter result ----
  const buildSorterResult = useCallback(
    (key: string | null, order: SortOrder): SorterResult<T> => {
      if (!key || !order) return { order: null };
      const colIdx = columns.findIndex((c, i) => getColKey(c, i) === key);
      const col = columns[colIdx];
      return {
        column: col,
        order,
        field: col?.dataIndex,
      };
    },
    [columns],
  );

  // ---- Build filters record ----
  const buildFiltersRecord = useCallback(
    (fv: Record<string, string[]>): Record<string, string[] | null> => {
      const result: Record<string, string[] | null> = {};
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        if (col.filters) {
          const key = getColKey(col, i);
          const vals = fv[key];
          result[col.dataIndex ?? key] = vals && vals.length > 0 ? vals : null;
        }
      }
      return result;
    },
    [columns],
  );

  // ---- Trigger onChange ----
  const triggerChange = useCallback(
    (
      page: number,
      ps: number,
      sk: string | null,
      so: SortOrder,
      fv: Record<string, string[]>,
    ) => {
      onChange?.(
        { current: page, pageSize: ps },
        buildFiltersRecord(fv),
        buildSorterResult(sk, so),
      );
    },
    [onChange, buildFiltersRecord, buildSorterResult],
  );

  // ---- Handle sort click ----
  const handleSort = useCallback(
    (colKey: string, col: TableColumn<T>) => {
      // Controlled sort — do nothing internally
      if (col.sortOrder !== undefined) {
        triggerChange(
          currentPage,
          pageSize,
          colKey,
          nextSortOrder(col.sortOrder),
          filterValues,
        );
        return;
      }
      const next = sortKey === colKey ? nextSortOrder(sortOrder) : 'ascend';
      const newKey = next === null ? null : colKey;
      setSortKey(newKey);
      setSortOrder(next);
      triggerChange(currentPage, pageSize, newKey, next, filterValues);
    },
    [sortKey, sortOrder, currentPage, pageSize, filterValues, triggerChange],
  );

  // ---- Handle filter ----
  const handleFilter = useCallback(
    (colKey: string, values: string[]) => {
      const next = { ...filterValues, [colKey]: values };
      setFilterValues(next);
      // Reset to page 1 on filter change
      setInternalPage(1);
      triggerChange(1, pageSize, sortKey, sortOrder, next);
    },
    [filterValues, pageSize, sortKey, sortOrder, triggerChange],
  );

  // ---- Handle pagination ----
  const handlePageChange = useCallback(
    (page: number, ps: number) => {
      setInternalPage(page);
      setInternalPageSize(ps);
      triggerChange(page, ps, sortKey, sortOrder, filterValues);
    },
    [sortKey, sortOrder, filterValues, triggerChange],
  );

  // ---- Process data: filter → sort → paginate ----
  const processedData = useMemo(() => {
    let data = [...dataSource];

    // Apply client-side filters
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (!col.filters || !col.onFilter) continue;
      const key = getColKey(col, i);
      const controlledValues = col.filteredValue;
      const activeVals = controlledValues ?? filterValues[key];
      if (activeVals && activeVals.length > 0) {
        data = data.filter((record) =>
          activeVals.some((v) => col.onFilter!(v, record)),
        );
      }
    }

    // Apply client-side sort
    const activeSortCol = columns.find((col, i) => {
      const key = getColKey(col, i);
      const order =
        col.sortOrder !== undefined
          ? col.sortOrder
          : sortKey === key
            ? sortOrder
            : null;
      return order !== null && typeof col.sorter === 'function';
    });
    if (activeSortCol && typeof activeSortCol.sorter === 'function') {
      const colIdx = columns.indexOf(activeSortCol);
      const key = getColKey(activeSortCol, colIdx);
      const order =
        activeSortCol.sortOrder !== undefined
          ? activeSortCol.sortOrder
          : sortKey === key
            ? sortOrder
            : null;
      const sorterFn = activeSortCol.sorter as (a: T, b: T) => number;
      data.sort((a, b) => {
        const result = sorterFn(a, b);
        return order === 'descend' ? -result : result;
      });
    }

    return data;
  }, [dataSource, columns, filterValues, sortKey, sortOrder]);

  // ---- Paginate ----
  const totalForPagination = paginationConfig?.total ?? processedData.length;
  const paginatedData = useMemo(() => {
    if (!hasPagination) return processedData;
    // If user provides total, assume server-side pagination — show all data as-is
    if (paginationConfig?.total !== undefined) return processedData;
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, hasPagination, paginationConfig, currentPage, pageSize]);

  // ---- Row selection ----
  const selectionColWidth = rowSelection?.columnWidth ?? 48;
  const selectionType = rowSelection?.type ?? 'checkbox';
  const selectedKeys = rowSelection?.selectedRowKeys ?? [];

  const handleSelectRow = useCallback(
    (key: React.Key, record: T) => {
      if (!rowSelection?.onChange) return;
      let nextKeys: React.Key[];
      if (selectionType === 'radio') {
        nextKeys = [key];
      } else {
        nextKeys = selectedKeys.includes(key)
          ? selectedKeys.filter((k) => k !== key)
          : [...selectedKeys, key];
      }
      const nextRows = dataSource.filter((r) =>
        nextKeys.includes(getRowKey(r, rowKey)),
      );
      rowSelection.onChange(nextKeys, nextRows);
    },
    [rowSelection, selectionType, selectedKeys, dataSource, rowKey],
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!rowSelection?.onChange) return;
      if (checked) {
        const allKeys = paginatedData
          .filter((r) => {
            const props = rowSelection.getCheckboxProps?.(r);
            return !props?.disabled;
          })
          .map((r) => getRowKey(r, rowKey));
        const nextRows = dataSource.filter((r) =>
          allKeys.includes(getRowKey(r, rowKey)),
        );
        rowSelection.onChange(allKeys, nextRows);
      } else {
        rowSelection.onChange([], []);
      }
    },
    [rowSelection, paginatedData, dataSource, rowKey],
  );

  // ---- Scroll + sticky columns ----
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<
    'left' | 'middle' | 'right' | 'both'
  >('left');

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const atLeft = scrollLeft <= 1;
    const atRight = scrollLeft + clientWidth >= scrollWidth - 1;
    if (atLeft && atRight) setScrollState('both');
    else if (atLeft) setScrollState('left');
    else if (atRight) setScrollState('right');
    else setScrollState('middle');
  }, []);

  useEffect(() => {
    if (!scroll?.x) return;
    handleScroll();
  }, [scroll?.x, handleScroll]);

  // ---- Compute sticky positions ----
  const allColumns = useMemo(() => {
    const cols: (TableColumn<T> & { _key: string; _index: number })[] = [];

    // Selection column
    if (rowSelection) {
      cols.push({
        _key: '__selection__',
        _index: -1,
        width: selectionColWidth,
        fixed: rowSelection.fixed ? 'left' : undefined,
      });
    }

    columns.forEach((col, i) => {
      cols.push({ ...col, _key: getColKey(col, i), _index: i });
    });

    return cols;
  }, [columns, rowSelection, selectionColWidth]);

  const stickyPositions = useMemo(() => {
    if (!scroll?.x) return {};
    const positions: Record<string, { left?: number; right?: number }> = {};

    // Left fixed
    let leftOffset = 0;
    for (const col of allColumns) {
      if (col.fixed === 'left') {
        positions[col._key] = { left: leftOffset };
        leftOffset += typeof col.width === 'number' ? col.width : 0;
      }
    }

    // Right fixed
    let rightOffset = 0;
    for (let i = allColumns.length - 1; i >= 0; i--) {
      const col = allColumns[i];
      if (col.fixed === 'right') {
        positions[col._key] = { right: rightOffset };
        rightOffset += typeof col.width === 'number' ? col.width : 0;
      }
    }

    return positions;
  }, [allColumns, scroll?.x]);

  // ---- Resolve sort order for a column ----
  const getResolvedSortOrder = (
    col: TableColumn<T>,
    colKey: string,
  ): SortOrder => {
    if (col.sortOrder !== undefined) return col.sortOrder;
    return sortKey === colKey ? sortOrder : null;
  };

  // ---- Render ----
  const tableStyle: React.CSSProperties = scroll?.x
    ? { minWidth: typeof scroll.x === 'number' ? `${scroll.x}px` : scroll.x }
    : {};

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData
      .filter((r) => !rowSelection?.getCheckboxProps?.(r)?.disabled)
      .every((r) => selectedKeys.includes(getRowKey(r, rowKey)));

  const isIndeterminate = !isAllSelected && selectedKeys.length > 0;

  return (
    <div
      data-tao-table-wrapper=""
      data-tao-size={resolvedSize}
      data-tao-variant={resolvedVariant}
      data-tao-header-bg={headerBackground ? undefined : 'off'}
      data-tao-bordered={showBorder || undefined}
      data-tao-scroll-state={scroll?.x ? scrollState : undefined}
      className={cx(resolvedClassNames.root, className)}
      style={{ ...resolvedStyles.root, ...style }}
    >
      <div
        data-tao-table-scroll=""
        ref={scrollRef}
        onScroll={scroll?.x ? handleScroll : undefined}
        className={resolvedClassNames.scroll}
        style={resolvedStyles.scroll}
      >
        {loading && <LoadingSpinner />}
        <table
          data-tao-table=""
          className={resolvedClassNames.table}
          style={{ ...tableStyle, ...resolvedStyles.table }}
        >
          <thead
            data-tao-table-thead=""
            className={resolvedClassNames['header.wrapper']}
            style={resolvedStyles['header.wrapper']}
          >
            {(() => {
              const headerRowProps = onHeaderRow?.(columns, 0) ?? {};

              return (
                <tr
                  {...headerRowProps}
                  className={cx(
                    resolvedClassNames['header.row'],
                    headerRowProps.className,
                  )}
                  style={{
                    ...resolvedStyles['header.row'],
                    ...headerRowProps.style,
                  }}
                >
                  {rowSelection && (
                    <th
                      data-tao-table-cell=""
                      data-tao-table-selection-cell=""
                      data-tao-fixed="left"
                      className={resolvedClassNames['selection.cell']}
                      style={{
                        width: selectionColWidth,
                        ...(stickyPositions.__selection__
                          ? {
                              position: 'sticky',
                              left: stickyPositions.__selection__.left,
                              zIndex: 2,
                            }
                          : {}),
                        ...resolvedStyles['selection.cell'],
                      }}
                    >
                      {selectionType === 'checkbox' && (
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isIndeterminate;
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          data-tao-table-checkbox=""
                        />
                      )}
                    </th>
                  )}
                  {columns.map((col, i) => {
                    const colKey = getColKey(col, i);
                    const hasSorter = !!col.sorter;
                    const hasFilter = !!(
                      col.filters && col.filters.length > 0
                    );
                    const resolvedOrder = getResolvedSortOrder(col, colKey);
                    const controlledFilterValues = col.filteredValue;
                    const activeFilterValues =
                      controlledFilterValues ?? filterValues[colKey] ?? [];
                    const stickyPos = stickyPositions[colKey];
                    const isFixed = !!col.fixed && !!scroll?.x;
                    const headerCellProps = col.onHeaderCell?.(col) ?? {};

                    return (
                      <th
                        {...headerCellProps}
                        key={colKey}
                        data-tao-table-cell=""
                        data-tao-table-header=""
                        data-tao-align={col.align}
                        data-tao-fixed={isFixed ? col.fixed : undefined}
                        className={cx(
                          resolvedClassNames['header.cell'],
                          headerCellProps.className,
                        )}
                        style={{
                          ...resolvedStyles['header.cell'],
                          width: col.width,
                          ...(isFixed && stickyPos
                            ? {
                                position: 'sticky',
                                ...(stickyPos.left !== undefined
                                  ? { left: stickyPos.left }
                                  : {}),
                                ...(stickyPos.right !== undefined
                                  ? { right: stickyPos.right }
                                  : {}),
                                zIndex: 2,
                              }
                            : {}),
                          ...headerCellProps.style,
                        }}
                      >
                        <div
                          data-tao-table-header-content=""
                          className={resolvedClassNames['header.content']}
                          style={resolvedStyles['header.content']}
                        >
                          <span
                            data-tao-table-header-title=""
                            data-tao-sortable={hasSorter || undefined}
                            className={resolvedClassNames['header.title']}
                            style={resolvedStyles['header.title']}
                            onClick={
                              hasSorter
                                ? () => handleSort(colKey, col)
                                : undefined
                            }
                            role={hasSorter ? 'button' : undefined}
                            tabIndex={hasSorter ? 0 : undefined}
                            onKeyDown={
                              hasSorter
                                ? (e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleSort(colKey, col);
                                    }
                                  }
                                : undefined
                            }
                          >
                            {col.title}
                            {hasSorter && <SortIcon order={resolvedOrder} />}
                          </span>
                          {hasFilter && (
                            <FilterDropdown
                              filters={col.filters!}
                              activeValues={activeFilterValues}
                              onSelect={(vals) => handleFilter(colKey, vals)}
                            />
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              );
            })()}
          </thead>
          <tbody data-tao-table-tbody="">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  data-tao-table-cell=""
                  data-tao-table-empty=""
                  colSpan={columns.length + (rowSelection ? 1 : 0)}
                  className={resolvedClassNames.empty}
                  style={resolvedStyles.empty}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              paginatedData.map((record, rowIdx) => {
                const key = getRowKey(record, rowKey);
                const isSelected = selectedKeys.includes(key);
                const checkboxProps = rowSelection?.getCheckboxProps?.(record);
                const rowProps = onRow?.(record, rowIdx) ?? {};

                return (
                  <tr
                    {...rowProps}
                    key={key}
                    data-tao-table-row=""
                    data-tao-selected={isSelected || undefined}
                    className={cx(
                      resolvedClassNames['body.row'],
                      resolveRowClassName(rowClassName, record, rowIdx),
                      rowProps.className,
                    )}
                    style={{
                      ...resolvedStyles['body.row'],
                      ...resolveRowStyle(rowStyle, record, rowIdx),
                      ...rowProps.style,
                    }}
                  >
                    {rowSelection && (
                      <td
                        data-tao-table-cell=""
                        data-tao-table-selection-cell=""
                        data-tao-fixed="left"
                        className={resolvedClassNames['selection.cell']}
                        style={{
                          ...(stickyPositions.__selection__
                            ? {
                                position: 'sticky',
                                left: stickyPositions.__selection__.left,
                                zIndex: 1,
                              }
                            : {}),
                          ...resolvedStyles['selection.cell'],
                        }}
                      >
                        <input
                          type={
                            selectionType === 'radio' ? 'radio' : 'checkbox'
                          }
                          checked={isSelected}
                          disabled={checkboxProps?.disabled}
                          onChange={() => handleSelectRow(key, record)}
                          data-tao-table-checkbox=""
                        />
                      </td>
                    )}
                    {columns.map((col, colIdx) => {
                      const colKey = getColKey(col, colIdx);
                      const value = getCellValue(record, col.dataIndex);
                      const stickyPos = stickyPositions[colKey];
                      const isFixed = !!col.fixed && !!scroll?.x;
                      const cellProps = col.onCell?.(record, rowIdx) ?? {};

                      return (
                        <td
                          {...cellProps}
                          key={colKey}
                          data-tao-table-cell=""
                          data-tao-align={col.align}
                          data-tao-ellipsis={col.ellipsis || undefined}
                          data-tao-fixed={isFixed ? col.fixed : undefined}
                          className={cx(
                            resolvedClassNames['body.cell'],
                            cellProps.className,
                          )}
                          style={{
                            ...resolvedStyles['body.cell'],
                            ...(isFixed && stickyPos
                              ? {
                                  position: 'sticky',
                                  ...(stickyPos.left !== undefined
                                    ? { left: stickyPos.left }
                                    : {}),
                                  ...(stickyPos.right !== undefined
                                    ? { right: stickyPos.right }
                                    : {}),
                                  zIndex: 1,
                                }
                              : {}),
                            ...cellProps.style,
                          }}
                        >
                          {col.render
                            ? col.render(value, record, rowIdx)
                            : value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {hasPagination && totalForPagination > 0 && (
        <div
          data-tao-table-pagination=""
          className={resolvedClassNames.pagination}
          style={resolvedStyles.pagination}
        >
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalForPagination}
            onChange={handlePageChange}
            size={resolvedSize}
            showSizeChanger={paginationConfig?.showSizeChanger}
            pageSizeOptions={paginationConfig?.pageSizeOptions}
            showTotal={paginationConfig?.showTotal}
          />
        </div>
      )}
    </div>
  );
}

// ---- Utils ----

function nextSortOrder(current: SortOrder): SortOrder {
  if (current === 'ascend') return 'descend';
  if (current === 'descend') return null;
  return 'ascend';
}
