import {
  type NotificationConfig,
  type NotificationProps,
  useNotification,
} from '@rc-component/notification';
import { type Key, type ReactNode, useEffect, useMemo, useRef } from 'react';
import {
  TaoPortalScope,
  useTaoConfig,
  useTaoInternalConfig,
} from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Spinner } from '../spinner/spinner';
import { StatusIcon } from '../status-icon/status-icon';
import type {
  AppMessageArgs,
  AppMessageConfig,
  AppMessageInstance,
  AppMessageType,
  AppNoticeType,
  AppNotificationArgs,
  AppNotificationConfig,
  AppNotificationInstance,
  AppNotificationSemanticPart,
} from './app-types';

export function resolveAppSemantic<T, P>(
  value: T | ((info: { props: P }) => T) | undefined,
  props: P,
): T | undefined {
  return typeof value === 'function'
    ? (value as (info: { props: P }) => T)({ props })
    : value;
}

const slots: AppNotificationSemanticPart[] = [
  'list',
  'listContent',
  'root',
  'wrapper',
  'icon',
  'title',
  'description',
  'actions',
  'section',
  'close',
  'progress',
];

function noticeClasses(
  ...sources: (SemanticClassNames<AppNotificationSemanticPart> | undefined)[]
) {
  return Object.fromEntries(
    slots.map((part) => [
      part,
      cx(`tao-app-notice-${part}`, ...sources.map((source) => source?.[part])),
    ]),
  );
}

function noticeStyles(
  ...sources: (SemanticStyles<AppNotificationSemanticPart> | undefined)[]
) {
  return Object.fromEntries(
    slots.map((part) => [
      part,
      Object.assign({}, ...sources.map((source) => source?.[part])),
    ]),
  );
}

function iconFor(type?: AppNoticeType, icon?: ReactNode) {
  if (icon !== undefined) return icon;
  if (!type) return undefined;
  return (
    <span data-tao-notice-status={type}>
      {type === 'loading' ? (
        <Spinner size="small" />
      ) : (
        <StatusIcon type={type} />
      )}
    </span>
  );
}

function useNoticeHolder(
  kind: 'message' | 'notification',
  config: AppMessageConfig | AppNotificationConfig,
) {
  const { tokenStyle } = useTaoInternalConfig();
  const notificationConfig = config as AppNotificationConfig;
  const [api, holder] = useNotification({
    prefixCls: config.prefixCls ?? `tao-app-${kind}`,
    getContainer: config.getContainer,
    duration: config.duration ?? (kind === 'message' ? 3 : 4.5),
    maxCount: config.maxCount,
    pauseOnHover: config.pauseOnHover ?? true,
    showProgress: notificationConfig.showProgress,
    stack: config.stack ?? (kind === 'notification' ? { threshold: 3 } : false),
    closable: kind === 'notification',
    classNames: noticeClasses(
      resolveAppSemantic(
        notificationConfig.classNames,
        config as AppNotificationArgs,
      ),
    ),
    styles: resolveAppSemantic(
      notificationConfig.styles,
      config as AppNotificationArgs,
    ),
    motion: (config as AppMessageConfig).transitionName
      ? { motionName: (config as AppMessageConfig).transitionName }
      : undefined,
    renderNotifications: (node, { key }) => (
      <TaoPortalScope>
        <div
          data-tao-app-notices={kind}
          data-tao-placement={key}
          dir={
            config.rtl === undefined ? undefined : config.rtl ? 'rtl' : 'ltr'
          }
          style={{
            ...tokenStyle,
            top: String(key).startsWith('top') ? (config.top ?? 24) : undefined,
            bottom: String(key).startsWith('bottom')
              ? (notificationConfig.bottom ?? 24)
              : undefined,
          }}
        >
          {node}
        </div>
      </TaoPortalScope>
    ),
  } satisfies NotificationConfig);
  return [api, holder] as const;
}

type Life = { onClose?: () => void; resolve: (() => void)[] };

