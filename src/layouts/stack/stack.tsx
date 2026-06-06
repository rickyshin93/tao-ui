import type { ReactNode } from 'react';
import './layout.css';

export interface StackProps {
  direction?: 'vertical' | 'horizontal';
  gap?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
  children: ReactNode;
}

export function Stack({
  direction = 'vertical',
  gap = 'md',
  align = 'stretch',
  children,
}: StackProps) {
  return (
    <div
      data-tao-stack=""
      data-tao-direction={direction}
      data-tao-gap={gap}
      data-tao-align={align}
    >
      {children}
    </div>
  );
}
