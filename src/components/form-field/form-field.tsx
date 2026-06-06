import type { CSSProperties, ReactNode } from 'react';
import { cx, type SemanticClassNames, type SemanticStyles } from '../../utils/semantic';
import './form.css';

export type FormFieldSemanticPart = 'root' | 'label' | 'error' | 'description';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<FormFieldSemanticPart>;
  styles?: SemanticStyles<FormFieldSemanticPart>;
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  description,
  children,
  className,
  style,
  classNames,
  styles,
}: FormFieldProps) {
  return (
    <div
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      data-tao-form-field=""
    >
      <label
        htmlFor={htmlFor}
        className={classNames?.label}
        style={styles?.label}
        data-tao-form-label=""
      >
        {label}
        {required && <span data-tao-required="" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p
          className={classNames?.error}
          style={styles?.error}
          data-tao-form-error=""
          role="alert"
        >
          {error}
        </p>
      ) : description ? (
        <p
          className={classNames?.description}
          style={styles?.description}
          data-tao-form-description=""
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
