import type { CSSProperties, ReactNode } from 'react';
import type { SemanticClassNames, SemanticStyles } from '../../utils/semantic';
import { FormFieldView } from './form-field-view';

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
    <FormFieldView
      label={label}
      htmlFor={htmlFor}
      required={required}
      error={error}
      description={description}
      className={className}
      style={style}
      classNames={classNames}
      styles={styles}
    >
      {children}
    </FormFieldView>
  );
}
