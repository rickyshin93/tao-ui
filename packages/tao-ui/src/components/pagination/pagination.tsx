import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { type TaoSize, useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Select } from '../select/select';
import './pagination.css';

// ---- Types ----

export type PaginationSemanticPart = 'root' | 'item' | 'total';

export interface PaginationProps {
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  total: number;
  onChange?: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  showTotal?: (total: number, range: [number, number]) => ReactNode;
  size?: TaoSize;
  disabled?: boolean;
  className?: string;
  classNames?: SemanticClassNames<PaginationSemanticPart>;
  styles?: SemanticStyles<PaginationSemanticPart>;
}

// ---- Helpers ----

function range(start: number, end: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i++) result.push(i);
  return result;
}

function computePages(
  current: number,
  totalPages: number,
): (number | 'ellipsis')[] {
  if (totalPages <= 7) return range(1, totalPages);

  const items: (number | 'ellipsis')[] = [1];

  if (current <= 4) {
    items.push(...range(2, 5), 'ellipsis', totalPages);
  } else if (current >= totalPages - 3) {
    items.push('ellipsis', ...range(totalPages - 4, totalPages));
  } else {
    items.push(
      'ellipsis',
      current - 1,
      current,
      current + 1,
      'ellipsis',
      totalPages,
    );
  }

  return items;
}

// ---- Icons ----

function ChevronLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M10 12L6 8l4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---- Pagination ----

export function Pagination({
  current: currentProp,
  defaultCurrent = 1,
  pageSize: pageSizeProp,
  defaultPageSize = 10,
  total,
  onChange,
  showSizeChanger = false,
  pageSizeOptions = [10, 20, 50, 100],
  showTotal,
  size,
  disabled,
  className,
  classNames,
  styles,
}: PaginationProps) {
  const ctx = useTaoConfig();
  const resolvedSize = size ?? ctx.size;
  const resolvedDisabled = disabled ?? ctx.disabled ?? false;

  // Controlled / uncontrolled — current
  const isCurrentControlled = currentProp !== undefined;
  const [internalCurrent, setInternalCurrent] = useState(defaultCurrent);
  const current = isCurrentControlled ? currentProp : internalCurrent;

  // Controlled / uncontrolled — pageSize
  const isPageSizeControlled = pageSizeProp !== undefined;
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);
  const pageSize = isPageSizeControlled ? pageSizeProp : internalPageSize;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const boundedCurrent = Math.min(Math.max(1, internalCurrent), totalPages);
  if (!isCurrentControlled && boundedCurrent !== internalCurrent) {
    setInternalCurrent(boundedCurrent);
  }
  const pages = useMemo(
    () => computePages(current, totalPages),
    [current, totalPages],
  );

  const goTo = useCallback(
    (page: number, newPageSize?: number) => {
      const ps = newPageSize ?? pageSize;
      const maxPage = Math.max(1, Math.ceil(total / ps));
      const safePage = Math.min(Math.max(1, page), maxPage);
      if (safePage === current && ps === pageSize) return;
      if (!isCurrentControlled) setInternalCurrent(safePage);
      if (newPageSize != null && !isPageSizeControlled)
        setInternalPageSize(newPageSize);
      onChange?.(safePage, ps);
    },
    [
      current,
      pageSize,
      total,
      isCurrentControlled,
      isPageSizeControlled,
      onChange,
    ],
  );

  const rangeStart = (current - 1) * pageSize + 1;
  const rangeEnd = Math.min(current * pageSize, total);

  return (
    <nav
      data-tao-pagination=""
      data-tao-size={resolvedSize}
      data-tao-disabled={resolvedDisabled || undefined}
      aria-label={ctx.locale.messages.pagination}
      className={cx(classNames?.root, className)}
      style={styles?.root}
    >
      {showTotal && (
        <span
          data-tao-pagination-total=""
          className={classNames?.total}
          style={styles?.total}
        >
          {showTotal(
            total,
            current >= 1 && rangeStart <= rangeEnd
              ? [rangeStart, rangeEnd]
              : [0, 0],
          )}
        </span>
      )}

      <button
        type="button"
        data-tao-pagination-btn=""
        disabled={resolvedDisabled || current <= 1}
        aria-label={ctx.locale.messages.previousPage}
        onClick={() => goTo(current - 1)}
        className={classNames?.item}
        style={styles?.item}
      >
        <ChevronLeft />
      </button>

      {pages.map((item, i) =>
        item === 'ellipsis' ? (
          <span
            key={`ellipsis-${pages[i - 1]}-${pages[i + 1]}`}
            data-tao-pagination-ellipsis=""
          >
            ···
          </span>
        ) : (
          <button
            key={item}
            type="button"
            data-tao-pagination-btn=""
            data-tao-active={item === current || undefined}
            disabled={resolvedDisabled}
            aria-label={ctx.locale.messages.page(item)}
            aria-current={item === current ? 'page' : undefined}
            onClick={() => goTo(item)}
            className={classNames?.item}
            style={styles?.item}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        data-tao-pagination-btn=""
        disabled={resolvedDisabled || current >= totalPages}
        aria-label={ctx.locale.messages.nextPage}
        onClick={() => goTo(current + 1)}
        className={classNames?.item}
        style={styles?.item}
      >
        <ChevronRight />
      </button>

      {showSizeChanger && (
        <Select
          aria-label={ctx.locale.messages.pageSize}
          style={{ width: 'auto' }}
          options={(pageSizeOptions.includes(pageSize)
            ? pageSizeOptions
            : [...pageSizeOptions, pageSize]
          ).map((opt) => ({
            label: `${opt} ${ctx.locale.messages.itemsPerPage}`,
            value: String(opt),
          }))}
          value={String(pageSize)}
          onChange={(val) => {
            const newSize = Number(val);
            goTo(1, newSize);
          }}
          disabled={resolvedDisabled}
          size={resolvedSize === 'large' ? 'medium' : resolvedSize}
        />
      )}
    </nav>
  );
}
