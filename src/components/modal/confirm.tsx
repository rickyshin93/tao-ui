import { createRoot } from 'react-dom/client';
import {
  ConfirmDialog,
  type ConfirmType,
  type ModalFuncProps,
} from './confirm-dialog';

export interface ModalFuncReturn {
  destroy: () => void;
  update: (
    configUpdate:
      | Partial<ModalFuncProps>
      | ((prev: ModalFuncProps) => ModalFuncProps),
  ) => void;
}

/** Registry of close handlers so `Modal.destroyAll()` can tear every instance down. */
export const destroyFns: Array<() => void> = [];

export default function confirm(config: ModalFuncProps): ModalFuncReturn {
  const container = document.createElement('div');
  const root = createRoot(container);

  let currentConfig = config;
  let open = true;

  function destroy() {
    root.unmount();
    const idx = destroyFns.indexOf(destroy);
    if (idx !== -1) destroyFns.splice(idx, 1);
  }

  function afterClose() {
    currentConfig.afterClose?.();
    destroy();
  }

  function close() {
    open = false;
    render();
  }

  function render() {
    root.render(
      <ConfirmDialog
        {...currentConfig}
        open={open}
        close={close}
        afterClose={afterClose}
      />,
    );
  }

  function update(
    configUpdate:
      | Partial<ModalFuncProps>
      | ((prev: ModalFuncProps) => ModalFuncProps),
  ) {
    currentConfig =
      typeof configUpdate === 'function'
        ? configUpdate(currentConfig)
        : { ...currentConfig, ...configUpdate };
    render();
  }

  render();
  destroyFns.push(destroy);

  return { destroy: close, update };
}

const withType =
  (type: ConfirmType, okCancel: boolean) =>
  (props: ModalFuncProps): ModalFuncProps => ({ okCancel, ...props, type });

export const withConfirm = withType('confirm', true);
export const withInfo = withType('info', false);
export const withSuccess = withType('success', false);
export const withError = withType('error', false);
export const withWarn = withType('warning', false);
