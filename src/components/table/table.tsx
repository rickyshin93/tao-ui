import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import { useBreakpoint } from '../../utils/breakpoint';
import { cx } from '../../utils/semantic';
import { Pagination } from '../pagination/pagination';
import { TableFilterDropdown } from './table-filter';
import { SortIcon, TableLoadingSpinner } from './table-icons';
import {
  getCellValue,
  getColKey,
  getRowKey,
  resolveRowClassName,
  resolveRowStyle,
  resolveSemanticClassNames,
  resolveSemanticStyles,
} from './table-model';
import type {
  TableColumn,
  TableProps,
  TableRecord,
  TableVariant,
} from './table-types';
import { useTableData } from './use-table-data';
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
  columns: columnsProp,
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
  const screens = useBreakpoint();
  // Columns with a `responsive` list render only when one of its breakpoints
  // matches; filtering here keeps sorting/filtering/colgroup/fixed-shadow
  // logic downstream untouched.
  const columns = useMemo(
    () =>
      columnsProp.some((col) => col.responsive)
        ? columnsProp.filter(
            (col) =>
              !col.responsive || col.responsive.some((bp) => screens[bp]),
          )
        : columnsProp,
    [columnsProp, screens],
  );
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

  const tableData = useTableData({
    columns,
    dataSource,
    pagination: paginationProp,
    onChange,
  });
  const paginatedData = tableData.rows;

  // ---- Row selection ----
  const selectionColWidth = rowSelection?.columnWidth ?? 48;
  const selectionType = rowSelection?.type ?? 'checkbox';
  const isSelectionControlled = rowSelection?.selectedRowKeys !== undefined;
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<React.Key[]>(
    [],
  );
  const selectedKeys = rowSelection?.selectedRowKeys ?? internalSelectedKeys;
  const selectedKeySet = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const selectablePageKeys = useMemo(
    () =>
      paginatedData
        .filter((record) => !rowSelection?.getCheckboxProps?.(record)?.disabled)
        .map((record) => getRowKey(record, rowKey)),
    [paginatedData, rowSelection, rowKey],
  );

  const handleSelectRow = useCallback(
    (key: React.Key) => {
      let nextKeys: React.Key[];
      if (selectionType === 'radio') {
        nextKeys = [key];
      } else {
        nextKeys = selectedKeySet.has(key)
          ? selectedKeys.filter((k) => k !== key)
          : [...selectedKeys, key];
      }
      if (!isSelectionControlled) setInternalSelectedKeys(nextKeys);
      if (!rowSelection?.onChange) return;
      const nextKeySet = new Set(nextKeys);
      const nextRows = dataSource.filter((r) =>
        nextKeySet.has(getRowKey(r, rowKey)),
      );
      rowSelection.onChange(nextKeys, nextRows);
    },
    [
      rowSelection,
      selectionType,
      isSelectionControlled,
      selectedKeys,
      selectedKeySet,
      dataSource,
      rowKey,
    ],
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const nextKeySet = new Set(selectedKeys);
      for (const key of selectablePageKeys) {
        if (checked) nextKeySet.add(key);
        else nextKeySet.delete(key);
      }
      const nextKeys = [...nextKeySet];
      if (!isSelectionControlled) setInternalSelectedKeys(nextKeys);
      if (!rowSelection?.onChange) return;
      const nextRows = dataSource.filter((record) =>
        nextKeySet.has(getRowKey(record, rowKey)),
      );
      rowSelection.onChange(nextKeys, nextRows);
    },
    [
      rowSelection,
      selectedKeys,
      selectablePageKeys,
      dataSource,
      rowKey,
      isSelectionControlled,
    ],
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

  // ---- Render ----
  const tableStyle: React.CSSProperties = scroll?.x
    ? { minWidth: typeof scroll.x === 'number' ? `${scroll.x}px` : scroll.x }
    : {};

  const selectedPageCount = selectablePageKeys.filter((key) =>
    selectedKeySet.has(key),
  ).length;
  const isAllSelected =
    selectablePageKeys.length > 0 &&
    selectedPageCount === selectablePageKeys.length;
  const isIndeterminate = selectedPageCount > 0 && !isAllSelected;

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
                          disabled={selectablePageKeys.length === 0}
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
                    const {
                      sortOrder: resolvedOrder,
                      filteredValue: activeFilterValues,
                      onSort,
                      onFilter,
                    } = tableData.getColumnState(i);
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
                              onClick={onSort}
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
                              onSelect={onFilter}
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
                const isSelected = selectedKeySet.has(key);
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

      {tableData.pagination && tableData.pagination.total > 0 && (
        <div
          data-tao-table-pagination=""
          className={resolvedClassNames.pagination}
          style={resolvedStyles.pagination}
        >
          <Pagination {...tableData.pagination} size={resolvedSize} />
        </div>
      )}
    </div>
  );
}
