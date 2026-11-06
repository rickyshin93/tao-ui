import * as RadixPopover from '@radix-ui/react-popover';
import {
  type AriaAttributes,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
} from 'react';
import { TaoPortalScope, useTaoDirection } from '../../provider/tao-provider';
import { asTriggerChild, useControlledOpen } from '../../utils/overlay';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './popover.css';

export type PopoverSemanticPart =
  | 'root'
  | 'container'
  | 'title'
  | 'content'
  | 'arrow';

export type PopoverTrigger = 'hover' | 'focus' | 'click' | 'contextMenu';

export type PopoverPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom';

type PopoverRender = ReactNode | (() => ReactNode);

export interface PopoverProps
  extends Pick<
    AriaAttributes,
    'aria-label' | 'aria-labelledby' | 'aria-describedby'
  > {
  direction?: 'ltr' | 'rtl';
  /** Header content of the popup. */
  title?: PopoverRender;
  /** Body content of the popup. */
  content?: PopoverRender;
  /** How the popup opens. Defaults to `'hover'`. */
  trigger?: PopoverTrigger | PopoverTrigger[];
  /** Popup position relative to the trigger. Defaults to `'top'`. */
  placement?: PopoverPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hover delay in seconds before opening. Defaults to `0.1`. */
  mouseEnterDelay?: number;
  /** Hover delay in seconds before closing. Defaults to `0.1`. */
  mouseLeaveDelay?: number;
  /** Show a pointing arrow on the popup. Defaults to `true`. */
  arrow?: boolean | { pointAtCenter?: boolean };
  /** Unmount the popup content while closed. Defaults to `false`. */
  destroyOnHidden?: boolean;
  /** @deprecated Use `destroyOnHidden` instead. */
  destroyTooltipOnHide?: boolean;
  /** Merged onto the popup root. */
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<PopoverSemanticPart>;
  styles?: SemanticStyles<PopoverSemanticPart>;
  /** Exactly one trigger element. */
  children: ReactNode;
}

const placements: Record<
  PopoverPlacement,
  Pick<RadixPopover.PopoverContentProps, 'side' | 'align'>
> = {
  top: { side: 'top', align: 'center' },
  topLeft: { side: 'top', align: 'start' },
  topRight: { side: 'top', align: 'end' },
  bottom: { side: 'bottom', align: 'center' },
  bottomLeft: { side: 'bottom', align: 'start' },
  bottomRight: { side: 'bottom', align: 'end' },
  left: { side: 'left', align: 'center' },
  leftTop: { side: 'left', align: 'start' },
  leftBottom: { side: 'left', align: 'end' },
  right: { side: 'right', align: 'center' },
  rightTop: { side: 'right', align: 'start' },
  rightBottom: { side: 'right', align: 'end' },
};

function getRenderNode(node: PopoverRender | undefined) {
  return typeof node === 'function' ? node() : node;
}

function isRenderable(node: ReactNode) {
  return node !== null && node !== undefined && node !== false && node !== '';
}

