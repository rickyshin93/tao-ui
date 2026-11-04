import type { NotificationProps } from '@rc-component/notification';
import type {
  CSSProperties,
  ElementType,
  Key,
  MouseEvent,
  ReactNode,
} from 'react';
import type { SemanticClassNames, SemanticStyles } from '../../utils/semantic';
import type { ButtonProps } from '../button/button';
import type { ModalProps } from '../modal/modal';

export type AppSemanticPart = 'root';
export type AppMessageSemanticPart =
  | 'list'
  | 'listContent'
  | 'root'
  | 'wrapper'
  | 'icon'
  | 'title';
export type AppNotificationSemanticPart =
  | AppMessageSemanticPart
  | 'description'
  | 'actions'
  | 'section'
  | 'close'
  | 'progress';
type SemanticValue<T, P> = T | ((info: { props: P }) => T);
export type AppNoticeType =
  | 'info'
  | 'success'
  | 'error'
  | 'warning'
  | 'loading';
export type AppNotificationPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight';

export interface AppMessageArgs {
  content: ReactNode;
  duration?: number;
  type?: AppNoticeType;
  onClose?: () => void;
  icon?: ReactNode;
  key?: string | number;
  style?: CSSProperties;
  className?: string;
  classNames?: SemanticValue<
    SemanticClassNames<AppMessageSemanticPart>,
    AppMessageArgs
  >;
  styles?: SemanticValue<
    SemanticStyles<AppMessageSemanticPart>,
    AppMessageArgs
  >;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  pauseOnHover?: boolean;
}

export interface AppMessageConfig {
  top?: string | number;
  duration?: number;
  prefixCls?: string;
  getContainer?: () => HTMLElement;
  transitionName?: string;
  maxCount?: number;
  rtl?: boolean;
  stack?: boolean | { threshold?: number };
  pauseOnHover?: boolean;
  classNames?: AppMessageArgs['classNames'];
  styles?: AppMessageArgs['styles'];
}

export interface AppMessageType extends PromiseLike<boolean> {
  (): void;
}
export type AppMessageOpen = (
  content: ReactNode | AppMessageArgs,
  duration?: number | (() => void),
  onClose?: () => void,
) => AppMessageType;
export interface AppMessageInstance {
  info: AppMessageOpen;
  success: AppMessageOpen;
  error: AppMessageOpen;
  warning: AppMessageOpen;
  loading: AppMessageOpen;
  open: (args: AppMessageArgs) => AppMessageType;
  destroy: (key?: Key) => void;
}

export interface AppNotificationArgs {
  /** @deprecated Use title. */
  message?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** @deprecated Use actions. */
  btn?: ReactNode;
  actions?: ReactNode;
  key?: Key;
  onClose?: () => void;
  duration?: number | false;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  icon?: ReactNode;
  placement?: AppNotificationPlacement;
  style?: CSSProperties;
  className?: string;
  classNames?: SemanticValue<
    SemanticClassNames<AppNotificationSemanticPart>,
    AppNotificationArgs
  >;
  styles?: SemanticValue<
    SemanticStyles<AppNotificationSemanticPart>,
    AppNotificationArgs
  >;
  readonly type?: Exclude<AppNoticeType, 'loading'>;
  onClick?: () => void;
  closeIcon?: ReactNode;
  closable?: NotificationProps['closable'];
  props?: NotificationProps['props'];
  role?: 'alert' | 'status';
}

export interface AppNotificationConfig {
  top?: number;
  bottom?: number;
  prefixCls?: string;
  getContainer?: () => HTMLElement | ShadowRoot;
  placement?: AppNotificationPlacement;
  maxCount?: number;
  rtl?: boolean;
  stack?: boolean | { threshold?: number };
  duration?: number | false;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  closeIcon?: ReactNode;
  classNames?: AppNotificationArgs['classNames'];
  styles?: AppNotificationArgs['styles'];
}

export interface AppNotificationInstance {
  success: (args: AppNotificationArgs) => void;
  error: (args: AppNotificationArgs) => void;
  info: (args: AppNotificationArgs) => void;
  warning: (args: AppNotificationArgs) => void;
  open: (args: AppNotificationArgs) => void;
  destroy: (key?: Key) => void;
}

export interface AppModalConfig
  extends Omit<
    ModalProps,
    'open' | 'onOk' | 'onClose' | 'children' | 'width' | 'classNames' | 'styles'
  > {
  open?: boolean;
  content?: ReactNode;
  icon?: ReactNode;
  type?: 'info' | 'success' | 'error' | 'warn' | 'warning' | 'confirm';
  okCancel?: boolean;
  onOk?: (close: () => void) => unknown;
  onCancel?: (close: () => void) => unknown;
  width?: string | number;
  className?: string;
  rootClassName?: string;
  prefixCls?: string;
  style?: CSSProperties;
  wrapClassName?: string;
  okType?: ButtonProps['variant'] | 'default' | 'dashed' | 'link';
  bodyStyle?: CSSProperties;
  maskStyle?: CSSProperties;
  direction?: 'ltr' | 'rtl';
  classNames?: SemanticValue<
    NonNullable<ModalProps['classNames']>,
    AppModalConfig
  >;
  styles?: SemanticValue<NonNullable<ModalProps['styles']>, AppModalConfig>;
}

export interface AppModalResult extends PromiseLike<boolean> {
  destroy: () => void;
  update: (
    config:
      | Partial<AppModalConfig>
      | ((previous: AppModalConfig) => AppModalConfig),
  ) => void;
}
export type AppModalInstance = Record<
  'confirm' | 'info' | 'success' | 'error' | 'warning',
  (config: AppModalConfig) => AppModalResult
>;
export interface AppInstance {
  message: AppMessageInstance;
  notification: AppNotificationInstance;
  modal: AppModalInstance;
}
export type useAppProps = AppInstance;
export interface AppConfig {
  message?: AppMessageConfig;
  notification?: AppNotificationConfig;
}
export interface AppProps extends AppConfig {
  children?: ReactNode;
  component?: ElementType | false;
  prefixCls?: string;
  className?: string;
  rootClassName?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<AppSemanticPart>;
  styles?: SemanticStyles<AppSemanticPart>;
}
