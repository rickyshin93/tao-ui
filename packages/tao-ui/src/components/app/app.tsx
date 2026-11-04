import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useMemo,
} from 'react';
import { cx } from '../../utils/semantic';
import { useAppModals } from './app-modals';
import { useAppMessages, useAppNotifications } from './app-notices';
import type { AppConfig, AppInstance, AppProps } from './app-types';
import './app.css';

export type * from './app-types';

const AppContext = createContext<AppInstance | null>(null);
const AppConfigContext = createContext<AppConfig>({});

const AppRoot = forwardRef<HTMLElement, AppProps>(function App(
  {
    message,
    notification,
    component = 'div',
    children,
    prefixCls,
    className,
    rootClassName,
    style,
    classNames,
    styles,
  },
  ref,
) {
  const parent = useContext(AppConfigContext);
  const config = useMemo(
    () => ({
      message: { ...parent.message, ...message },
      notification: { ...parent.notification, ...notification },
    }),
    [parent, message, notification],
  );
  const [messageApi, messageHolder] = useAppMessages(config.message);
  const [notificationApi, notificationHolder] = useAppNotifications(
    config.notification,
  );
  const [modal, modalHolder] = useAppModals();
  const value = useMemo(
    () => ({ message: messageApi, notification: notificationApi, modal }),
    [messageApi, notificationApi, modal],
  );
  const content = (
    <>
      {modalHolder}
      {messageHolder}
      {notificationHolder}
      {children}
    </>
  );
  return (
    <AppContext.Provider value={value}>
      <AppConfigContext.Provider value={config}>
        {component === false
          ? content
          : createElement(
              component,
              {
                ref,
                'data-tao-app': '',
                className: cx(
                  prefixCls,
                  classNames?.root,
                  className,
                  rootClassName,
                ),
                style: { ...styles?.root, ...style },
              },
              content,
            )}
      </AppConfigContext.Provider>
    </AppContext.Provider>
  );
});

function useApp(): AppInstance {
  const api = useContext(AppContext);
  if (!api)
    throw new Error('App.useApp() must be called below an <App> provider.');
  return api;
}

export const App = Object.assign(AppRoot, { useApp });
