import type { CSSProperties, ReactNode } from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import '../form-field/form.css';

export type FormActionsSemanticPart = 'root';

export interface FormActionsProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<FormActionsSemanticPart>;
  styles?: SemanticStyles<FormActionsSemanticPart>;
}

export function FormActions({
  children,
  className,
  style,
  classNames,
  styles,
}: FormActionsProps) {
  return (
    <div
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      data-tao-form-actions=""
    >
      {children}
    </div>
  );
}
