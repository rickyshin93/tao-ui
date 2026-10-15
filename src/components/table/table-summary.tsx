import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
} from 'react';

export interface TableSummaryProps {
  /** Pin the summary to the bottom while the body scrolls (needs `scroll.y`). */
  fixed?: boolean;
  children?: ReactNode;
}

export interface TableSummaryRowProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export interface TableSummaryCellProps {
  /** Column index this cell starts at, counting the expand/selection columns. */
  index: number;
  colSpan?: number;
  rowSpan?: number;
  align?: 'left' | 'center' | 'right';
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export interface TableSummaryColumn {
  fixed?: 'left' | 'right';
  sticky?: { left?: number; right?: number };
}

/** Flattened columns (expand + selection + data) so cells can sync fixed state. */
export const TableSummaryContext = createContext<TableSummaryColumn[]>([]);

function TableSummary({ children }: TableSummaryProps) {
  // `fixed` is read by Table from this element's props to pin the <tfoot>.
  return <>{children}</>;
}

function TableSummaryRow({ className, style, children }: TableSummaryRowProps) {
  return (
    <tr data-tao-table-summary-row="" className={className} style={style}>
      {children}
    </tr>
  );
}

function TableSummaryCell({
  index,
  colSpan,
  rowSpan,
  align,
  className,
  style,
  children,
}: TableSummaryCellProps) {
  const columns = useContext(TableSummaryContext);
  const first = columns[index];
  const last = columns[index + (colSpan ?? 1) - 1];
  // A cell sticks left when it starts on a left-fixed column, right when it
  // ends on a right-fixed one — the same rule antd uses.
  const fixed =
    first?.fixed === 'left' && first.sticky
      ? 'left'
      : last?.fixed === 'right' && last.sticky
        ? 'right'
        : undefined;
  const sticky = fixed === 'left' ? first?.sticky : last?.sticky;

  return (
    <td
      data-tao-table-cell=""
      data-tao-align={align}
      data-tao-fixed={fixed}
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={className}
      style={{
        ...(fixed && sticky
          ? { position: 'sticky', ...sticky, zIndex: 1 }
          : undefined),
        ...style,
      }}
    >
      {children}
    </td>
  );
}

TableSummary.Row = TableSummaryRow;
TableSummary.Cell = TableSummaryCell;

export { TableSummary };
