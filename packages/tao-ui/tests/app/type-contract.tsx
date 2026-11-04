import { createRef } from 'react';
import {
  App,
  type AppMessageType,
  type AppModalResult,
  type AppProps,
} from '../../src/components/app/app';

const props: AppProps = {
  component: 'main',
  message: {
    duration: 3,
    stack: { threshold: 4 },
    styles: ({ props: config }) => ({
      title: { color: config.type === 'error' ? 'red' : 'inherit' },
    }),
  },
  notification: {
    placement: 'bottomRight',
    showProgress: true,
    duration: false,
  },
  classNames: { root: 'application' },
};
<App {...props} ref={createRef<HTMLElement>()} />;

function Consumer() {
  const { message, notification, modal } = App.useApp();
  const close: AppMessageType = message.loading({
    key: 'download',
    content: 'Downloading',
    duration: 0,
  });
  close.then((closed: boolean) => closed);
  close();
  notification.open({
    title: 'Ready',
    message: 'Legacy',
    actions: <button type="button">View</button>,
    closable: { disabled: true, 'aria-label': 'Dismiss update' },
    props: { 'data-testid': 'update' },
    role: 'status',
    classNames: ({ props: config }) => ({ root: config.type }),
  });
  const result: AppModalResult = modal.confirm({
    title: 'Confirm',
    onOk: (finish) => finish(),
    getContainer: false,
    focusable: { trap: false, autoFocusButton: 'cancel' },
    footer: (_, { OkBtn }) => <OkBtn />,
    classNames: { container: 'content' },
  });
  result.update((previous) => ({ ...previous, title: 'Updated' }));
  result.then((confirmed: boolean) => confirmed);
  result.destroy();
  return null;
}
void Consumer;

// @ts-expect-error Unknown placements must be rejected.
<App notification={{ placement: 'center' }} />;
// @ts-expect-error App root semantic keys are explicit.
<App styles={{ content: { color: 'red' } }} />;
