import type { IconProps } from './types.js';

/** Pure and hook-free: no global counter, generated ID, or hydration-dependent state. */
export function resolveIconProps({ size = 24, title, titleId, children, ...props }: IconProps) {
  const labelledBy = props['aria-labelledby'] || undefined;
  const label = props['aria-label'] || undefined;
  const resolvedTitleId = titleId || undefined;
  const hasName = Boolean(title || label || labelledBy);
  const hidden = props['aria-hidden'] ?? !hasName;

  return {
    title,
    titleId: resolvedTitleId,
    children,
    svgProps: {
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.8,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
      focusable: 'false' as const,
      ...props,
      'aria-hidden': hidden ? hidden : props['aria-hidden'],
      role: props.role ?? (hasName && hidden !== true && hidden !== 'true' ? 'img' : undefined),
      'aria-labelledby': labelledBy ?? (title && resolvedTitleId && !label ? resolvedTitleId : undefined),
      'aria-label': label ?? (title && !labelledBy && !resolvedTitleId ? title : undefined),
    },
  };
}
