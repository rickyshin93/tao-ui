import * as RC from '@radix-ui/react-collapsible';
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './collapsible.css';

// ---- Types ----

export type CollapsibleSemanticPart = 'root' | 'trigger' | 'content';

export interface CollapsibleProps {
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. Defaults to `false`. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Disable the trigger. Falls back to TaoProvider's `disabled`. */
  disabled?: boolean;
  children?: ReactNode;
  /** Merged into the root element. */
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<CollapsibleSemanticPart>;
  styles?: SemanticStyles<CollapsibleSemanticPart>;
}

export interface CollapsibleTriggerProps {
  children?: ReactNode;
  /** Render the child element as the trigger instead of a default button. */
  asChild?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface CollapsibleContentProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ---- Semantic context ----
//
// classNames/styles live on the Root but apply to trigger/content too.
// We thread them down via React context so the sub-components stay flat.

interface CollapsibleCtx {
  classNames?: SemanticClassNames<CollapsibleSemanticPart>;
  styles?: SemanticStyles<CollapsibleSemanticPart>;
}

const Ctx = createContext<CollapsibleCtx>({});

// ---- Component ----

export function Collapsible(props: CollapsibleProps) {
  const {
    open,
    defaultOpen,
    onOpenChange,
    disabled,
    children,
    className,
    style,
    classNames,
    styles,
  } = props;

  const { disabled: ctxDisabled } = useTaoConfig();
  const resolvedDisabled = disabled ?? ctxDisabled;

  // Controlled / uncontrolled open state.
  const isControlled = open != null;
  const [openInternal, setOpenInternal] = useState(defaultOpen ?? false);
  const realOpen = isControlled ? open : openInternal;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setOpenInternal(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return (
    <Ctx.Provider value={{ classNames, styles }}>
      <RC.Root
        open={realOpen}
        onOpenChange={setOpen}
        disabled={resolvedDisabled}
        data-tao-collapsible=""
        className={cx(classNames?.root, className)}
        style={{ ...styles?.root, ...style }}
      >
        {children}
      </RC.Root>
    </Ctx.Provider>
  );
}

function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  const { children, asChild, className, style } = props;
  const { classNames, styles } = useContext(Ctx);
  return (
    <RC.Trigger
      asChild={asChild}
      data-tao-collapsible-trigger=""
      className={cx(classNames?.trigger, className)}
      style={{ ...styles?.trigger, ...style }}
    >
      {children}
    </RC.Trigger>
  );
}

function CollapsibleContent(props: CollapsibleContentProps) {
  const { children, className, style } = props;
  const { classNames, styles } = useContext(Ctx);
  return (
    <RC.Content
      data-tao-collapsible-content=""
      className={cx(classNames?.content, className)}
      style={{ ...styles?.content, ...style }}
    >
      {children}
    </RC.Content>
  );
}

Collapsible.Trigger = CollapsibleTrigger;
Collapsible.Content = CollapsibleContent;
