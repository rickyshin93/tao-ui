import {
  cloneElement,
  type CSSProperties,
  isValidElement,
  type ReactNode,
  useId,
} from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
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
  const generatedId = useId();
  const child = isValidElement<Record<string, unknown>>(children)
    ? children
    : null;
  const childId = typeof child?.props.id === 'string' ? child.props.id : undefined;
  const controlId = htmlFor ?? childId ?? `${generatedId}-control`;
  const descriptionId = `${generatedId}-description`;
  const errorId = `${generatedId}-error`;
  const childDescribedBy =
    typeof child?.props['aria-describedby'] === 'string'
      ? child.props['aria-describedby']
      : undefined;
  const describedBy = [
    childDescribedBy,
    error ? errorId : description ? descriptionId : undefined,
  ]
    .filter(Boolean)
    .join(' ');
  const control = child
    ? cloneElement(child, {
        id: controlId,
        'aria-describedby': describedBy || undefined,
        'aria-errormessage': error ? errorId : undefined,
        'aria-invalid': error ? true : child.props['aria-invalid'],
        'aria-required': required ? true : child.props['aria-required'],
      })
    : children;

  return (
    <div
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      data-tao-form-field=""
    >
      <label
        htmlFor={controlId}
        className={classNames?.label}
        style={styles?.label}
        data-tao-form-label=""
      >
        {label}
        {required && (
          <span data-tao-required="" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {control}
      {error ? (
        <p
          className={classNames?.error}
          style={styles?.error}
          data-tao-form-error=""
          id={errorId}
          role="alert"
        >
          {error}
        </p>
      ) : description ? (
        <p
          className={classNames?.description}
          style={styles?.description}
          data-tao-form-description=""
          id={descriptionId}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
