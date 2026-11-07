import { useMemo, useState } from 'react';
import { getColKey, nextSortOrder } from './table-model';
import type {
  SortOrder,
  TableColumn,
  TableProps,
  TableRecord,
} from './table-types';

type TableDataProps<T extends TableRecord> = Pick<
  TableProps<T>,
  'columns' | 'dataSource' | 'pagination' | 'onChange'
> & { configuredColumns: TableColumn<T>[] };

type SortState = { key: string | null; order: SortOrder };

export function useTableData<T extends TableRecord>({
  columns,
  configuredColumns,
  dataSource,
  pagination: paginationProp,
  onChange,
}: TableDataProps<T>) {
  const [sort, setSort] = useState<SortState>(() => {
    const index = configuredColumns.findIndex(
      (column) => column.defaultSortOrder,
    );
    return index < 0
      ? { key: null, order: null }
      : {
          key: getColKey(configuredColumns[index], index),
          order: configuredColumns[index].defaultSortOrder ?? null,
        };
  });
  const [filters, setFilters] = useState<Record<string, string[]>>(() => {
    const values: Record<string, string[]> = Object.create(null);
    configuredColumns.forEach((column, index) => {
      if (column.filters)
        values[getColKey(column, index)] = column.filteredValue ?? [];
    });
    return values;
  });
  const paginationConfig =
    paginationProp === false ? undefined : paginationProp;
  const [internalPage, setPage] = useState(
    paginationConfig?.defaultCurrent ?? 1,
  );
  const [internalPageSize, setPageSize] = useState(
    paginationConfig?.defaultPageSize ?? paginationConfig?.pageSize ?? 10,
  );
  const pageSize = paginationConfig?.pageSize ?? internalPageSize;
  const hasControlledSort = columns.some(
    (column) => column.sorter && column.sortOrder,
  );
  const columnKeys = useMemo(() => {
    const configuredIndexes = new Map(
      configuredColumns.map((column, index) => [column, index]),
    );
    return columns.map((column, index) =>
      getColKey(column, configuredIndexes.get(column) ?? index),
    );
  }, [columns, configuredColumns]);

  // Rendering, data processing and change events share the same resolved state.
  const columnStates = useMemo(
    () =>
      columns.map((column, index) => {
        const key = columnKeys[index];
        return {
          column,
          key,
          order:
            !column.sorter
              ? null
              : column.sortOrder !== undefined
                ? column.sortOrder
                : !hasControlledSort && sort.key === key
                  ? sort.order
                  : null,
          values:
            column.filteredValue ??
            (Object.hasOwn(filters, key) ? filters[key] : []),
        };
      }),
    [columns, columnKeys, sort, filters, hasControlledSort],
  );
  const resolvedSort = columnStates.find((state) => state.order) ?? {
    key: null,
    order: null,
  };
  const resolvedFilters = useMemo(() => {
    const values: Record<string, string[]> = Object.assign(
      Object.create(null),
      filters,
    );
    for (const state of columnStates) {
      if (state.column.filteredValue !== undefined)
        values[state.key] = state.values;
    }
    return values;
  }, [columnStates, filters]);

  const processedData = useMemo(() => {
    let data = [...dataSource];
    for (const { column, values } of columnStates) {
      if (column.filters && column.onFilter && values.length > 0) {
        data = data.filter((record) =>
          values.some((v) => column.onFilter!(v, record)),
        );
      }
    }
    const activeSort = columnStates.find(
      ({ column, order }) =>
        order !== null && typeof column.sorter === 'function',
    );
    if (activeSort && typeof activeSort.column.sorter === 'function') {
      const compare = activeSort.column.sorter;
      data.sort((a, b) => {
        const result = compare.call(activeSort.column, a, b);
        return activeSort.order === 'descend' ? -result : result;
      });
    }
    return data;
  }, [dataSource, columnStates]);

  const total = paginationConfig?.total ?? processedData.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const boundedPage = Math.min(Math.max(1, internalPage), lastPage);
  if (
    paginationProp !== false &&
    paginationConfig?.current === undefined &&
    boundedPage !== internalPage
  ) {
    setPage(boundedPage);
  }
  const currentPage = paginationConfig?.current ?? internalPage;
  const rows = useMemo(() => {
    if (paginationProp === false || paginationConfig?.total !== undefined)
      return processedData;
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, paginationProp, paginationConfig, currentPage, pageSize]);

  function notifyChange(
    page: number,
    size: number,
    nextSort: SortState = resolvedSort,
    nextFilters = resolvedFilters,
  ) {
    const filterEntries: [string, string[] | null][] = [];
    for (const { column, key } of columnStates) {
      if (!column.filters) continue;
      const values = Object.hasOwn(nextFilters, key)
        ? nextFilters[key]
        : undefined;
      filterEntries.push([
        column.dataIndex == null ? key : String(column.dataIndex),
        values?.length ? [...values] : null,
      ]);
    }
    const column =
      nextSort.key === null
        ? undefined
        : columnStates.find((state) => state.key === nextSort.key)?.column;
    onChange?.(
      { current: page, pageSize: size },
      Object.fromEntries(filterEntries),
      nextSort.key !== null && nextSort.order
        ? { column, order: nextSort.order, field: column?.dataIndex }
        : { order: null },
    );
  }

  function getColumnState(index: number) {
    const { column, key, order, values } = columnStates[index];
    return {
      sortOrder: order,
      filteredValue: values,
      onSort() {
        const controlled = column.sortOrder !== undefined;
        const nextOrder = nextSortOrder(order);
        const next = { key: nextOrder ? key : null, order: nextOrder };
        if (!controlled) setSort(next);
        notifyChange(currentPage, pageSize, next);
      },
      onFilter(nextValues: string[]) {
        const next = { ...resolvedFilters, [key]: nextValues };
        if (column.filteredValue === undefined) {
          setFilters((previous) => ({ ...previous, [key]: nextValues }));
        }
        setPage(1);
        notifyChange(1, pageSize, resolvedSort, next);
      },
    };
  }

  return {
    rows,
    columnKeys,
    getColumnState,
    pagination:
      paginationProp === false
        ? null
        : {
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: paginationConfig?.showSizeChanger,
            pageSizeOptions: paginationConfig?.pageSizeOptions,
            showTotal: paginationConfig?.showTotal,
            onChange(page: number, size: number) {
              setPage(page);
              setPageSize(size);
              notifyChange(page, size);
            },
          },
  };
}
