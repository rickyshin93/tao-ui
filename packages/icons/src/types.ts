import type { SVGProps } from 'react';

/** Native SVG props, plus square size and optional accessible title. */
export type IconProps = Omit<SVGProps<SVGSVGElement>, 'ref' | 'dangerouslySetInnerHTML'> & {
  /** Width and height default to 24; explicit width/height take precedence. */
  size?: number | string;
  /** Accessible name fallback; also renders a native SVG title. */
  title?: string;
  /** Optional caller-owned unique ID, used to link the title. */
  titleId?: string;
};
