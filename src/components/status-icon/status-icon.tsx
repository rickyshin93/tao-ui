import type { ReactNode } from 'react';

export type StatusIconType = 'success' | 'info' | 'warning' | 'error';

/**
 * Shared status icon set (single source for Alert, Popconfirm, and
 * Modal.confirm). Stroke-style, `currentColor`; the caller controls color
 * and (via `size`) dimensions. Internal — not exported from the package root.
 */

const STATUS_PATHS: Record<StatusIconType, ReactNode> = {
  success: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  warning: (
    <>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  error: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9 9 15M9 9l6 6" />
    </>
  ),
};

export function StatusIcon({
  type,
  size = '1em',
}: {
  type: StatusIconType;
  size?: number | string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {STATUS_PATHS[type]}
    </svg>
  );
}
