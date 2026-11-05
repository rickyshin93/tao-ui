import * as RC from '@radix-ui/react-collapsible';
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import { type TaoSize, useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { CollapsePanels } from './collapse-panels';
import './collapse.css';

// ---- Types ----

export type CollapseSemanticPart =
  | 'root'
  | 'item'
  | 'header'
  | 'trigger'
  | 'title'
  | 'icon'
  | 'extra'
  | 'content'
  | 'body';

export type CollapseTriggerType = 'header' | 'icon' | 'disabled';

export interface CollapseItem {
  /** Unique panel key. Numeric keys are normalized to strings. */
  key: string | number;
  label: ReactNode;
  children?: ReactNode;
  extra?: ReactNode;
  collapsible?: CollapseTriggerType;
  showArrow?: boolean;
  /** Mount the body even before opening; keeps it mounted when hidden. */
  forceRender?: boolean;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<'header' | 'body'>;
  styles?: SemanticStyles<'header' | 'body'>;
}

export interface CollapseExpandIconProps {
  key: string | number;
  isActive: boolean;
  disabled: boolean;
}

export interface CollapseProps {
  /** Complete panels with built-in headers, icons and content styling. */
  items?: CollapseItem[];
  activeKey?: string | number | (string | number)[];
  defaultActiveKey?: string | number | (string | number)[];
  /** Called with normalized string keys, including in accordion mode. */
  onChange?: (activeKeys: string[]) => void;
  /** Allow at most one active panel; clicking it again closes it. */
  accordion?: boolean;
  bordered?: boolean;
  ghost?: boolean;
  size?: TaoSize;
  collapsible?: CollapseTriggerType;
  expandIconPlacement?: 'start' | 'end';
  expandIcon?: (props: CollapseExpandIconProps) => ReactNode;
  /** Unmount closed bodies unless the item has forceRender. */
  destroyOnHidden?: boolean;
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
  classNames?: SemanticClassNames<CollapseSemanticPart>;
  styles?: SemanticStyles<CollapseSemanticPart>;
}

export interface CollapseTriggerProps {
  children?: ReactNode;
  /** Render the child element as the trigger instead of a default button. */
  asChild?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface CollapseContentProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ---- Semantic context ----
//
// classNames/styles live on the Root but apply to trigger/content too.
// We thread them down via React context so the sub-components stay flat.

interface CollapseCtx {
  classNames?: SemanticClassNames<CollapseSemanticPart>;
  styles?: SemanticStyles<CollapseSemanticPart>;
}

const Ctx = createContext<CollapseCtx>({});

// ---- Component ----

export function Collapse(props: CollapseProps) {
  return props.items ? (
    <CollapsePanels {...props} items={props.items} />
  ) : (
    <CollapseRoot {...props} />
  );
}

function CollapseRoot(props: CollapseProps) {
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
        data-tao-collapse=""
        className={cx(classNames?.root, className)}
        style={{ ...styles?.root, ...style }}
      >
        {children}
      </RC.Root>
    </Ctx.Provider>
  );
}

function CollapseTrigger(props: CollapseTriggerProps) {
  const { children, asChild, className, style } = props;
  const { classNames, styles } = useContext(Ctx);
  return (
    <RC.Trigger
      asChild={asChild}
      data-tao-collapse-trigger=""
      className={cx(classNames?.trigger, className)}
      style={{ ...styles?.trigger, ...style }}
    >
      {children}
    </RC.Trigger>
  );
}

function CollapseContent(props: CollapseContentProps) {
  const { children, className, style } = props;
  const { classNames, styles } = useContext(Ctx);
  return (
    <RC.Content
      data-tao-collapse-content=""
      className={cx(classNames?.content, className)}
      style={{ ...styles?.content, ...style }}
    >
      {children}
    </RC.Content>
  );
}

Collapse.Trigger = CollapseTrigger;
Collapse.Content = CollapseContent;
