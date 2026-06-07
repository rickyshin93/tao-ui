import { type ReactElement, useCallback, useMemo, useState } from 'react';
import type { ModalFuncReturn } from './confirm';
import {
  ConfirmDialog,
  type ConfirmType,
  type ModalFuncProps,
} from './confirm-dialog';

export interface ModalHookApi {
  confirm: (config: ModalFuncProps) => ModalFuncReturn;
  info: (config: ModalFuncProps) => ModalFuncReturn;
  success: (config: ModalFuncProps) => ModalFuncReturn;
  error: (config: ModalFuncProps) => ModalFuncReturn;
  warning: (config: ModalFuncProps) => ModalFuncReturn;
}

interface HookDialog {
  key: string;
  type: ConfirmType;
  open: boolean;
  config: ModalFuncProps;
}

let uuid = 0;

/**
 * Context-aware imperative modals. Render `contextHolder` inside your tree so the
 * dialogs inherit `TaoProvider` config and theme.
 *
 * ```tsx
 * const [modal, contextHolder] = Modal.useModal();
 * modal.confirm({ title: 'Delete?', onOk });
 * return <>{contextHolder}</>;
 * ```
 */
export function useModal(): [ModalHookApi, ReactElement] {
  const [dialogs, setDialogs] = useState<HookDialog[]>([]);

  const closeDialog = useCallback((key: string) => {
    setDialogs((prev) =>
      prev.map((d) => (d.key === key ? { ...d, open: false } : d)),
    );
  }, []);

  const destroyDialog = useCallback((key: string) => {
    setDialogs((prev) => prev.filter((d) => d.key !== key));
  }, []);

  const updateDialog = useCallback(
    (
      key: string,
      configUpdate:
        | Partial<ModalFuncProps>
        | ((prev: ModalFuncProps) => ModalFuncProps),
    ) => {
      setDialogs((prev) =>
        prev.map((d) =>
          d.key === key
            ? {
                ...d,
                config:
                  typeof configUpdate === 'function'
                    ? configUpdate(d.config)
                    : { ...d.config, ...configUpdate },
              }
            : d,
        ),
      );
    },
    [],
  );

  const api = useMemo<ModalHookApi>(() => {
    const open = (
      config: ModalFuncProps,
      type: ConfirmType,
    ): ModalFuncReturn => {
      const key = `tao-modal-${uuid++}`;
      setDialogs((prev) => [...prev, { key, type, open: true, config }]);
      return {
        destroy: () => closeDialog(key),
        update: (configUpdate) => updateDialog(key, configUpdate),
      };
    };
    return {
      confirm: (config) => open(config, 'confirm'),
      info: (config) => open({ okCancel: false, ...config }, 'info'),
      success: (config) => open({ okCancel: false, ...config }, 'success'),
      error: (config) => open({ okCancel: false, ...config }, 'error'),
      warning: (config) => open({ okCancel: false, ...config }, 'warning'),
    };
  }, [closeDialog, updateDialog]);

  const contextHolder = (
    <>
      {dialogs.map((d) => (
        <ConfirmDialog
          {...d.config}
          key={d.key}
          type={d.type}
          open={d.open}
          close={() => closeDialog(d.key)}
          afterClose={() => {
            d.config.afterClose?.();
            destroyDialog(d.key);
          }}
        />
      ))}
    </>
  );

  return [api, contextHolder];
}
