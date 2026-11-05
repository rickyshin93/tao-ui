import * as Dialog from '@radix-ui/react-dialog';
import {
  FocusScope,
  FocusScopeBranchProvider,
  type FocusScopeBranchRegistry,
  useFocusScopeBranchRegistry,
} from '@radix-ui/react-focus-scope';
import {
  type AriaAttributes,
  type CSSProperties,
  type FC,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import { TaoPortalScope, TaoProvider } from '../../provider/tao-provider';
import {
  resolveResponsiveValue,
  type TaoBreakpointMap,
  useBreakpoint,
} from '../../utils/breakpoint';
import { DialogContent } from '../../utils/dialog-content';
import { preventParentOutsideDismiss } from '../../utils/portal';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Button, type ButtonProps } from '../button/button';
import { useWatermarkPanelRef } from '../watermark/watermark-context';
import './modal.css';

// The provider returns its child unchanged or a context provider element.
// Narrowing our single-element input avoids its React 19 ReactNode return type in React 18 consumers.
const ModalBranchProvider = FocusScopeBranchProvider as (props: {
  registry: FocusScopeBranchRegistry | undefined;
  children: ReactElement;
}) => ReactElement;

export type ModalSemanticPart =
  | 'root'
  | 'container'
  | 'wrapper'
  | 'mask'
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

export interface ModalProps
  extends Pick<
    AriaAttributes,
    'aria-label' | 'aria-labelledby' | 'aria-describedby'
  > {
  direction?: 'ltr' | 'rtl';
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
  /**
   * Dialog width. Accepts a breakpoint map, e.g.
   * `width={{ xs: '100%', md: 640 }}` — the largest matching breakpoint wins,
   * falling back to the 520px default when no entry matches.
   */
  width?: number | string | TaoBreakpointMap<number | string>;
  /** Vertically center the dialog. Defaults to true. */
  centered?: boolean;
  /** Show the close (×) button. Defaults to true. */
  closable?:
    | boolean
    | (AriaAttributes & {
        disabled?: boolean;
        closeIcon?: ReactNode;
        onClose?: () => void;
        afterClose?: () => void;
      });
  /** Close when clicking the mask/overlay. Defaults to true. */
  maskClosable?: boolean;
  /** Close on Esc key. Defaults to true. */
  keyboard?: boolean;
  /** Portal destination. `false` renders the dialog in place. */
  getContainer?: string | HTMLElement | (() => HTMLElement) | false;
  mask?: boolean | { enabled?: boolean; closable?: boolean; blur?: boolean };
  zIndex?: number;
  scrollLock?: boolean;
  closeIcon?: ReactNode;
  modalRender?: (node: ReactNode) => ReactNode;
  wrapProps?: HTMLAttributes<HTMLDivElement>;
  transitionName?: string;
  maskTransitionName?: string;
  focusTriggerAfterClose?: boolean;
  autoFocusButton?: 'ok' | 'cancel' | null;
  focusable?: {
    trap?: boolean;
    focusTriggerAfterClose?: boolean;
    autoFocusButton?: 'ok' | 'cancel' | null;
  };
  /** Called after the modal has fully closed (open transitions true → false). */
  afterClose?: () => void;
  /**
   * Unmount children when closed. Defaults to `true`.
   * Set `false` to keep children mounted while releasing modal interaction locks when hidden.
   */
  destroyOnHidden?: boolean;
  children?: ReactNode;
  classNames?: SemanticClassNames<ModalSemanticPart>;
  styles?: SemanticStyles<ModalSemanticPart>;
}