export function Popover({
  direction: directionProp,
  title,
  content,
  trigger = 'hover',
  placement = 'top',
  open,
  defaultOpen,
  onOpenChange,
  mouseEnterDelay = 0.1,
  mouseLeaveDelay = 0.1,
  arrow = true,
  destroyOnHidden,
  destroyTooltipOnHide,
  className,
  style,
  classNames,
  styles,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: PopoverProps) {
  const [direction, directionRef] = useTaoDirection(directionProp, 'self');
  const titleId = useId();
  const triggers = useMemo(
    () => new Set(Array.isArray(trigger) ? trigger : [trigger]),
    [trigger],
  );
  const hoverMode = triggers.has('hover');
  const focusMode = triggers.has('focus');
  const clickMode = triggers.has('click');
  const contextMenuMode = triggers.has('contextMenu');
  const shouldDestroy = destroyOnHidden ?? destroyTooltipOnHide ?? false;
  const placementProps = placements[placement];
  const TriggerPrimitive = clickMode
    ? RadixPopover.Trigger
    : RadixPopover.Anchor;
  const titleNode = getRenderNode(title);
  const contentNode = getRenderNode(content);
  const hasPopup = isRenderable(titleNode) || isRenderable(contentNode);

  const [realOpen, setOpen] = useControlledOpen({
    open,
    defaultOpen,
    onOpenChange,
    canOpen: hasPopup,
  });

  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const setTriggerRef = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
      directionRef(node);
    },
    [directionRef],
  );
  const containsFocusTarget = useCallback(
    (target: EventTarget | null) =>
      target instanceof Node &&
      (triggerRef.current?.contains(target) ||
        popupRef.current?.contains(target)),
    [],
  );

  const cancelTimers = useCallback(() => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  }, []);
  useEffect(() => cancelTimers, [cancelTimers]);

  const scheduleOpen = useCallback(() => {
    cancelTimers();
    if (mouseEnterDelay <= 0) {
      setOpen(true);
      return;
    }
    openTimer.current = setTimeout(() => setOpen(true), mouseEnterDelay * 1000);
  }, [cancelTimers, mouseEnterDelay, setOpen]);

  const scheduleClose = useCallback(() => {
    cancelTimers();
    const close = () => {
      if (!focusMode || !containsFocusTarget(document.activeElement))
        setOpen(false);
    };
    if (mouseLeaveDelay <= 0) {
      close();
      return;
    }
    closeTimer.current = setTimeout(close, mouseLeaveDelay * 1000);
  }, [cancelTimers, containsFocusTarget, focusMode, mouseLeaveDelay, setOpen]);

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (!containsFocusTarget(event.relatedTarget)) {
        cancelTimers();
        setOpen(false);
      }
    },
    [cancelTimers, containsFocusTarget, setOpen],
  );

  if (!hasPopup) return <>{children}</>;

  const hoverProps = hoverMode
    ? {
        onPointerEnter: scheduleOpen,
        onPointerLeave: scheduleClose,
      }
    : undefined;
  const triggerProps = {
    ...hoverProps,
    onFocus: focusMode
      ? () => {
          cancelTimers();
          setOpen(true);
        }
      : undefined,
    onBlur: focusMode ? handleBlur : undefined,
    onContextMenu: contextMenuMode
      ? (event: MouseEvent<HTMLElement>) => {
          event.preventDefault();
          setOpen(true);
        }
      : undefined,
  };

  return (
    <RadixPopover.Root open={realOpen} onOpenChange={setOpen}>
      <TriggerPrimitive asChild ref={setTriggerRef} {...triggerProps}>
        {asTriggerChild(children)}
      </TriggerPrimitive>
      <RadixPopover.Portal forceMount={shouldDestroy ? undefined : true}>
        <TaoPortalScope asChild direction={direction}>
          <RadixPopover.Content
            ref={popupRef}
            aria-label={ariaLabel}
            aria-labelledby={
              ariaLabelledBy ??
              (!ariaLabel && isRenderable(titleNode) ? titleId : undefined)
            }
            aria-describedby={ariaDescribedBy}
            data-tao-popover=""
            data-tao-placement={placement}
            data-tao-keep-alive={!shouldDestroy || undefined}
            className={cx(classNames?.root, className)}
            style={{ ...styles?.root, ...style }}
            {...placementProps}
            align={
              direction === 'rtl' &&
              (placementProps.side === 'top' ||
                placementProps.side === 'bottom') &&
              placementProps.align !== 'center'
                ? placementProps.align === 'start'
                  ? 'end'
                  : 'start'
                : placementProps.align
            }
            sideOffset={4}
            forceMount={shouldDestroy ? undefined : true}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onFocusCapture={focusMode ? cancelTimers : undefined}
            onBlurCapture={focusMode ? handleBlur : undefined}
            onFocusOutside={(event) => {
              if (focusMode && containsFocusTarget(event.target))
                event.preventDefault();
            }}
            {...hoverProps}
          >
            <div
              data-tao-popover-container=""
              className={cx(classNames?.container)}
              style={styles?.container}
            >
              {isRenderable(titleNode) && (
                <div
                  data-tao-popover-title=""
                  id={titleId}
                  className={cx(classNames?.title)}
                  style={styles?.title}
                >
                  {titleNode}
                </div>
              )}
              {isRenderable(contentNode) && (
                <div
                  data-tao-popover-content=""
                  className={cx(classNames?.content)}
                  style={styles?.content}
                >
                  {contentNode}
                </div>
              )}
            </div>
            {arrow !== false && (
              <RadixPopover.Arrow asChild>
                <span
                  data-tao-popover-arrow=""
                  className={cx(classNames?.arrow)}
                  style={styles?.arrow}
                />
              </RadixPopover.Arrow>
            )}
          </RadixPopover.Content>
        </TaoPortalScope>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
