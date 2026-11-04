import type { ReactNode } from 'react';

const paths = {
  close: <path d="m6 6 12 12M6 18 18 6" />,
  prev: <path d="m14 5-7 7 7 7" />,
  next: <path d="m10 5 7 7-7 7" />,
  rotateLeft: <path d="M3 9h5M3 9V4m0 5a9 9 0 1 1 0 7" />,
  rotateRight: <path d="M21 9h-5m5 0V4m0 5a9 9 0 1 0 0 7" />,
  zoomIn: <path d="M5 12h14M12 5v14" />,
  zoomOut: <path d="M5 12h14" />,
  flipX: <path d="M12 3v2m0 4v2m0 4v2m0 4v-1M8 6v12H3L8 6Zm8 0v12h5L16 6Z" />,
  flipY: <path d="M3 12h2m4 0h2m4 0h2m4 0h-1M6 8h12V3L6 8Zm0 8h12v5L6 16Z" />,
} satisfies Record<string, ReactNode>;

export function ImageControlIcon({
  name,
  label,
}: {
  name: keyof typeof paths;
  label?: string;
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
