import {
  Fragment,
  isValidElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTaoConfig, useTaoDirection } from '../../provider/tao-provider';
import { useBreakpoint } from '../../utils/breakpoint';
import { getScrollLeft } from '../../utils/scroll-left';
import { cx } from '../../utils/semantic';
import { Checkbox } from '../checkbox/checkbox';
import { Pagination } from '../pagination/pagination';
import { Radio } from '../radio/radio';
import { TableFilterDropdown } from './table-filter';
import { ExpandIcon, SortIcon, TableLoadingSpinner } from './table-icons';
import {
  getCellValue,
  getRowKey,
  resolveRowClassName,
  resolveRowStyle,
  resolveSemanticClassNames,
  resolveSemanticStyles,
} from './table-model';
import {
  TableSummary,
  type TableSummaryColumn,
  TableSummaryContext,
  type TableSummaryProps,
} from './table-summary';
import type {
  TableColumn,
  TableProps,
  TableRecord,
  TableVariant,
} from './table-types';
import { useTableData } from './use-table-data';
import './table.css';

export type {
  TableSummaryCellProps,
  TableSummaryProps,
  TableSummaryRowProps,
} from './table-summary';
export type {
  SorterResult,
  SortOrder,
  TableColumn,
  TableExpandable,
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

type StickyPos = { left?: number; right?: number };
const EXPAND_COLUMN_INDEX = -2;
const SELECTION_COLUMN_INDEX = -1;

function stickyStyle(pos: StickyPos | undefined, zIndex: number) {
  return pos ? { position: 'sticky' as const, ...pos, zIndex } : undefined;
}

function fixedColumnWidth(width: number | string | undefined) {
  if (typeof width === 'number') return width;
  return width?.trim().toLowerCase().endsWith('px')
    ? Number.parseFloat(width) || 0
    : 0;
}

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
  expandable,
  summary,
  size,
  variant,
  headerBackground = true,
  emptyText: emptyTextProp,
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
  const emptyText =
    emptyTextProp === undefined
      ? ctx.locale.messages.tableEmpty
      : emptyTextProp;
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
    expandable,
    summary,
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
    configuredColumns: columnsProp,
    dataSource,
    pagination: paginationProp,
    onChange,
  });
  const paginatedData = tableData.rows;

  // ---- Row selection ----
  const selectionColWidth = rowSelection?.columnWidth ?? 48;
  const selectionType = rowSelection?.type ?? 'checkbox';
  const selectionName = useId();
  const isSelectionControlled =
    rowSelection != null && 'selectedRowKeys' in rowSelection;
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<React.Key[]>(
    [],
  );
  const selectedKeys = isSelectionControlled
    ? (rowSelection.selectedRowKeys ?? [])
    : internalSelectedKeys;
  const selectedKeySet = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const disabledRows = rowSelection
    ? paginatedData.map(
        (record) => rowSelection.getCheckboxProps?.(record)?.disabled,
      )
    : [];
  const selectablePageKeys = rowSelection
    ? paginatedData
        .filter((_, index) => !disabledRows[index])
        .map((record) => getRowKey(record, rowKey))
    : [];

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
      rowSelection.onChange([...nextKeys], nextRows);
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
      rowSelection.onChange([...nextKeys], nextRows);
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

  // ---- Expandable rows ----
  const expandColWidth = expandable?.columnWidth ?? 48;
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<React.Key[]>(
    () => expandable?.defaultExpandedRowKeys ?? [],
  );
  const isExpansionControlled =
    expandable != null && 'expandedRowKeys' in expandable;
  const expandedKeys = isExpansionControlled
    ? (expandable.expandedRowKeys ?? [])
    : internalExpandedKeys;
  const expandedKeySet = useMemo(() => new Set(expandedKeys), [expandedKeys]);

  const toggleExpand = (record: T, key: React.Key) => {
    const expanded = !expandedKeySet.has(key);
    const nextKeys = expanded
      ? [...expandedKeys, key]
      : expandedKeys.filter((k) => k !== key);
    if (!isExpansionControlled) {
      setInternalExpandedKeys(nextKeys);
    }
    expandable?.onExpand?.(expanded, record);
    expandable?.onExpandedRowsChange?.(nextKeys);
  };

  // ---- Scroll + sticky columns ----
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRowRef = useRef<HTMLTableRowElement>(null);
  const [headerWidths, setHeaderWidths] = useState<number[]>([]);
  const [direction, directionRef] = useTaoDirection(undefined, 'self');
  // Expanded content is pinned to the visible width while scrolling sideways.
  const [viewportWidth, setViewportWidth] = useState<number>();
  const [scrollState, setScrollState] = useState<
    'left' | 'middle' | 'right' | 'both'
  >('left');

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollWidth, clientWidth } = el;
    const scrollLeft = getScrollLeft(el);
    const atLeft = scrollLeft <= 1;
    const atRight = scrollLeft + clientWidth >= scrollWidth - 1;
    setViewportWidth(clientWidth);
    if (atLeft && atRight) setScrollState('both');
    else if (atLeft) setScrollState(direction === 'rtl' ? 'right' : 'left');
    else if (atRight) setScrollState(direction === 'rtl' ? 'left' : 'right');
    else setScrollState('middle');
  }, [direction]);

  // ---- Compute sticky positions ----
  const allColumns = useMemo(() => {
    const cols: (Pick<TableColumn<T>, 'fixed' | 'width'> & {
      index: number;
    })[] = [];

    // Expand column (antd puts it before the selection column)
    if (expandable) {
      cols.push({
        index: EXPAND_COLUMN_INDEX,
        width: expandColWidth,
        fixed: expandable.fixed ? 'left' : undefined,
      });
    }

    // Selection column
    if (rowSelection) {
      cols.push({
        index: SELECTION_COLUMN_INDEX,
        width: selectionColWidth,
        fixed: rowSelection.fixed ? 'left' : undefined,
      });
    }

    columns.forEach(({ fixed, width }, index) => {
      cols.push({ fixed, width, index });
    });

    return cols;
  }, [columns, rowSelection, selectionColWidth, expandable, expandColWidth]);

  // Column widths can change while the table's outer dimensions stay the same.
  useEffect(() => {
    const el = scrollRef.current;
    if (!scroll?.x || !el) return;
    const cells = allColumns.some(({ fixed }) => fixed)
      ? Array.from(headerRowRef.current?.cells ?? [])
      : [];
    const measure = () => {
      handleScroll();
      const widths = cells.map((cell) => cell.offsetWidth);
      setHeaderWidths((previous) =>
        previous.length === widths.length &&
        previous.every((width, index) => width === widths[index])
          ? previous
          : widths,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    for (const cell of cells) observer.observe(cell);
    return () => observer.disconnect();
  }, [scroll?.x, handleScroll, allColumns]);

  const stickyPositions = useMemo(() => {
    if (!scroll?.x) return {};
    const positions: Partial<Record<number, StickyPos>> = {};

    // Left fixed
    let leftOffset = 0;
    for (const [index, col] of allColumns.entries()) {
      if (col.fixed === 'left') {
        positions[col.index] = {
          [direction === 'rtl' ? 'right' : 'left']: leftOffset,
        };
        leftOffset += headerWidths[index] || fixedColumnWidth(col.width);
      }
    }

    // Right fixed
    let rightOffset = 0;
    for (let i = allColumns.length - 1; i >= 0; i--) {
      const col = allColumns[i];
      if (col.fixed === 'right') {
        positions[col.index] = {
          [direction === 'rtl' ? 'left' : 'right']: rightOffset,
        };
        rightOffset += headerWidths[i] || fixedColumnWidth(col.width);
      }
    }

    return positions;
  }, [allColumns, scroll?.x, direction, headerWidths]);

  const summaryColumns = useMemo<TableSummaryColumn[]>(
    () =>
      allColumns.map((col) => ({
        fixed: col.fixed,
        sticky: stickyPositions[col.index],
      })),
    [allColumns, stickyPositions],
  );
  const summaryNode = summary?.([...paginatedData]);
  const summaryFixed =
    isValidElement<TableSummaryProps>(summaryNode) &&
    summaryNode.type === TableSummary &&
    !!summaryNode.props.fixed;

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
      ref={directionRef}
      data-tao-table-wrapper=""
      data-tao-direction={direction}
      data-tao-size={resolvedSize}
      data-tao-variant={resolvedVariant}
      data-tao-header-bg={headerBackground ? undefined : 'off'}
      data-tao-bordered={showBorder || undefined}
      data-tao-scroll-state={scroll?.x ? scrollState : undefined}
      className={cx(resolvedClassNames.root, className)}
      style={{ ...resolvedStyles.root, ...style }}
    >
      {loading && <TableLoadingSpinner />}
      <div
        data-tao-table-scroll=""
        data-tao-scroll-y={scroll?.y ? '' : undefined}
        ref={scrollRef}
        onScroll={scroll?.x ? handleScroll : undefined}
        className={resolvedClassNames.scroll}
        style={{ maxHeight: scroll?.y, ...resolvedStyles.scroll }}
      >
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
                  ref={headerRowRef}
                  className={cx(
                    resolvedClassNames['header.row'],
                    headerRowProps.className,
                  )}
                  style={{
                    ...resolvedStyles['header.row'],
                    ...headerRowProps.style,
                  }}
                >
                  {expandable && (
                    <th
                      data-tao-table-cell=""
                      data-tao-table-expand-cell=""
                      data-tao-fixed={
                        stickyPositions[EXPAND_COLUMN_INDEX]
                          ? 'left'
                          : undefined
                      }
                      style={{
                        width: expandColWidth,
                        ...stickyStyle(stickyPositions[EXPAND_COLUMN_INDEX], 3),
                      }}
                    />
                  )}
                  {rowSelection && (
                    <th
                      data-tao-table-cell=""
                      data-tao-table-selection-cell=""
                      data-tao-fixed={
                        stickyPositions[SELECTION_COLUMN_INDEX]
                          ? 'left'
                          : undefined
                      }
                      className={resolvedClassNames['selection.cell']}
                      style={{
                        width: selectionColWidth,
                        ...stickyStyle(stickyPositions[SELECTION_COLUMN_INDEX], 3),
                        ...resolvedStyles['selection.cell'],
                      }}
                    >
                      {selectionType === 'checkbox' && (
                        <Checkbox
                          aria-label={ctx.locale.messages.selectAllRows}
                          checked={isAllSelected}
                          disabled={
                            ctx.disabled || selectablePageKeys.length === 0
                          }
                          indeterminate={isIndeterminate}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      )}
                    </th>
                  )}
                  {columns.map((col, i) => {
                    const colKey = tableData.columnKeys[i];
                    const hasSorter = !!col.sorter;
                    const hasFilter = !!(col.filters && col.filters.length > 0);
                    const {
                      sortOrder: resolvedOrder,
                      filteredValue: activeFilterValues,
                      onSort,
                      onFilter,
                    } = tableData.getColumnState(i);
                    const stickyPos = stickyPositions[i];
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
                          ...stickyStyle(isFixed ? stickyPos : undefined, 3),
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
                              disabled={ctx.disabled}
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
                  colSpan={allColumns.length}
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
                const rowProps = onRow?.(record, rowIdx) ?? {};
                const rowExpandable =
                  !!expandable && (expandable.rowExpandable?.(record) ?? true);
                const isExpanded = rowExpandable && expandedKeySet.has(key);

                return (
                  <Fragment key={key}>
                    <tr
                      {...rowProps}
                      data-tao-table-row=""
                      data-tao-selected={isSelected || undefined}
                      onClick={(event) => {
                        const selectionCell = (event.target as Element).closest(
                          '[data-tao-table-selection-cell]',
                        );
                        if (selectionCell && event.target !== selectionCell) {
                          event.stopPropagation();
                          return;
                        }
                        rowProps.onClick?.(event);
                        if (
                          !event.defaultPrevented &&
                          !ctx.disabled &&
                          rowExpandable &&
                          expandable?.expandRowByClick
                        )
                          toggleExpand(record, key);
                      }}
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
                      {expandable && (
                        <td
                          data-tao-table-cell=""
                          data-tao-table-expand-cell=""
                          data-tao-fixed={
                            stickyPositions[EXPAND_COLUMN_INDEX]
                              ? 'left'
                              : undefined
                          }
                          style={stickyStyle(
                            stickyPositions[EXPAND_COLUMN_INDEX],
                            1,
                          )}
                        >
                          {rowExpandable && (
                            <ExpandIcon
                              expanded={isExpanded}
                              disabled={ctx.disabled}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(record, key);
                              }}
                            />
                          )}
                        </td>
                      )}
                      {rowSelection && (
                        <td
                          data-tao-table-cell=""
                          data-tao-table-selection-cell=""
                          data-tao-fixed={
                            stickyPositions[SELECTION_COLUMN_INDEX]
                              ? 'left'
                              : undefined
                          }
                          className={resolvedClassNames['selection.cell']}
                          style={{
                            ...stickyStyle(
                              stickyPositions[SELECTION_COLUMN_INDEX],
                              1,
                            ),
                            ...resolvedStyles['selection.cell'],
                          }}
                        >
                          {selectionType === 'radio' ? (
                            <Radio
                              name={selectionName}
                              checked={isSelected}
                              aria-label={ctx.locale.messages.selectRow(
                                String(key),
                              )}
                              disabled={ctx.disabled || disabledRows[rowIdx]}
                              onChange={() => handleSelectRow(key)}
                            />
                          ) : (
                            <Checkbox
                              checked={isSelected}
                              aria-label={ctx.locale.messages.selectRow(
                                String(key),
                              )}
                              disabled={ctx.disabled || disabledRows[rowIdx]}
                              onChange={() => handleSelectRow(key)}
                            />
                          )}
                        </td>
                      )}
                      {columns.map((col, colIdx) => {
                        const colKey = tableData.columnKeys[colIdx];
                        const value = getCellValue(record, col.dataIndex);
                        const stickyPos = stickyPositions[colIdx];
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
                              ...stickyStyle(
                                isFixed ? stickyPos : undefined,
                                1,
                              ),
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
                    {isExpanded && (
                      <tr
                        data-tao-table-expanded-row=""
                        className={resolvedClassNames.expandedRow}
                        style={resolvedStyles.expandedRow}
                      >
                        <td data-tao-table-cell="" colSpan={allColumns.length}>
                          <div
                            data-tao-table-expanded-content=""
                            style={
                              scroll?.x ? { width: viewportWidth } : undefined
                            }
                          >
                            {expandable.expandedRowRender(record, rowIdx)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
          {summaryNode != null && (
            <tfoot
              data-tao-table-summary=""
              data-tao-summary-fixed={summaryFixed || undefined}
              className={resolvedClassNames.summary}
              style={resolvedStyles.summary}
            >
              <TableSummaryContext.Provider value={summaryColumns}>
                {summaryNode}
              </TableSummaryContext.Provider>
            </tfoot>
          )}
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

Table.Summary = TableSummary;