export function useAppMessages(config: AppMessageConfig = {}) {
  const [notices, holder] = useNoticeHolder('message', config);
  const active = useRef(new Map<Key, Life>());
  const sequence = useRef(0);
  const latest = useRef(config);
  latest.current = config;
  useEffect(
    () => () => {
      for (const life of active.current.values())
        for (const resolve of life.resolve) resolve();
      active.current.clear();
    },
    [],
  );
  const api = useMemo<AppMessageInstance>(() => {
    const finish = (key: Key) => {
      const life = active.current.get(key);
      if (!life) return;
      active.current.delete(key);
      life.onClose?.();
      for (const resolve of life.resolve) resolve();
    };
    const close = (key: Key) => {
      notices.close(key);
      finish(key);
    };
    const open = (args: AppMessageArgs): AppMessageType => {
      const defaults = latest.current;
      const key = args.key ?? `tao-app-message-${sequence.current++}`;
      const resolvers = active.current.get(key)?.resolve ?? [];
      const promise = new Promise<boolean>((resolve) =>
        resolvers.push(() => resolve(true)),
      );
      active.current.set(key, { onClose: args.onClose, resolve: resolvers });
      if (defaults.maxCount && active.current.size > defaults.maxCount)
        close(active.current.keys().next().value as Key);
      const merged = { ...defaults, ...args };
      notices.open({
        ...args,
        key,
        title: args.content,
        duration: args.duration ?? defaults.duration ?? 3,
        pauseOnHover: args.pauseOnHover ?? defaults.pauseOnHover ?? true,
        role: 'status',
        closable: false,
        placement: 'top',
        icon: iconFor(args.type, args.icon),
        classNames: noticeClasses(
          resolveAppSemantic(defaults.classNames, merged),
          resolveAppSemantic(args.classNames, merged),
        ),
        styles: noticeStyles(
          resolveAppSemantic(defaults.styles, merged),
          resolveAppSemantic(args.styles, merged),
        ),
        onClose: () => finish(key),
      });
      return Object.assign(() => close(key), {
        // biome-ignore lint/suspicious/noThenProperty: Ant Design message instances are intentionally callable thenables.
        then: promise.then.bind(promise),
      });
    };
    const typed =
      (type: AppNoticeType): AppMessageInstance['info'] =>
      (content, duration, onClose) => {
        const args =
          content && typeof content === 'object' && 'content' in content
            ? content
            : { content };
        return open({
          ...args,
          type,
          ...(typeof duration === 'number' ? { duration } : {}),
          ...(typeof duration === 'function'
            ? { onClose: duration }
            : onClose
              ? { onClose }
              : {}),
        });
      };
    return {
      open,
      info: typed('info'),
      success: typed('success'),
      warning: typed('warning'),
      error: typed('error'),
      loading: typed('loading'),
      destroy: (key) => {
        if (key !== undefined) close(key);
        else for (const current of [...active.current.keys()]) close(current);
      },
    };
  }, [notices]);
  return [api, holder] as const;
}

export function useAppNotifications(config: AppNotificationConfig = {}) {
  const { locale } = useTaoConfig();
  const closeLabel = useRef(locale.close);
  closeLabel.current = locale.close;
  const [notices, holder] = useNoticeHolder('notification', config);
  const latest = useRef(config);
  latest.current = config;
  const api = useMemo<AppNotificationInstance>(() => {
    const open = (args: AppNotificationArgs) => {
      const defaults = latest.current;
      const merged = { ...defaults, ...args };
      const closeIcon =
        args.closeIcon === undefined
          ? defaults.closeIcon === undefined
            ? '×'
            : defaults.closeIcon
          : args.closeIcon;
      const closable: NotificationProps['closable'] =
        args.closable === false ||
        args.closable === null ||
        closeIcon === false ||
        closeIcon === null
          ? false
          : {
              closeIcon,
              'aria-label': closeLabel.current,
              ...(typeof args.closable === 'object' ? args.closable : {}),
            };
      const classNames = noticeClasses(
        resolveAppSemantic(defaults.classNames, merged),
        resolveAppSemantic(args.classNames, merged),
      );
      const styles = noticeStyles(
        resolveAppSemantic(defaults.styles, merged),
        resolveAppSemantic(args.styles, merged),
      );
      const disabledClose = typeof closable === 'object' && closable?.disabled;
      const title = args.title ?? args.message;
      notices.open({
        ...args,
        title: disabledClose ? (
          <>
            {title}
            <button
              type="button"
              disabled
              aria-label={closable['aria-label'] ?? closeLabel.current}
              className={classNames.close}
              style={styles.close}
            >
              {closable.closeIcon}
            </button>
          </>
        ) : (
          title
        ),
        actions: args.actions ?? args.btn,
        placement: args.placement ?? defaults.placement ?? 'topRight',
        duration: args.duration ?? defaults.duration ?? 4.5,
        pauseOnHover: args.pauseOnHover ?? defaults.pauseOnHover ?? true,
        showProgress: args.showProgress ?? defaults.showProgress,
        role: args.role ?? 'alert',
        icon: iconFor(args.type, args.icon),
        classNames,
        styles,
        closable: disabledClose ? false : closable,
      });
    };
    return {
      open,
      success: (args) => open({ ...args, type: 'success' }),
      info: (args) => open({ ...args, type: 'info' }),
      error: (args) => open({ ...args, type: 'error' }),
      warning: (args) => open({ ...args, type: 'warning' }),
      destroy: (key) =>
        key === undefined ? notices.destroy() : notices.close(key),
    };
  }, [notices]);
  return [api, holder] as const;
}
