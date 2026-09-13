import type { ReactNode } from 'react';

/**
 * Internal glyphs for Steps. Stroke-style and `currentColor`-driven so the
 * icon container keeps full control of color and size (`font-size` based `1em`
 * sizing lets CSS scale them with the step icon).
 */

function Icon({
  size = '1em',
  strokeWidth = 2,
  children,
}: {
  size?: number | string;
  strokeWidth?: number;
  children: ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      {children}
    </svg>
  );
}

/** `finish` step glyph. */
export function StepCheckIcon() {
  return (
    <Icon strokeWidth={3}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Icon>
  );
}

/** `error` step glyph. */
export function StepCloseIcon() {
  return (
    <Icon strokeWidth={3}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Icon>
  );
}

/** Collapsed-range glyph used by `maxCount`. */
export function StepEllipsisIcon() {
  return (
    <Icon>
      <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/**
 * Notched separator drawn between `type="panel"` steps. `preserveAspectRatio="none"`
 * lets the arrow stretch to the measured panel height.
 */
export function PanelArrow() {
  return (
    <svg
      data-tao-steps-panel-arrow=""
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <path d="M 0 0 L 100 50 L 0 100" />
    </svg>
  );
}
