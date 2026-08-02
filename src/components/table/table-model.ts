import type { CSSProperties, Key } from 'react';
import type { SemanticClassNames, SemanticStyles } from '../../utils/semantic';
import type {
  SortOrder,
  TableColumn,
  TableProps,
  TableRecord,
  TableSemanticClassNames,
  TableSemanticPart,
  TableSemanticStyles,
} from './table-types';

export function getRowKey<T extends TableRecord>(
  record: T,
  rowKey: keyof T | ((record: T) => Key),
): Key {
  if (typeof rowKey === 'function') return rowKey(record);
  return record[rowKey] as Key;
}

export function getColKey<T extends TableRecord>(
  col: TableColumn<T>,
  index: number,
): string {
  return (
    col.key ?? (col.dataIndex == null ? String(index) : String(col.dataIndex))
  );
}

export function getCellValue<T extends TableRecord>(
  record: T,
  dataIndex?: keyof T,
): unknown {
  if (!dataIndex) return undefined;
  return record[dataIndex];
}

export function resolveSemanticClassNames<T extends TableRecord>(
  classNames: TableSemanticClassNames<T> | undefined,
  props: TableProps<T>,
): SemanticClassNames<TableSemanticPart> {
  return typeof classNames === 'function'
    ? classNames({ props })
    : (classNames ?? {});
}

export function resolveSemanticStyles<T extends TableRecord>(
  styles: TableSemanticStyles<T> | undefined,
  props: TableProps<T>,
): SemanticStyles<TableSemanticPart> {
  return typeof styles === 'function' ? styles({ props }) : (styles ?? {});
}

export function resolveRowClassName<T extends TableRecord>(
  rowClassName: TableProps<T>['rowClassName'],
  record: T,
  index: number,
): string | undefined {
  return typeof rowClassName === 'function'
    ? rowClassName(record, index)
    : rowClassName;
}

export function resolveRowStyle<T extends TableRecord>(
  rowStyle: TableProps<T>['rowStyle'],
  record: T,
  index: number,
): CSSProperties | undefined {
  return typeof rowStyle === 'function' ? rowStyle(record, index) : rowStyle;
}

export function nextSortOrder(current: SortOrder): SortOrder {
  if (current === 'ascend') return 'descend';
  if (current === 'descend') return null;
  return 'ascend';
}
