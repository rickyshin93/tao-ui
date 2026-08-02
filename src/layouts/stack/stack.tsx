import type { CSSProperties, ReactNode } from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './layout.css';

export type StackSemanticPart = 'root';

export interface StackProps {
  direction?: 'vertical' | 'horizontal';
  gap?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
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
  return (
    <div
      data-tao-stack=""
      data-tao-direction={direction}
      data-tao-gap={gap}
      data-tao-align={align}
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      {children}
    </div>
  );
}
