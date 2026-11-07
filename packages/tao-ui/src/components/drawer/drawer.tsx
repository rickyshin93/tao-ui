import * as Dialog from '@radix-ui/react-dialog';
import {
  type AriaAttributes,
  type CSSProperties,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  TaoPortalScope,
  TaoProvider,
  useTaoConfig,
} from '../../provider/tao-provider';
import { DialogContent } from '../../utils/dialog-content';
import { preventParentOutsideDismiss } from '../../utils/portal';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './drawer.css';
import { useWatermarkPanelRef } from '../watermark/watermark-context';

export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left';
export type DrawerSize = 'default' | 'large';
export type DrawerSemanticPart =
  | 'root'
  | 'overlay'
  | 'header'
  | 'title'
  | 'extra'
  | 'body'
  | 'footer'
  | 'close'
  | 'dragger';

export interface DrawerResizableConfig {
  onResize?: (size: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

const SIZE_PRESET: Record<DrawerSize, number> = { default: 378, large: 736 };
/** Minimum drawer size (px) while resizing. */
const MIN_DRAG_SIZE = 200;

export interface DrawerProps
  extends Pick<
    AriaAttributes,
    'aria-label' | 'aria-labelledby' | 'aria-describedby'
  > {
  direction?: 'ltr' | 'rtl';
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  /** Extra content rendered on the trailing side of the header. */
  extra?: ReactNode;
  /** Footer content; renders a bordered footer area when provided. */
  footer?: ReactNode;
  placement?: DrawerPlacement;
  /** Preset drawer size: `default` (378) / `large` (736). `width`/`height` override it. */
  size?: DrawerSize;
  width?: number | string;
  height?: number | string;
  /** Show the close (×) button. Defaults to true. */
  closable?: boolean;
  /** Custom close icon. */
  closeIcon?: ReactNode;
  /** Close when clicking the mask. Defaults to true. */
  maskClosable?: boolean;
  /** Render the mask/overlay. Defaults to true. */
  mask?: boolean;
  /** Close on Esc key. Defaults to true. */
  keyboard?: boolean;
  /** Allow resizing by dragging the inner edge. Pass an object for resize callbacks. */
  resizable?: boolean | DrawerResizableConfig;
  /** Called after open transitions in either direction. */
  afterOpenChange?: (open: boolean) => void;
  /** Called after the drawer has fully closed. */
  afterClose?: () => void;
  /**
   * Unmount children when closed. Defaults to `true`.
   * Set `false` to keep children mounted while releasing modal interaction locks when hidden.
   */
  destroyOnHidden?: boolean;
  children?: ReactNode;
  classNames?: SemanticClassNames<DrawerSemanticPart>;
  styles?: SemanticStyles<DrawerSemanticPart>;
}

export function Drawer({
  direction,
  open,
  onClose,
  title,
  extra,
  footer,
  placement = 'right',
  size,
  width,
  height,
  closable = true,
  closeIcon,
  maskClosable = true,
  mask = true,
  keyboard = true,
  resizable,
  afterOpenChange,
  afterClose,
  destroyOnHidden = true,
  children,
  classNames,
  styles: stylesProp,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: DrawerProps) {
  const { locale } = useTaoConfig();
  const prevOpen = useRef(false);
  const restoreFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (prevOpen.current !== open) {
      prevOpen.current = open;
      afterOpenChange?.(open);
      if (!open) afterClose?.();
    }
  }, [open, afterOpenChange, afterClose]);

  const isHorizontal = placement === 'left' || placement === 'right';
  const sizePx = size ? SIZE_PRESET[size] : undefined;

  // Resizing: once the user drags, this px size overrides the prop-derived size.
  // Tagged with the axis it was measured on, so a stale width is ignored after the
  // placement (and thus axis) changes.
  const resizeCfg = typeof resizable === 'object' ? resizable : undefined;
  const isResizable = !!resizable;
  const contentRef = useRef<HTMLDivElement | null>(null);
  const watermarkRef = useWatermarkPanelRef();
  const panelRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      watermarkRef(node);
    },
    [watermarkRef],
  );
  const dragRef = useRef<{
    pointerId: number;
    target: HTMLDivElement;
    placement: DrawerPlacement;
    startPos: number;
    startSize: number;
  } | null>(null);
  const resizeEnd = useRef(resizeCfg?.onResizeEnd);
  if (isResizable) resizeEnd.current = resizeCfg?.onResizeEnd;
  const endResize = useCallback((pointerId?: number) => {
    const drag = dragRef.current;
    if (!drag || (pointerId !== undefined && drag.pointerId !== pointerId))
      return;
    dragRef.current = null;
    if (drag.target.hasPointerCapture(drag.pointerId)) {
      drag.target.releasePointerCapture(drag.pointerId);
    }
    resizeEnd.current?.();
  }, []);
  useEffect(() => {
    const active = dragRef.current;
    if (active && (!open || !isResizable || active.placement !== placement))
      endResize();
  }, [open, isResizable, placement, endResize]);
  useEffect(() => () => endResize(), [endResize]);
  const [drag, setDrag] = useState<{
    horizontal: boolean;
    size: number;
  } | null>(null);
  const dragSize = drag && drag.horizontal === isHorizontal ? drag.size : null;

  const onDraggerPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = contentRef.current;
    if (!el || dragRef.current || e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      pointerId: e.pointerId,
      target: e.currentTarget,
      placement,
      startPos: isHorizontal ? e.clientX : e.clientY,
      startSize: isHorizontal ? rect.width : rect.height,
    };
    resizeCfg?.onResizeStart?.();
  };

  const onDraggerPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const dragStart = dragRef.current;
    if (!dragStart || dragStart.pointerId !== e.pointerId) return;
    const pos = isHorizontal ? e.clientX : e.clientY;
    let delta = pos - dragStart.startPos;
    // right/bottom are anchored at the far edge, so the handle moves opposite to growth.
    if (placement === 'right' || placement === 'bottom') delta = -delta;
    const max = isHorizontal ? window.innerWidth : window.innerHeight;
    const next = Math.max(
      MIN_DRAG_SIZE,
      Math.min(dragStart.startSize + delta, max),
    );
    setDrag({ horizontal: isHorizontal, size: next });
    resizeCfg?.onResize?.(next);
  };

  const onDraggerPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    endResize(e.pointerId);
  };

  const contentStyle: CSSProperties = { ...stylesProp?.root };
  if (isHorizontal) {
    const w = dragSize ?? width ?? sizePx;
    if (w != null) contentStyle.width = typeof w === 'number' ? `${w}px` : w;
  } else {
    const h = dragSize ?? height ?? sizePx;
    if (h != null) contentStyle.height = typeof h === 'number' ? `${h}px` : h;
  }

  const keepAlive = !destroyOnHidden;
  const forceMount = keepAlive ? true : undefined;

  const showClose = closable && closeIcon !== false;
  const showHeader = title != null || extra != null || showClose;

  return (
    <TaoProvider direction={direction}>
      <Dialog.Root
        open={open}
        onOpenChange={(v) => {
          if (!v) onClose?.();
        }}
      >
        <Dialog.Portal forceMount={forceMount}>
          <TaoPortalScope direction={direction}>
            {mask && (!keepAlive || open) && (
              <Dialog.Overlay
                forceMount={forceMount}
                data-tao-drawer-overlay=""
                className={cx(classNames?.overlay)}
                style={stylesProp?.overlay}
                onClick={maskClosable ? onClose : undefined}
              />
            )}
            <DialogContent
              open={open}
              keepAlive={keepAlive}
              contentRef={panelRef}
              forceMount={forceMount}
              data-tao-drawer=""
              data-tao-placement={placement}
              style={contentStyle}
              className={cx(classNames?.root)}
              aria-label={ariaLabel}
              {...(ariaLabel || ariaLabelledBy
                ? { 'aria-labelledby': ariaLabelledBy }
                : {})}
              aria-describedby={ariaDescribedBy}
              onOpenAutoFocus={() => {
                const ownerDocument = contentRef.current?.ownerDocument;
                const active = ownerDocument?.activeElement;
                restoreFocus.current =
                  active && active !== ownerDocument?.body
                    ? (active as HTMLElement)
                    : null;
              }}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                const target = restoreFocus.current;
                if (
                  target?.isConnected &&
                  (!prevOpen.current || !contentRef.current)
                )
                  target.focus();
              }}
              onEscapeKeyDown={(e) => {
                if (!keyboard) e.preventDefault();
              }}
              onPointerDownOutside={preventParentOutsideDismiss}
              onInteractOutside={preventParentOutsideDismiss}
            >
              {isResizable && (
                <div
                  data-tao-drawer-dragger=""
                  data-tao-placement={placement}
                  className={cx(classNames?.dragger)}
                  style={stylesProp?.dragger}
                  onPointerDown={onDraggerPointerDown}
                  onPointerMove={onDraggerPointerMove}
                  onPointerUp={onDraggerPointerEnd}
                  onPointerCancel={onDraggerPointerEnd}
                  onLostPointerCapture={onDraggerPointerEnd}
                />
              )}
              {showHeader && (
                <div
                  data-tao-drawer-header=""
                  className={cx(classNames?.header)}
                  style={stylesProp?.header}
                >
                  {title != null ? (
                    <Dialog.Title
                      data-tao-drawer-title=""
                      className={cx(classNames?.title)}
                      style={stylesProp?.title}
                    >
                      {title}
                    </Dialog.Title>
                  ) : (
                    <Dialog.Title
                      data-tao-drawer-title=""
                      style={{ display: 'none' }}
                    />
                  )}
                  <div data-tao-drawer-actions="">
                    {extra != null && (
                      <div
                        data-tao-drawer-extra=""
                        className={cx(classNames?.extra)}
                        style={stylesProp?.extra}
                      >
                        {extra}
                      </div>
                    )}
                    {showClose && (
                      <button
                        type="button"
                        data-tao-drawer-close=""
                        className={cx(classNames?.close)}
                        style={stylesProp?.close}
                        onClick={onClose}
                        aria-label={locale.close}
                      >
                        {closeIcon ?? <CloseIcon />}
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div
                data-tao-drawer-body=""
                className={cx(classNames?.body)}
                style={stylesProp?.body}
              >
                {children}
              </div>
              {footer != null && (
                <div
                  data-tao-drawer-footer=""
                  className={cx(classNames?.footer)}
                  style={stylesProp?.footer}
                >
                  {footer}
                </div>
              )}
            </DialogContent>
          </TaoPortalScope>
        </Dialog.Portal>
      </Dialog.Root>
    </TaoProvider>
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
