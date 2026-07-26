import * as Dialog from '@radix-ui/react-dialog';
import {
  type CSSProperties,
  type FC,
  type ReactNode,
  useEffect,
  useRef,
} from 'react';
import { TaoPortalScope } from '../../provider/tao-provider';
import { preventParentOutsideDismiss } from '../../utils/portal';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Button, type ButtonProps } from '../button/button';
import './modal.css';

export type ModalSemanticPart =
  | 'root'
  | 'overlay'
  | 'header'
  | 'title'
  | 'body'
  | 'footer'
  | 'close';

/** Render-prop form of `footer`: receives the default node and the two default button components. */
export type ModalFooterRender = (
  originNode: ReactNode,
  extra: { OkBtn: FC; CancelBtn: FC },
) => ReactNode;

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  /**
   * Footer content.
   * - `undefined` renders default OK/Cancel buttons
   * - `null` renders no footer
   * - a function receives `(originNode, { OkBtn, CancelBtn })` to compose around the defaults
   */
  footer?: ReactNode | ModalFooterRender | null;
  onOk?: () => void;
  okText?: ReactNode;
  cancelText?: ReactNode;
  confirmLoading?: boolean;
  /** Extra props forwarded to the default OK button. */
  okButtonProps?: ButtonProps;
  /** Extra props forwarded to the default Cancel button. */
  cancelButtonProps?: ButtonProps;
  width?: number | string;
  /** Vertically center the dialog. Defaults to true. */
  centered?: boolean;
  /** Show the close (×) button. Defaults to true. */
  closable?: boolean;
  /** Close when clicking the mask/overlay. Defaults to true. */
  maskClosable?: boolean;
  /** Close on Esc key. Defaults to true. */
  keyboard?: boolean;
  /** Called after the modal has fully closed (open transitions true → false). */
  afterClose?: () => void;
  /**
   * Unmount children when closed. Defaults to `true`.
   * Set `false` to keep children mounted and preserve their state across open/close.
   */
  destroyOnHidden?: boolean;
  children?: ReactNode;
  classNames?: SemanticClassNames<ModalSemanticPart>;
  styles?: SemanticStyles<ModalSemanticPart>;
}

export function Modal({
  open,
  onClose,
  title,
  footer,
  onOk,
  okText = 'OK',
  cancelText = 'Cancel',
  confirmLoading,
  okButtonProps,
  cancelButtonProps,
  width = 520,
  centered = true,
  closable = true,
  maskClosable = true,
  keyboard = true,
  afterClose,
  destroyOnHidden = true,
  children,
  classNames,
  styles: stylesProp,
}: ModalProps) {
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current && !open) afterClose?.();
    prevOpen.current = open;
  }, [open, afterClose]);

  const contentStyle: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    ...stylesProp?.root,
  };

  const CancelBtn: FC = () => (
    <Button variant="secondary" onClick={onClose} {...cancelButtonProps}>
      {cancelText}
    </Button>
  );
  const OkBtn: FC = () => (
    <Button
      variant="primary"
      loading={confirmLoading}
      onClick={onOk}
      {...okButtonProps}
    >
      {okText}
    </Button>
  );

  const defaultFooter = (
    <>
      <CancelBtn />
      <OkBtn />
    </>
  );

  let footerContent: ReactNode;
  if (footer === undefined) {
    footerContent = defaultFooter;
  } else if (typeof footer === 'function') {
    footerContent = footer(defaultFooter, { OkBtn, CancelBtn });
  } else {
    footerContent = footer;
  }

  // Keep-alive: when destroyOnHidden is false we force-mount the portal subtree so
  // children retain their state, and rely on CSS (data-state="closed") to hide it.
  const keepAlive = !destroyOnHidden;
  const forceMount = keepAlive ? true : undefined;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose?.();
      }}
    >
      <Dialog.Portal forceMount={forceMount}>
        <TaoPortalScope>
          <Dialog.Overlay
            forceMount={forceMount}
            data-tao-modal-overlay=""
            className={cx(classNames?.overlay)}
            style={stylesProp?.overlay}
            onClick={maskClosable ? onClose : undefined}
          />
          <div
            data-tao-modal-wrap=""
            data-tao-centered={centered ? '' : undefined}
            data-tao-open={open ? '' : undefined}
          >
            <Dialog.Content
              forceMount={forceMount}
              data-tao-modal=""
              style={contentStyle}
              className={cx(classNames?.root)}
              aria-describedby={undefined}
              onEscapeKeyDown={(e) => {
                if (!keyboard) e.preventDefault();
              }}
              onPointerDownOutside={preventParentOutsideDismiss}
              onInteractOutside={preventParentOutsideDismiss}
            >
              {(title != null || closable) && (
                <div
                  data-tao-modal-header=""
                  className={cx(classNames?.header)}
                  style={stylesProp?.header}
                >
                  {title != null ? (
                    <Dialog.Title
                      data-tao-modal-title=""
                      className={cx(classNames?.title)}
                      style={stylesProp?.title}
                    >
                      {title}
                    </Dialog.Title>
                  ) : (
                    <Dialog.Title
                      data-tao-modal-title=""
                      style={{ display: 'none' }}
                    />
                  )}
                  {closable && (
                    <button
                      type="button"
                      data-tao-modal-close=""
                      className={cx(classNames?.close)}
                      style={stylesProp?.close}
                      onClick={onClose}
                      aria-label="Close"
                    >
                      <CloseIcon />
                    </button>
                  )}
                </div>
              )}
              <div
                data-tao-modal-body=""
                className={cx(classNames?.body)}
                style={stylesProp?.body}
              >
                {children}
              </div>
              {footerContent != null && (
                <div
                  data-tao-modal-footer=""
                  className={cx(classNames?.footer)}
                  style={stylesProp?.footer}
                >
                  {footerContent}
                </div>
              )}
            </Dialog.Content>
          </div>
        </TaoPortalScope>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
