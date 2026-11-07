import confirm, {
  destroyFns,
  type ModalFuncReturn,
  withConfirm,
  withError,
  withInfo,
  withSuccess,
  withWarn,
} from './confirm';
import type { ModalFuncProps } from './confirm-dialog';
import { Modal as InternalModal } from './modal';
import { useModal } from './use-modal';

type ConfirmFn = (config: ModalFuncProps) => ModalFuncReturn;

type ModalType = typeof InternalModal & {
  confirm: ConfirmFn;
  info: ConfirmFn;
  success: ConfirmFn;
  error: ConfirmFn;
  warning: ConfirmFn;
  warn: ConfirmFn;
  useModal: typeof useModal;
  destroyAll: () => void;
};

const Modal = InternalModal as ModalType;

Modal.confirm = (config) => confirm(withConfirm(config));
Modal.info = (config) => confirm(withInfo(config));
Modal.success = (config) => confirm(withSuccess(config));
Modal.error = (config) => confirm(withError(config));
Modal.warning = (config) => confirm(withWarn(config));
Modal.warn = Modal.warning;
Modal.useModal = useModal;
Modal.destroyAll = () => {
  const errors: unknown[] = [];
  for (const close of [...destroyFns].reverse()) {
    try {
      close();
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length === 1) throw errors[0];
  if (errors.length > 1)
    throw new AggregateError(errors, 'Modal cleanup failed');
};

export type { ModalFuncReturn } from './confirm';
export type { ConfirmType, ModalFuncProps } from './confirm-dialog';
export type { ModalFooterRender, ModalProps, ModalSemanticPart } from './modal';
export type { ModalHookApi } from './use-modal';
export { Modal };
