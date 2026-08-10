import {
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useState,
} from 'react';

/**
 * Controlled/uncontrolled open state for overlay components
 * (Popover/Popconfirm/Tooltip/…): `open` wins when provided, `defaultOpen`
 * seeds the uncontrolled initial state, and `onOpenChange` observes every
 * request either way. `canOpen: false` vetoes opening while still allowing
 * closes (antd's `disabled` semantics for Popconfirm).
 */
export function useControlledOpen({
  open,
  defaultOpen,
  onOpenChange,
  canOpen = true,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  canOpen?: boolean;
}): [boolean, (next: boolean) => void] {
  const isControlled = open != null;
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const realOpen = isControlled ? open : internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (next && !canOpen) return;
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, canOpen, onOpenChange],
  );
  return [realOpen, setOpen];
}

/**
 * Radix `Trigger asChild` requires exactly one element child — wrap plain
 * text/fragment content in a span so triggers can accept any ReactNode.
 */
export function asTriggerChild(children: ReactNode): ReactElement {
  return isValidElement(children) ? children : <span>{children}</span>;
}
