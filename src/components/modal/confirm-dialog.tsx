import { type ReactNode, useState } from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Button, type ButtonProps } from '../button/button';
import { Modal, type ModalSemanticPart } from './modal';

export type ConfirmType = 'info' | 'success' | 'error' | 'warning' | 'confirm';

/** Config accepted by `Modal.confirm/info/...` and `modal.confirm/...` from `useModal`. */
export interface ModalFuncProps {
  title?: ReactNode;
  content?: ReactNode;
  /** Custom status icon. Pass `null` to hide the icon. */
  icon?: ReactNode | null;
  type?: ConfirmType;
  okText?: ReactNode;
  cancelText?: ReactNode;
  /** Show the Cancel button. Defaults to `true` only for `confirm` type. */
  okCancel?: boolean;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  /** Return a Promise to keep the OK button in loading state until it settles. */
  onOk?: () => unknown;
  onCancel?: () => unknown;
  afterClose?: () => void;
  centered?: boolean;
  width?: number | string;
  maskClosable?: boolean;
  closable?: boolean;
  keyboard?: boolean;
  className?: string;
  classNames?: SemanticClassNames<ModalSemanticPart>;
  styles?: SemanticStyles<ModalSemanticPart>;
}

export interface ConfirmDialogProps extends ModalFuncProps {
  open: boolean;
  /** Requests close (container flips `open` to false). */
  close: () => void;
}

function isPromise(v: unknown): v is Promise<unknown> {
  return !!v && typeof (v as { then?: unknown }).then === 'function';
}

export function ConfirmDialog({
  open,
  close,
  type = 'confirm',
  icon,
  title,
  content,
  okText,
  cancelText,
  okCancel,
  okButtonProps,
  cancelButtonProps,
  onOk,
  onCancel,
  afterClose,
  centered = true,
  width = 416,
  maskClosable = false,
  closable = false,
  keyboard = true,
  className,
  classNames,
  styles,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const showCancel = okCancel ?? type === 'confirm';

  const runAndClose = async (handler?: () => unknown, withLoading?: boolean) => {
    const result = handler?.();
    if (isPromise(result)) {
      if (withLoading) setLoading(true);
      try {
        await result;
        close();
      } catch {
        // Reject keeps the dialog open.
      } finally {
        if (withLoading) setLoading(false);
      }
    } else {
      close();
    }
  };

  const handleOk = () => runAndClose(onOk, true);
  const handleCancel = () => runAndClose(onCancel, false);

  const iconNode = icon === null ? null : (icon ?? <StatusIcon type={type} />);

  const mergedClassNames = className
    ? { ...classNames, root: cx(classNames?.root, className) }
    : classNames;

  return (
    <Modal
      open={open}
      title={null}
      onClose={handleCancel}
      afterClose={afterClose}
      width={width}
      centered={centered}
      closable={closable}
      maskClosable={maskClosable}
      keyboard={keyboard}
      classNames={mergedClassNames}
      styles={styles}
      footer={
        <>
          {showCancel && (
            <Button
              variant="secondary"
              onClick={handleCancel}
              {...cancelButtonProps}
            >
              {cancelText ?? 'Cancel'}
            </Button>
          )}
          <Button
            variant="primary"
            loading={loading}
            onClick={handleOk}
            {...okButtonProps}
          >
            {okText ?? 'OK'}
          </Button>
        </>
      }
    >
      <div data-tao-modal-confirm-body="">
        {iconNode != null && (
          <span data-tao-modal-confirm-icon="" data-tao-status={type}>
            {iconNode}
          </span>
        )}
        <div data-tao-modal-confirm-main="">
          {title != null && <div data-tao-modal-confirm-title="">{title}</div>}
          {content != null && (
            <div data-tao-modal-confirm-content="">{content}</div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function StatusIcon({ type }: { type: ConfirmType }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (type) {
    case 'success':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12 2.5 2.5 4.5-5" />
        </svg>
      );
    case 'error':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15 9 9 15M9 9l6 6" />
        </svg>
      );
    case 'warning':
    case 'confirm':
      return (
        <svg {...common}>
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      );
    default: // info
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      );
  }
}
