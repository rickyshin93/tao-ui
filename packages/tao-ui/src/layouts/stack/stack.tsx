import type { CSSProperties, ReactNode } from 'react';
import {
  resolveResponsiveValue,
  type TaoResponsiveValue,
  useBreakpoint,
} from '../../utils/breakpoint';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './layout.css';

export type StackSemanticPart = 'root';

export type StackDirection = 'vertical' | 'horizontal';
export type StackGap = 'sm' | 'md' | 'lg';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';

export interface StackProps {
  /**
   * Flex direction. Accepts a breakpoint map, e.g.
   * `direction={{ xs: 'vertical', md: 'horizontal' }}` — the largest matching
   * breakpoint wins (SSR/first render falls back to the plain default).
   */
  direction?: TaoResponsiveValue<StackDirection>;
  gap?: TaoResponsiveValue<StackGap>;
  align?: TaoResponsiveValue<StackAlign>;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<StackSemanticPart>;
  styles?: SemanticStyles<StackSemanticPart>;
}

export function Stack({
  direction = 'vertical',
  gap = 'md',
  align = 'stretch',
  children,
  className,
  style,
  classNames,
  styles,
}: StackProps) {
  const screens = useBreakpoint();
  const resolvedDirection =
    resolveResponsiveValue(direction, screens) ?? 'vertical';
  const resolvedGap = resolveResponsiveValue(gap, screens) ?? 'md';
  const resolvedAlign = resolveResponsiveValue(align, screens) ?? 'stretch';

  return (
    <div
      data-tao-stack=""
      data-tao-direction={resolvedDirection}
      data-tao-gap={resolvedGap}
      data-tao-align={resolvedAlign}
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      {children}
    </div>
  );
}
