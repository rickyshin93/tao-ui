import type {
  CSSProperties,
  HTMLAttributes,
  Key,
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';
import type { TaoSize, TaoVariant } from '../../provider/tao-provider';
import type { TaoBreakpoint } from '../../utils/breakpoint';
import type { SemanticClassNames, SemanticStyles } from '../../utils/semantic';

export type TableRecord = object;

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
  | 'expandedRow'
  | 'summary'
  | 'empty'
  | 'pagination';

export type TableVariant = TaoVariant | 'modern';
export type SortOrder = 'ascend' | 'descend' | null;

export interface TableFilterItem {
  text: ReactNode;
  value: string;
}

export interface TableColumn<T extends TableRecord = Record<string, unknown>> {
  key?: string;
  dataIndex?: keyof T;
  title?: ReactNode;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
  onCell?: (record: T, index: number) => TdHTMLAttributes<HTMLTableCellElement>;
  onHeaderCell?: (
    column: TableColumn<T>,
  ) => ThHTMLAttributes<HTMLTableCellElement>;
  sorter?: ((a: T, b: T) => number) | boolean;
  sortOrder?: SortOrder;
  defaultSortOrder?: SortOrder;
  filters?: TableFilterItem[];
  onFilter?: (value: string, record: T) => boolean;
  filteredValue?: string[];
  /**
   * Show this column only when at least one listed breakpoint matches the
   * current viewport (antd `ColumnType.responsive` semantics), e.g.
   * `responsive: ['lg']` hides the column on small screens.
   */
  responsive?: TaoBreakpoint[];
}

export interface TableRowSelection<
  T extends TableRecord = Record<string, unknown>,
> {
  type?: 'checkbox' | 'radio';
  selectedRowKeys?: Key[];
  onChange?: (selectedKeys: Key[], selectedRows: T[]) => void;
  getCheckboxProps?: (record: T) => { disabled?: boolean };
  fixed?: boolean;
  columnWidth?: number | string;
}

export interface TableExpandable<
  T extends TableRecord = Record<string, unknown>,
> {
  expandedRowRender: (record: T, index: number) => ReactNode;
  /** Rows returning false get no expand icon. */
  rowExpandable?: (record: T) => boolean;
  expandedRowKeys?: Key[];
  defaultExpandedRowKeys?: Key[];
  onExpand?: (expanded: boolean, record: T) => void;
  onExpandedRowsChange?: (expandedKeys: Key[]) => void;
  /** Toggle by clicking anywhere on the row, not just the icon. */
  expandRowByClick?: boolean;
  /** Pin the expand column to the left edge (needs `scroll.x`). */
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

export interface SorterResult<T extends TableRecord = Record<string, unknown>> {
  column?: TableColumn<T>;
  order: SortOrder;
  field?: keyof T;
}

export type TableSemanticInfo<T extends TableRecord = Record<string, unknown>> =
  { props: TableProps<T> };
export type TableSemanticClassNames<
  T extends TableRecord = Record<string, unknown>,
> =
  | SemanticClassNames<TableSemanticPart>
  | ((info: TableSemanticInfo<T>) => SemanticClassNames<TableSemanticPart>);
export type TableSemanticStyles<
  T extends TableRecord = Record<string, unknown>,
> =
  | SemanticStyles<TableSemanticPart>
  | ((info: TableSemanticInfo<T>) => SemanticStyles<TableSemanticPart>);

export interface TableProps<T extends TableRecord = Record<string, unknown>> {
  columns: TableColumn<T>[];
  dataSource: T[];
  rowKey: keyof T | ((record: T) => Key);
  loading?: boolean;
  pagination?: TablePagination | false;
  onChange?: (
    pagination: { current: number; pageSize: number },
    filters: Record<string, string[] | null>,
    sorter: SorterResult<T>,
  ) => void;
  /** `y` caps the body height and keeps the header pinned while it scrolls. */
  scroll?: { x?: number | string; y?: number | string };
  rowSelection?: TableRowSelection<T>;
  expandable?: TableExpandable<T>;
  /** Footer rows built from `Table.Summary.Row` / `Table.Summary.Cell`. */
  summary?: (pageData: T[]) => ReactNode;
  rowClassName?: string | ((record: T, index: number) => string);
  rowStyle?: CSSProperties | ((record: T, index: number) => CSSProperties);
  onRow?: (record: T, index: number) => HTMLAttributes<HTMLTableRowElement>;
  onHeaderRow?: (
    columns: TableColumn<T>[],
    index: number,
  ) => HTMLAttributes<HTMLTableRowElement>;
  size?: TaoSize;
  variant?: TableVariant;
  headerBackground?: boolean;
  emptyText?: ReactNode;
  bordered?: boolean;
  className?: string;
  style?: CSSProperties;
  classNames?: TableSemanticClassNames<T>;
  styles?: TableSemanticStyles<T>;
}
