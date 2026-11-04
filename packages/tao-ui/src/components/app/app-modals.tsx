import {
  type FC,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import { cx } from '../../utils/semantic';
import { Button, type ButtonProps } from '../button/button';
import { Modal } from '../modal/modal';
import { StatusIcon } from '../status-icon/status-icon';
import { resolveAppSemantic } from './app-notices';
import type {
  AppModalConfig,
  AppModalInstance,
  AppModalResult,
} from './app-types';

interface DialogEntry {
  key: number;
  config: AppModalConfig;
  open: boolean;
  mount: () => void;
  close: (confirmed: boolean) => void;
  remove: () => void;
}

function AppConfirm({ config, open, mount, close, remove }: DialogEntry) {
  const { locale } = useTaoConfig();
  const [pending, setPending] = useState<'ok' | 'cancel' | null>(null);
  const busy = useRef(false);
  useLayoutEffect(mount, [mount]);
  const run = async (action: 'ok' | 'cancel') => {
    if (busy.current) return;
    const callback = action === 'ok' ? config.onOk : config.onCancel;
    const finish = () => close(action === 'ok');
    const result = callback?.(finish);
    if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
      busy.current = true;
      setPending(action);
      try {
        await result;
        finish();
      } catch {
        /* Rejection is the public contract for keeping a confirmation open. */
      } finally {
        busy.current = false;
        setPending(null);
      }
    } else if (!callback?.length) finish();
  };
  const variant: ButtonProps['variant'] =
    config.okType === 'default' || config.okType === 'dashed'
      ? 'secondary'
      : config.okType === 'link'
        ? 'bare'
        : (config.okType ?? 'primary');
  const OkBtn: FC = () => (
    <Button
      variant={variant}
      {...config.okButtonProps}
      data-tao-modal-action="ok"
      loading={
        pending === 'ok' ||
        config.confirmLoading ||
        config.okButtonProps?.loading
      }
      disabled={pending === 'cancel' || config.okButtonProps?.disabled}
      onClick={(event) => {
        config.okButtonProps?.onClick?.(event);
        if (!event.defaultPrevented) void run('ok');
      }}
    >
      {config.okText ?? locale.ok}
    </Button>
  );
  const CancelBtn: FC = () => (
    <Button
      variant="secondary"
      {...config.cancelButtonProps}
      data-tao-modal-action="cancel"
      loading={pending === 'cancel' || config.cancelButtonProps?.loading}
      disabled={pending === 'ok' || config.cancelButtonProps?.disabled}
      onClick={(event) => {
        config.cancelButtonProps?.onClick?.(event);
        if (!event.defaultPrevented) void run('cancel');
      }}
    >
      {config.cancelText ?? locale.cancel ?? 'Cancel'}
    </Button>
  );
  const defaultFooter = (
    <>
      {(config.okCancel ?? config.type === 'confirm') && <CancelBtn />}
      <OkBtn />
    </>
  );
  const footer =
    typeof config.footer === 'function'
      ? config.footer(defaultFooter, { OkBtn, CancelBtn })
      : config.footer === undefined
        ? defaultFooter
        : config.footer;
  const type =
    config.type === 'confirm' || config.type === 'warn'
      ? 'warning'
      : (config.type ?? 'warning');
  const classes = resolveAppSemantic(config.classNames, config);
  const styles = resolveAppSemantic(config.styles, config);
  const icon =
    config.icon === undefined ? <StatusIcon type={type} /> : config.icon;
  return (
    <Modal
      {...config}
      open={open}
      title={config.title}
      width={config.width ?? 416}
      centered={config.centered ?? false}
      closable={
        config.closable
          ? {
              'aria-label': locale.close,
              ...(typeof config.closable === 'object' ? config.closable : {}),
            }
          : false
      }
      maskClosable={config.maskClosable ?? false}
      onClose={() => {
        void run('cancel');
      }}
      onOk={() => {
        void run('ok');
      }}
      afterClose={remove}
      focusTriggerAfterClose={config.focusTriggerAfterClose ?? true}
      autoFocusButton={
        config.autoFocusButton === undefined ? 'ok' : config.autoFocusButton
      }
      footer={footer}
      classNames={{
        ...classes,
        root: cx(
          classes?.root,
          config.className,
          config.rootClassName,
          config.prefixCls,
        ),
        wrapper: cx(classes?.wrapper, config.wrapClassName),
      }}
      styles={{
        ...styles,
        root: { ...styles?.root, ...config.style, direction: config.direction },
        body: { ...config.bodyStyle, ...styles?.body },
        mask: { ...config.maskStyle, ...styles?.mask },
      }}
    >
      <div data-tao-app-modal-body="">
        {icon != null && (
          <span data-tao-modal-confirm-icon="" data-tao-status={type}>
            {icon}
          </span>
        )}
        <div data-tao-app-modal-content="">{config.content}</div>
      </div>
    </Modal>
  );
}

export function useAppModals() {
  const [dialogs, setDialogs] = useState<DialogEntry[]>([]);
  const resolvers = useRef(new Set<(value: boolean) => void>());
  const sequence = useRef(0);
  useEffect(
    () => () => {
      for (const resolve of resolvers.current) resolve(false);
      resolvers.current.clear();
    },
    [],
  );
  const api = useMemo<AppModalInstance>(() => {
    const show = (
      initial: AppModalConfig,
      type: NonNullable<AppModalConfig['type']>,
    ): AppModalResult => {
      const key = sequence.current++;
      let config: AppModalConfig = {
        okCancel: type === 'confirm',
        ...initial,
        type,
      };
      let mounted = false;
      let closed = false;
      let removed = false;
      let resolve!: (value: boolean) => void;
      const promise = new Promise<boolean>((done) => {
        resolve = done;
      });
      resolvers.current.add(resolve);
      const remove = () => {
        if (removed) return;
        removed = true;
        setDialogs((previous) =>
          previous.filter((dialog) => dialog.key !== key),
        );
        config.afterClose?.();
      };
      const close = (confirmed: boolean) => {
        if (closed) return;
        closed = true;
        resolve(confirmed);
        resolvers.current.delete(resolve);
        if (!mounted) remove();
        else
          setDialogs((previous) =>
            previous.map((dialog) =>
              dialog.key === key ? { ...dialog, open: false } : dialog,
            ),
          );
      };
      setDialogs((previous) => [
        ...previous,
        {
          key,
          config,
          open: config.open ?? true,
          mount: () => {
            mounted = true;
          },
          close,
          remove,
        },
      ]);
      return {
        destroy: () => close(false),
        update: (update) => {
          if (closed) return;
          config =
            typeof update === 'function'
              ? update(config)
              : { ...config, ...update };
          if (config.open === false) close(false);
          else
            setDialogs((previous) =>
              previous.map((dialog) =>
                dialog.key === key ? { ...dialog, config } : dialog,
              ),
            );
        },
        // biome-ignore lint/suspicious/noThenProperty: The hook modal API intentionally supports awaiting confirmation.
        then: promise.then.bind(promise),
      };
    };
    return {
      confirm: (config) => show(config, 'confirm'),
      info: (config) => show(config, 'info'),
      success: (config) => show(config, 'success'),
      error: (config) => show(config, 'error'),
      warning: (config) => show(config, 'warning'),
    };
  }, []);
  return [
    api,
    dialogs.map((dialog) => <AppConfirm {...dialog} key={dialog.key} />),
  ] as const;
}
