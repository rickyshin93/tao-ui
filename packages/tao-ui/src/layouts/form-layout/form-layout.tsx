import type { CSSProperties, ReactNode } from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import '../stack/layout.css';

export type FormLayoutSemanticPart = 'root';

export interface FormLayoutProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<FormLayoutSemanticPart>;
  styles?: SemanticStyles<FormLayoutSemanticPart>;
}

export function FormLayout({
  children,
  className,
  style,
  classNames,
  styles,
}: FormLayoutProps) {
  return (
    <div
      data-tao-form-layout=""
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      {children}
    </div>
  );
}
