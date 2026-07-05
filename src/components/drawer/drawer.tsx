import * as Dialog from '@radix-ui/react-dialog';
import {
  type CSSProperties,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { TaoPortalScope } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './drawer.css';

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

export interface DrawerProps {
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
   * Set `false` to keep children mounted and preserve their state across open/close.
   */
  destroyOnHidden?: boolean;
  children?: ReactNode;
  classNames?: SemanticClassNames<DrawerSemanticPart>;
  styles?: SemanticStyles<DrawerSemanticPart>;
}

export function Drawer({
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
}: DrawerProps) {
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current !== open) {
      afterOpenChange?.(open);
      if (!open) afterClose?.();
      prevOpen.current = open;
    }
  }, [open, afterOpenChange, afterClose]);

  const isHorizontal = placement === 'left' || placement === 'right';
  const sizePx = size ? SIZE_PRESET[size] : undefined;

  // Resizing: once the user drags, this px size overrides the prop-derived size.
  // Tagged with the axis it was measured on, so a stale width is ignored after the
  // placement (and thus axis) changes.
  const resizeCfg = typeof resizable === 'object' ? resizable : undefined;
  const isResizable = !!resizable;
  const contentRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startPos: number; startSize: number } | null>(null);
  const [drag, setDrag] = useState<{
    horizontal: boolean;
    size: number;
  } | null>(null);
  const dragSize = drag && drag.horizontal === isHorizontal ? drag.size : null;

  const onDraggerPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = contentRef.current;
    if (!el) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      startPos: isHorizontal ? e.clientX : e.clientY,
      startSize: isHorizontal ? rect.width : rect.height,
    };
    resizeCfg?.onResizeStart?.();
  };

  const onDraggerPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const dragStart = dragRef.current;
    if (!dragStart) return;
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

  const onDraggerPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    resizeCfg?.onResizeEnd?.();
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

  const showHeader = title != null || extra != null || closable;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose?.();
      }}
    >
      <Dialog.Portal forceMount={forceMount}>
        <TaoPortalScope>
          {mask && (
            <Dialog.Overlay
              forceMount={forceMount}
              data-tao-drawer-overlay=""
              className={cx(classNames?.overlay)}
              style={stylesProp?.overlay}
            />
          )}
          <Dialog.Content
            ref={contentRef}
            forceMount={forceMount}
            data-tao-drawer=""
            data-tao-placement={placement}
            style={contentStyle}
            className={cx(classNames?.root)}
            aria-describedby={undefined}
            onEscapeKeyDown={(e) => {
              if (!keyboard) e.preventDefault();
            }}
            onPointerDownOutside={(e) => {
              if (!maskClosable) e.preventDefault();
            }}
            onInteractOutside={(e) => {
              if (!maskClosable) e.preventDefault();
            }}
          >
            {isResizable && (
              <div
                data-tao-drawer-dragger=""
                data-tao-placement={placement}
                className={cx(classNames?.dragger)}
                style={stylesProp?.dragger}
                onPointerDown={onDraggerPointerDown}
                onPointerMove={onDraggerPointerMove}
                onPointerUp={onDraggerPointerUp}
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
                  {closable && (
                    <button
                      type="button"
                      data-tao-drawer-close=""
                      className={cx(classNames?.close)}
                      style={stylesProp?.close}
                      onClick={onClose}
                      aria-label="Close"
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
          </Dialog.Content>
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
