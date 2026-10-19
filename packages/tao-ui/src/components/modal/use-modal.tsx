import { type ReactElement, useMemo, useState } from 'react';
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
  onMount: () => void;
  close: () => void;
  afterClose: () => void;
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

  const api = useMemo<ModalHookApi>(() => {
    const open = (
      config: ModalFuncProps,
      type: ConfirmType,
    ): ModalFuncReturn => {
      const key = `tao-modal-${uuid++}`;
      let currentConfig = config;
      let mounted = false;
      let closed = false;
      let destroyed = false;

      const afterClose = () => {
        if (destroyed) return;
        destroyed = true;
        setDialogs((prev) => prev.filter((d) => d.key !== key));
        currentConfig.afterClose?.();
      };
      const close = () => {
        if (closed) return;
        closed = true;
        if (mounted) {
          setDialogs((prev) =>
            prev.map((d) => (d.key === key ? { ...d, open: false } : d)),
          );
        } else {
          afterClose();
        }
      };
      const onMount = () => {
        mounted = true;
      };
      setDialogs((prev) => [
        ...prev,
        { key, type, open: true, config, onMount, close, afterClose },
      ]);
      return {
        destroy: close,
        update: (configUpdate) => {
          if (closed || destroyed) return;
          currentConfig =
            typeof configUpdate === 'function'
              ? configUpdate(currentConfig)
              : { ...currentConfig, ...configUpdate };
          const nextConfig = currentConfig;
          setDialogs((prev) =>
            prev.map((d) => (d.key === key ? { ...d, config: nextConfig } : d)),
          );
        },
      };
    };
    return {
      confirm: (config) => open(config, 'confirm'),
      info: (config) => open({ okCancel: false, ...config }, 'info'),
      success: (config) => open({ okCancel: false, ...config }, 'success'),
      error: (config) => open({ okCancel: false, ...config }, 'error'),
      warning: (config) => open({ okCancel: false, ...config }, 'warning'),
    };
  }, []);

  const contextHolder = (
    <>
      {dialogs.map((d) => (
        <ConfirmDialog
          {...d.config}
          key={d.key}
          type={d.type}
          open={d.open}
          onMount={d.onMount}
          close={d.close}
          afterClose={d.afterClose}
        />
      ))}
    </>
  );

  return [api, contextHolder];
}
