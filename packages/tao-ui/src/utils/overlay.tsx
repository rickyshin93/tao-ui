import {
  Children,
  Fragment,
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
 * Radix triggers need a DOM-capable element. Unwrap single-child fragments so
 * focus returns to the real trigger; wrap text or multiple nodes in a span.
 */
export function asTriggerChild(children: ReactNode): ReactElement {
  if (!isValidElement<{ children?: ReactNode }>(children)) {
    return <span>{children}</span>;
  }
  if (children.type !== Fragment) return children;
  const items = Children.toArray(children.props.children);
  return items.length === 1 ? asTriggerChild(items[0]) : <span>{children}</span>;
}
