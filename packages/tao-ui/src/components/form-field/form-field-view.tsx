import {
  type CSSProperties,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useId,
} from 'react';
import { FieldLabelContext } from '../../utils/field-label';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';

export type FormFieldLayout = 'vertical' | 'horizontal';

export interface FormFieldViewProps {
  /** Identifies Form.Item without changing standalone FormField spacing. */
  formItem?: boolean;
  label?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  error?: ReactNode;
  /** Render the message slot with warning styling instead of error. */
  warning?: boolean;
  description?: ReactNode;
  layout?: FormFieldLayout;
  /**
   * Extra props cloned onto the single child control (e.g. Form.Item's
   * `value`/`onChange`/`status`). View-owned id/aria attributes win.
   */
  controlProps?: Record<string, unknown>;
  /** Internal hook for bound forms to register the final control and its id. */
  renderControl?: (control: ReactElement<Record<string, unknown>>) => ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<'root' | 'label' | 'error' | 'description'>;
  styles?: SemanticStyles<'root' | 'label' | 'error' | 'description'>;
}

/**
 * Shared presentational view behind FormField (standalone) and Form.Item
 * (rc-form bound): label + required mark + control + error/description slots
 * with the aria wiring (describedby/errormessage/invalid/required) applied
 * to the child control. Not part of the public API.
 */
export function FormFieldView({
  formItem,
  label,
  htmlFor,
  required,
  error,
  warning,
  description,
  layout = 'vertical',
  controlProps,
  renderControl,
  children,
  className,
  style,
  classNames,
  styles,
}: FormFieldViewProps) {
  const generatedId = useId();
  const child = isValidElement<Record<string, unknown>>(children)
    ? children
    : null;
  const childId =
    typeof child?.props.id === 'string' ? child.props.id : undefined;
  const controlId = htmlFor ?? childId ?? `${generatedId}-control`;
  const labelId = `${generatedId}-label`;
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
        ...controlProps,
        id: controlId,
        'aria-labelledby':
          child.props['aria-labelledby'] ??
          (label != null && !child.props['aria-label'] ? labelId : undefined),
        'aria-describedby': describedBy || undefined,
        'aria-errormessage':
          error && !warning ? errorId : child.props['aria-errormessage'],
        'aria-invalid': error && !warning ? true : child.props['aria-invalid'],
        'aria-required': required ? true : child.props['aria-required'],
      })
    : children;

  const message = error ? (
    <p
      className={classNames?.error}
      style={styles?.error}
      data-tao-form-error=""
      data-tao-status={warning ? 'warning' : undefined}
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
  ) : null;

  return (
    <div
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      data-tao-form-field=""
      data-tao-form-item={formItem ? '' : undefined}
      data-tao-layout={layout === 'horizontal' ? 'horizontal' : undefined}
    >
      {label != null && (
        <label
          id={labelId}
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
      )}
      <div data-tao-form-control="">
        <FieldLabelContext.Provider value={label}>
          {renderControl && isValidElement<Record<string, unknown>>(control)
            ? renderControl(control)
            : control}
        </FieldLabelContext.Provider>
        {formItem ? <div data-tao-form-message="">{message}</div> : message}
      </div>
    </div>
  );
}
