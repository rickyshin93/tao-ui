import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import { cx } from '../../utils/semantic';
import { Pagination } from '../pagination/pagination';
import { TableFilterDropdown } from './table-filter';
import { SortIcon, TableLoadingSpinner } from './table-icons';
import {
  getCellValue,
  getColKey,
  getRowKey,
  nextSortOrder,
  resolveRowClassName,
  resolveRowStyle,
  resolveSemanticClassNames,
  resolveSemanticStyles,
} from './table-model';
import type {
  SorterResult,
  SortOrder,
  TableColumn,
  TableProps,
  TableRecord,
  TableVariant,
} from './table-types';
import './table.css';

export type {
  SorterResult,
  SortOrder,
  TableColumn,
  TableFilterItem,
  TablePagination,
  TableProps,
  TableRowSelection,
  TableSemanticClassNames,
  TableSemanticInfo,
  TableSemanticPart,
  TableSemanticStyles,
  TableVariant,
} from './table-types';

// ---- Table ----

export function Table<T extends TableRecord = Record<string, unknown>>({
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
  const resolvedClassNames = resolveSemanticClassNames(
    classNames,
    semanticProps,
  );
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
          result[col.dataIndex == null ? key : String(col.dataIndex)] =
            vals && vals.length > 0 ? vals : null;
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
    (key: React.Key) => {
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
        {loading && <TableLoadingSpinner />}
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
                          aria-label="Select all rows"
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
                    const hasFilter = !!(col.filters && col.filters.length > 0);
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
                        aria-sort={
                          hasSorter
                            ? resolvedOrder === 'ascend'
                              ? 'ascending'
                              : resolvedOrder === 'descend'
                                ? 'descending'
                                : 'none'
                            : undefined
                        }
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
                          {hasSorter ? (
                            <button
                              type="button"
                              data-tao-table-header-title=""
                              data-tao-sortable=""
                              className={resolvedClassNames['header.title']}
                              style={resolvedStyles['header.title']}
                              onClick={() => handleSort(colKey, col)}
                            >
                              {col.title}
                              <SortIcon order={resolvedOrder} />
                            </button>
                          ) : (
                            <span
                              data-tao-table-header-title=""
                              className={resolvedClassNames['header.title']}
                              style={resolvedStyles['header.title']}
                            >
                              {col.title}
                            </span>
                          )}
                          {hasFilter && (
                            <TableFilterDropdown
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
                          aria-label={`Select row ${String(key)}`}
                          disabled={checkboxProps?.disabled}
                          onChange={() => handleSelectRow(key)}
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
                            : (value as ReactNode)}
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
