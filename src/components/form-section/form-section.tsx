import type { CSSProperties, ReactNode } from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import '../form-field/form.css';

export type FormSectionSemanticPart =
  | 'root'
  | 'header'
  | 'title'
  | 'description'
  | 'body';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<FormSectionSemanticPart>;
  styles?: SemanticStyles<FormSectionSemanticPart>;
}

export function FormSection({
  title,
  description,
  children,
  className,
  style,
  classNames,
  styles,
}: FormSectionProps) {
  return (
    <section
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      data-tao-form-section=""
    >
      {(title || description) && (
        <div
          className={classNames?.header}
          style={styles?.header}
          data-tao-form-section-header=""
        >
          {title && (
            <div
              className={classNames?.title}
              style={styles?.title}
              data-tao-form-section-title=""
            >
              {title}
            </div>
          )}
          {description && (
            <p
              className={classNames?.description}
              style={styles?.description}
              data-tao-form-section-description=""
            >
              {description}
            </p>
          )}
        </div>
      )}
      <div
        className={classNames?.body}
        style={styles?.body}
        data-tao-form-section-body=""
      >
        {children}
      </div>
    </section>
  );
}
