import * as Dialog from '@radix-ui/react-dialog';
import type { CSSProperties, ReactNode } from 'react';
import { cx, type SemanticClassNames, type SemanticStyles } from '../../utils/semantic';
import './drawer.css';

export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left';
export type DrawerSemanticPart = 'root' | 'header' | 'title' | 'body' | 'overlay';

export interface DrawerProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  placement?: DrawerPlacement;
  width?: number | string;
  height?: number | string;
  children?: ReactNode;
  classNames?: SemanticClassNames<DrawerSemanticPart>;
  styles?: SemanticStyles<DrawerSemanticPart>;
}

export function Drawer({
  open,
  onClose,
  title,
  placement = 'right',
  width,
  height,
  children,
  classNames,
  styles: stylesProp,
}: DrawerProps) {
  const isHorizontal = placement === 'left' || placement === 'right';

  const contentStyle: CSSProperties = {};
  if (isHorizontal && width != null) {
    contentStyle.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (!isHorizontal && height != null) {
    contentStyle.height = typeof height === 'number' ? `${height}px` : height;
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose?.(); }}>
      <Dialog.Portal>
        <Dialog.Overlay data-tao-drawer-overlay="" className={cx(classNames?.overlay)} style={stylesProp?.overlay} />
        <Dialog.Content
          data-tao-drawer=""
          data-tao-placement={placement}
          style={{ ...contentStyle, ...stylesProp?.root }}
          className={cx(classNames?.root)}
          aria-describedby={undefined}
        >
          {(title != null || onClose != null) && (
            <div data-tao-drawer-header="" className={cx(classNames?.header)} style={stylesProp?.header}>
              {title != null && (
                <Dialog.Title data-tao-drawer-title="" className={cx(classNames?.title)} style={stylesProp?.title}>{title}</Dialog.Title>
              )}
              {onClose != null && (
                <button
                  type="button"
                  data-tao-drawer-close=""
                  onClick={onClose}
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          )}
          <div data-tao-drawer-body="" className={cx(classNames?.body)} style={stylesProp?.body}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
