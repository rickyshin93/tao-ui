import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useState,
} from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { StatusIcon } from '../status-icon/status-icon';
import './alert.css';

// ---- Types ----

export type AlertSemanticPart =
  | 'root'
  | 'icon'
  | 'title'
  | 'description'
  | 'action'
  | 'close';

export type AlertType = 'success' | 'info' | 'warning' | 'error';

export interface AlertProps {
  type?: AlertType;
  title?: ReactNode;
  description?: ReactNode;
  showIcon?: boolean;
  icon?: ReactNode;
  closable?: boolean;
  onClose?: (e: MouseEvent<HTMLElement>) => void;
  action?: ReactNode;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<AlertSemanticPart>;
  styles?: SemanticStyles<AlertSemanticPart>;
}

// ---- Icons ----

function CloseIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <path
        d="M3 3l6 6M9 3l-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---- Alert ----

export function Alert({
  type = 'info',
  title,
  description,
  showIcon = false,
  icon,
  closable = false,
  onClose,
  action,
  className,
  style,
  classNames,
  styles,
}: AlertProps) {
  const [visible, setVisible] = useState(true);

  const handleClose = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      setVisible(false);
      onClose?.(e);
    },
    [onClose],
  );

  if (!visible) return null;

  const hasDescription = description != null;
  const renderIcon = showIcon || icon != null;

  return (
    <div
      role="alert"
      data-tao-alert=""
      data-tao-type={type}
      data-tao-with-description={hasDescription || undefined}
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      {renderIcon && (
        <span
          data-tao-alert-icon=""
          className={cx(classNames?.icon)}
          style={styles?.icon}
        >
          {icon ?? <StatusIcon type={type} />}
        </span>
      )}
      <div data-tao-alert-content="">
        {title != null && (
          <div
            data-tao-alert-title=""
            className={cx(classNames?.title)}
            style={styles?.title}
          >
            {title}
          </div>
        )}
        {hasDescription && (
          <div
            data-tao-alert-description=""
            className={cx(classNames?.description)}
            style={styles?.description}
          >
            {description}
          </div>
        )}
      </div>
      {action != null && (
        <div
          data-tao-alert-action=""
          className={cx(classNames?.action)}
          style={styles?.action}
        >
          {action}
        </div>
      )}
      {closable && (
        <button
          type="button"
          data-tao-alert-close=""
          aria-label="Close"
          onClick={handleClose}
          className={cx(classNames?.close)}
          style={styles?.close}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
