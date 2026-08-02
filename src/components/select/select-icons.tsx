import type { SVGProps } from 'react';

export function ChevronDownIcon() {
  return (
    <Icon size={16} strokeWidth={2}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function CheckIcon() {
  return (
    <Icon size={16} strokeWidth={2.5}>
      <polyline points="20 6 9 17 4 12" />
    </Icon>
  );
}

export function CloseIcon({ small = false }: { small?: boolean }) {
  return (
    <Icon size={small ? 10 : 14} strokeWidth={small ? 2.5 : 2}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Icon>
  );
}

export function SearchIcon() {
  return (
    <Icon size={14} strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </Icon>
  );
}

export function LoadingIcon() {
  return (
    <Icon size={16} strokeWidth={2} data-tao-select-loading="">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </Icon>
  );
}

function Icon({
  size,
  strokeWidth,
  children,
  ...props
}: SVGProps<SVGSVGElement> & { size: number }) {
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
      {...props}
    >
      {children}
    </svg>
  );
}
