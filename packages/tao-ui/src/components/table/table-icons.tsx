import type { MouseEvent } from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import type { SortOrder } from './table-types';

export function SortIcon({ order }: { order: SortOrder }) {
  return (
    <span data-tao-table-sort-icon="" data-tao-sort-order={order ?? undefined}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
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

export function FilterIcon({ active }: { active: boolean }) {
  return (
    <span data-tao-table-filter-icon="" data-tao-active={active || undefined}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
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

export function TableLoadingSpinner() {
  return (
    <div data-tao-table-loading="">
      <svg
        data-tao-table-spinner=""
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
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

export function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
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

export function ExpandIcon({
  expanded,
  disabled,
  onClick,
}: {
  expanded: boolean;
  disabled?: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const { locale } = useTaoConfig();
  return (
    <button
      type="button"
      data-tao-table-expand-icon=""
      data-tao-expanded={expanded || undefined}
      disabled={disabled}
      aria-expanded={expanded}
      aria-label={
        expanded ? locale.messages.collapseRow : locale.messages.expandRow
      }
      onClick={onClick}
    />
  );
}
