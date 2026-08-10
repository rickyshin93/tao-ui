import { type ReactNode, useState } from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Button, type ButtonProps } from '../button/button';
import { StatusIcon } from '../status-icon/status-icon';
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

  const runAndClose = async (
    handler?: () => unknown,
    withLoading?: boolean,
  ) => {
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

  const iconNode = icon === null ? null : (icon ?? <StatusIconFor type={type} />);

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

function StatusIconFor({ type }: { type: ConfirmType }) {
  // 'confirm' uses the warning triangle; the rest map 1:1 onto the shared set.
  return (
    <StatusIcon
      type={type === 'confirm' ? 'warning' : type}
      size={22}
    />
  );
}
