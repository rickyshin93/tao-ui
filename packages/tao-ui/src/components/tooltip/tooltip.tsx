import * as RadixTooltip from '@radix-ui/react-tooltip';
import {
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { TaoPortalScope, useTaoDirection } from '../../provider/tao-provider';
import { asTriggerChild, useControlledOpen } from '../../utils/overlay';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './tooltip.css';

// ---- Types ----

export type TooltipSemanticPart = 'content' | 'arrow';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  direction?: 'ltr' | 'rtl';
  /** Tooltip content. Empty strings, booleans, null and undefined disable it. */
  title?: ReactNode;
  /** Popup side relative to the trigger. Defaults to 'top'. */
  placement?: TooltipPlacement;
  /** Show the arrow pointing at the trigger. Defaults to true. */
  arrow?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hover delay in seconds before opening. Defaults to 0.1. Focus opens immediately. */
  mouseEnterDelay?: number;
  /**
   * Delay in seconds before a pointer-leave closes the tooltip. Defaults to
   * 0.1 (antd parity) — re-entering the trigger or content before the
   * deadline cancels the close. Esc / focus-blur closes stay immediate.
   */
  mouseLeaveDelay?: number;
  /** Custom content background color. */
  color?: string;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<TooltipSemanticPart>;
  styles?: SemanticStyles<TooltipSemanticPart>;
  /** Exactly one trigger element. */
  children: ReactNode;
}

// ---- Tooltip ----

export function Tooltip(props: TooltipProps) {
  const { title, children } = props;
  if (title == null || title === '' || typeof title === 'boolean') {
    return <>{children}</>;
  }
  return <ActiveTooltip {...props} />;
}

function ActiveTooltip({
  direction: directionProp,
  title,
  placement = 'top',
  arrow = true,
  open,
  defaultOpen,
  onOpenChange,
  mouseEnterDelay = 0.1,
  mouseLeaveDelay = 0.1,
  color,
  className,
  style,
  classNames,
  styles,
  children,
}: TooltipProps) {
  const [direction, directionRef] = useTaoDirection(directionProp, 'self');
  const [realOpen, setOpen] = useControlledOpen({
    open,
    defaultOpen,
    onOpenChange,
  });
  const latestSetOpen = useRef(setOpen);
  latestSetOpen.current = setOpen;

  // Pointer-initiated closes are deferred by mouseLeaveDelay; the flag tells
  // them apart from Esc/blur closes, which Radix reports through the same
  // onOpenChange without a reason.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const pointerDriven = useRef(false);
  useEffect(() => {
    if (!realOpen) return;
    return () => {
      clearTimeout(closeTimer.current);
      pointerDriven.current = false;
    };
  }, [realOpen]);

  const schedulePointerClose = useCallback(() => {
    clearTimeout(closeTimer.current);
    if (mouseLeaveDelay <= 0) {
      setOpen(false);
      return;
    }
    closeTimer.current = setTimeout(() => {
      pointerDriven.current = false;
      latestSetOpen.current(false);
    }, mouseLeaveDelay * 1000);
  }, [mouseLeaveDelay, setOpen]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      // Radix's own pointer close (grace-area tracking) lands here too —
      // defer it the same way; Esc/blur closes stay immediate.
      if (!next && pointerDriven.current) {
        schedulePointerClose();
        return;
      }
      clearTimeout(closeTimer.current);
      pointerDriven.current = false;
      setOpen(next);
    },
    [schedulePointerClose, setOpen],
  );

  const hoverProps = {
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      pointerDriven.current = false;
      clearTimeout(closeTimer.current);
    },
    onPointerLeave: (event: PointerEvent) => {
      if (!realOpen || event.pointerType === 'touch') return;
      pointerDriven.current = true;
      // Schedule the close ourselves: Radix only clears its open timer on
      // trigger leave and relies on grace-area tracking afterwards, which
      // doesn't run in every environment (and ignores mouseLeaveDelay).
      schedulePointerClose();
    },
  };

  const colorStyle: CSSProperties | undefined = color
    ? { background: color }
    : undefined;

  return (
    <RadixTooltip.Provider delayDuration={mouseEnterDelay * 1000}>
      <RadixTooltip.Root open={realOpen} onOpenChange={handleOpenChange}>
        <RadixTooltip.Trigger
          ref={directionRef}
          asChild
          {...hoverProps}
          onBlur={() => {
            pointerDriven.current = false;
          }}
        >
          {asTriggerChild(children)}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <TaoPortalScope direction={direction}>
            <RadixTooltip.Content
              data-tao-tooltip-content=""
              className={cx(classNames?.content, className)}
              style={{ ...colorStyle, ...styles?.content, ...style }}
              side={placement}
              sideOffset={4}
              onEscapeKeyDown={() => {
                pointerDriven.current = false;
              }}
              {...hoverProps}
            >
              {title}
              {arrow && (
                <RadixTooltip.Arrow asChild>
                  <span
                    data-tao-tooltip-arrow=""
                    className={cx(classNames?.arrow)}
                    style={{
                      // consumed by the ::before arrow square (inline styles
                      // can't target pseudo-elements directly)
                      ...(color
                        ? ({ '--tao-tooltip-arrow-bg': color } as CSSProperties)
                        : undefined),
                      ...styles?.arrow,
                    }}
                  />
                </RadixTooltip.Arrow>
              )}
            </RadixTooltip.Content>
          </TaoPortalScope>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