export function Modal({
  direction,
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
  getContainer,
  mask = true,
  zIndex,
  scrollLock = true,
  closeIcon,
  modalRender,
  wrapProps,
  transitionName,
  maskTransitionName,
  focusTriggerAfterClose,
  autoFocusButton,
  focusable,
  afterClose,
  destroyOnHidden = true,
  children,
  classNames,
  styles: stylesProp,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: ModalProps) {
  const watermarkRef = useWatermarkPanelRef();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { nodes: focusBranches, registry: focusRegistry } =
    useFocusScopeBranchRegistry();
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const setContentRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      watermarkRef(node);
    },
    [watermarkRef],
  );
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current && !open) {
      afterClose?.();
      if (typeof closable === 'object') closable.afterClose?.();
    }
    prevOpen.current = open;
  }, [open, afterClose, closable]);

  const screens = useBreakpoint();
  const resolvedWidth = resolveResponsiveValue(width, screens) ?? 520;

  const contentStyle: CSSProperties = {
    pointerEvents: 'auto',
    width:
      typeof resolvedWidth === 'number' ? `${resolvedWidth}px` : resolvedWidth,
    ...stylesProp?.root,
    ...stylesProp?.container,
  };

  const CancelBtn: FC = () => (
    <Button
      variant="secondary"
      onClick={onClose}
      data-tao-modal-action="cancel"
      {...cancelButtonProps}
    >
      {cancelText}
    </Button>
  );
  const OkBtn: FC = () => (
    <Button
      variant="primary"
      loading={confirmLoading}
      onClick={onOk}
      data-tao-modal-action="ok"
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
  // the content host can retain child state while Radix releases its modal effects.
  const keepAlive = !destroyOnHidden;
  const forceMount = keepAlive ? true : undefined;

  const closeOnMask =
    typeof mask === 'object' ? (mask.closable ?? maskClosable) : maskClosable;
  const showMask = typeof mask === 'object' ? mask.enabled !== false : mask;
  const closeConfig = typeof closable === 'object' ? closable : undefined;
  const mergedCloseIcon =
    closeConfig?.closeIcon !== undefined ? closeConfig.closeIcon : closeIcon;
  const showClose =
    closable && mergedCloseIcon !== null && mergedCloseIcon !== false;
  const trapFocus = focusable?.trap ?? true;
  const customInteraction = !scrollLock || !trapFocus;
  const openAutoFocus = (event: Event) => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const button =
      focusable?.autoFocusButton !== undefined
        ? focusable.autoFocusButton
        : autoFocusButton;
    if (button === null) event.preventDefault();
    else if (button) {
      event.preventDefault();
      contentRef.current
        ?.querySelector<HTMLElement>(`[data-tao-modal-action="${button}"]`)
        ?.focus();
    }
  };
  const closeAutoFocus = (event: Event) => {
    const restore = focusable?.focusTriggerAfterClose ?? focusTriggerAfterClose;
    if (restore !== undefined) event.preventDefault();
    if (restore) restoreFocusRef.current?.focus();
  };
  const contents = (
    <>
      {(title != null || showClose) && (
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
            <Dialog.Title data-tao-modal-title="" style={{ display: 'none' }} />
          )}
          {showClose && (
            <button
              type="button"
              data-tao-modal-close=""
              className={cx(classNames?.close)}
              style={stylesProp?.close}
              onClick={() => {
                closeConfig?.onClose?.();
                onClose?.();
              }}
              disabled={closeConfig?.disabled}
              aria-label={closeConfig?.['aria-label'] ?? 'Close'}
            >
              {mergedCloseIcon ?? <CloseIcon />}
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
    </>
  );
  const content = (
    <DialogContent
      contentRef={setContentRef}
      open={open}
      keepAlive={keepAlive}
      forceMount={forceMount}
      data-tao-modal=""
      style={contentStyle}
      className={cx(classNames?.root, classNames?.container, transitionName)}
      aria-modal={true}
      aria-label={ariaLabel}
      {...(ariaLabel || ariaLabelledBy
        ? { 'aria-labelledby': ariaLabelledBy }
        : {})}
      aria-describedby={ariaDescribedBy}
      onOpenAutoFocus={
        customInteraction ? (event) => event.preventDefault() : openAutoFocus
      }
      onCloseAutoFocus={
        customInteraction ? (event) => event.preventDefault() : closeAutoFocus
      }
      onEscapeKeyDown={(event) => {
        if (!keyboard) event.preventDefault();
      }}
      onPointerDownOutside={preventParentOutsideDismiss}
      onInteractOutside={preventParentOutsideDismiss}
    >
      {customInteraction ? (
        <ModalBranchProvider registry={focusRegistry}>
          {contents}
        </ModalBranchProvider>
      ) : (
        contents
      )}
    </DialogContent>
  );
  const layer = (
    <TaoPortalScope>
      {!customInteraction && (!keepAlive || open) && (
        <Dialog.Overlay
          forceMount={forceMount}
          data-tao-modal-overlay=""
          className={cx(
            classNames?.overlay,
            classNames?.mask,
            maskTransitionName,
          )}
          style={{
            zIndex,
            ...(!showMask
              ? {
                  background: 'transparent',
                  backdropFilter: 'none',
                  pointerEvents: 'none' as const,
                }
              : {}),
            ...(typeof mask === 'object' && mask.blur === false
              ? { backdropFilter: 'none' }
              : {}),
            ...stylesProp?.overlay,
            ...stylesProp?.mask,
          }}
          onClick={closeOnMask ? onClose : undefined}
        />
      )}
      {customInteraction && showMask && open && (
        <div
          data-tao-modal-overlay=""
          role="presentation"
          className={cx(
            classNames?.overlay,
            classNames?.mask,
            maskTransitionName,
          )}
          style={{
            zIndex,
            ...(typeof mask === 'object' && mask.blur === false
              ? { backdropFilter: 'none' }
              : {}),
            ...stylesProp?.overlay,
            ...stylesProp?.mask,
          }}
          onPointerDown={closeOnMask ? onClose : undefined}
        />
      )}
      <div
        {...wrapProps}
        role="presentation"
        data-tao-modal-wrap=""
        data-tao-centered={centered ? '' : undefined}
        data-tao-open={open ? '' : undefined}
        className={cx(classNames?.wrapper, wrapProps?.className)}
        style={{
          pointerEvents: 'none',
          zIndex: zIndex === undefined ? undefined : zIndex + 1,
          ...stylesProp?.wrapper,
          ...wrapProps?.style,
        }}
      >
        {customInteraction ? (
          <ModalInteractionScope
            open={open}
            scrollLock={scrollLock}
            trapFocus={trapFocus}
            branches={focusBranches}
            onOpenAutoFocus={openAutoFocus}
            onCloseAutoFocus={closeAutoFocus}
          >
            {modalRender ? modalRender(content) : content}
          </ModalInteractionScope>
        ) : modalRender ? (
          modalRender(content)
        ) : (
          content
        )}
      </div>
    </TaoPortalScope>
  );
  let container: HTMLElement | undefined;
  if (getContainer && typeof document !== 'undefined') {
    container =
      typeof getContainer === 'string'
        ? (document.querySelector<HTMLElement>(getContainer) ?? undefined)
        : typeof getContainer === 'function'
          ? getContainer()
          : getContainer;
    if (!container)
      throw new Error(
        `Modal getContainer did not resolve an element: ${getContainer}`,
      );
  }
  return (
    <TaoProvider direction={direction}>
      <Dialog.Root
        open={open}
        modal={!customInteraction}
        onOpenChange={(value) => {
          if (!value) onClose?.();
        }}
      >
        {getContainer === false ? (
          layer
        ) : (
          <Dialog.Portal forceMount={forceMount} container={container}>
            {layer}
          </Dialog.Portal>
        )}
      </Dialog.Root>
    </TaoProvider>
  );
}

function ModalInteractionScope({
  open,
  scrollLock,
  trapFocus,
  branches,
  onOpenAutoFocus,
  onCloseAutoFocus,
  children,
}: {
  open: boolean;
  scrollLock: boolean;
  trapFocus: boolean;
  branches: HTMLElement[];
  onOpenAutoFocus: (event: Event) => void;
  onCloseAutoFocus: (event: Event) => void;
  children: ReactNode;
}) {
  return (
    <RemoveScroll
      enabled={open && scrollLock}
      allowPinchZoom
      shards={branches}
      forwardProps
    >
      <FocusScope
        loop={trapFocus}
        trapped={open && trapFocus}
        branches={branches}
        onMountAutoFocus={onOpenAutoFocus}
        onUnmountAutoFocus={onCloseAutoFocus}
        style={{ display: 'contents' }}
      >
        {children}
      </FocusScope>
    </RemoveScroll>
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
