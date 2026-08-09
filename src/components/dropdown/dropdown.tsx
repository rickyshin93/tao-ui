import * as RD from '@radix-ui/react-dropdown-menu';
import {
  type CSSProperties,
  isValidElement,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  TaoPortalScope,
  type TaoSize,
  useTaoConfig,
} from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Button, type ButtonProps } from '../button/button';
import { ContextMenu } from '../context-menu/context-menu';
import {
  type MenuPrimitives,
  type MenuProps,
  type MenuSemanticPart,
  useMenuController,
} from '../menu/menu-render';
import './dropdown.css';

// ---- Types ----

export type DropdownSemanticPart = MenuSemanticPart;

export type {
  MenuDividerType,
  MenuGroupType,
  MenuItem,
  MenuItemType,
  MenuProps,
} from '../menu/menu-render';

export type DropdownPlacement =
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'top'
  | 'topLeft'
  | 'topRight';

export type DropdownTrigger = 'click' | 'hover' | 'contextMenu';

export interface DropdownProps {
  menu: MenuProps;
  /** Trigger element (a single React element). */
  children: ReactNode;
  /** How the menu opens. Defaults to `['click']`. */
  trigger?: DropdownTrigger[];
  /** Defaults to `'bottomLeft'`. Ignored for `contextMenu`. */
  placement?: DropdownPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /** Show a pointing arrow on the menu. Defaults to `false`. */
  arrow?: boolean;
  /** Merged onto the floating content. */
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<DropdownSemanticPart>;
  styles?: SemanticStyles<DropdownSemanticPart>;
}

export interface DropdownButtonProps extends Omit<DropdownProps, 'children'> {
  /** Main button content. */
  children?: ReactNode;
  /** Main button click handler. */
  onClick?: () => void;
  /** Icon for the trigger button. Defaults to an ellipsis. */
  icon?: ReactNode;
  variant?: ButtonProps['variant'];
  size?: TaoSize;
}

// ---- Primitive set ----

const DD: MenuPrimitives = {
  Item: RD.Item,
  CheckboxItem: RD.CheckboxItem,
  RadioGroup: RD.RadioGroup,
  RadioItem: RD.RadioItem,
  Label: RD.Label,
  Separator: RD.Separator,
  Group: RD.Group,
  Sub: RD.Sub,
  SubTrigger: RD.SubTrigger,
  SubContent: RD.SubContent,
  Portal: RD.Portal,
  ItemIndicator: RD.ItemIndicator,
};

// ---- Helpers ----

function parsePlacement(p: DropdownPlacement): {
  side: 'top' | 'bottom';
  align: 'start' | 'center' | 'end';
} {
  const side = p.startsWith('top') ? 'top' : 'bottom';
  const align = p.endsWith('Left')
    ? 'start'
    : p.endsWith('Right')
      ? 'end'
      : 'center';
  return { side, align };
}

function EllipsisIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

// ---- Component ----

export function Dropdown(props: DropdownProps) {
  const {
    menu,
    children,
    trigger = ['click'],
    placement = 'bottomLeft',
    open,
    defaultOpen,
    onOpenChange,
    disabled,
    arrow = false,
    className,
    style,
    classNames,
    styles,
  } = props;

  const { size, disabled: ctxDisabled } = useTaoConfig();
  const resolvedDisabled = disabled ?? ctxDisabled;

  const isContext = trigger.includes('contextMenu');
  const hoverMode = !isContext && trigger.includes('hover');

  // Open state (controlled / uncontrolled)
  const isOpenControlled = open != null;
  const [openInternal, setOpenInternal] = useState(defaultOpen ?? false);
  const realOpen = isOpenControlled ? open : openInternal;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setOpenInternal(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  // Hover open/close with a small close delay
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const openOnHover = useCallback(() => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }, [setOpen]);
  const closeOnHover = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, [setOpen]);

  const content = useMenuController(menu, DD, { classNames, styles });
  const triggerChild = isValidElement(children) ? (
    children
  ) : (
    <span>{children}</span>
  );

  // Right-click → delegate to the standalone ContextMenu component.
  if (isContext) {
    return (
      <ContextMenu
        menu={menu}
        open={open}
        onOpenChange={onOpenChange}
        disabled={disabled}
        className={className}
        style={style}
        classNames={classNames}
        styles={styles}
      >
        {children}
      </ContextMenu>
    );
  }

  const { side, align } = parsePlacement(placement);
  const hoverProps = hoverMode
    ? { onPointerEnter: openOnHover, onPointerLeave: closeOnHover }
    : undefined;

  return (
    <RD.Root open={realOpen} onOpenChange={setOpen} modal={false}>
      <RD.Trigger
        asChild
        disabled={resolvedDisabled}
        data-tao-dropdown-trigger=""
        {...hoverProps}
      >
        {triggerChild}
      </RD.Trigger>
      <RD.Portal>
        <TaoPortalScope asChild>
          <RD.Content
            data-tao-menu-content=""
            data-tao-dropdown=""
            data-tao-size={size}
            className={cx(classNames?.content, className)}
            style={{ ...styles?.content, ...style }}
            side={side}
            align={align}
            sideOffset={4}
            {...hoverProps}
          >
            {arrow && <RD.Arrow asChild><span data-tao-dropdown-arrow="" /></RD.Arrow>}
            {content}
          </RD.Content>
        </TaoPortalScope>
      </RD.Portal>
    </RD.Root>
  );
}

// ---- Dropdown.Button ----

function DropdownButton({
  children,
  onClick,
  icon,
  variant = 'secondary',
  size,
  menu,
  ...dropdownRest
}: DropdownButtonProps) {
  const { size: ctxSize } = useTaoConfig();
  const resolvedSize = size ?? ctxSize;
  return (
    <span data-tao-dropdown-button-group="">
      <Button
        variant={variant}
        size={resolvedSize}
        onClick={onClick}
        data-tao-dropdown-button-main=""
      >
        {children}
      </Button>
      <Dropdown menu={menu} {...dropdownRest}>
        <Button
          variant={variant}
          size={resolvedSize}
          aria-label="More"
          data-tao-dropdown-button-trigger=""
        >
          {icon ?? <EllipsisIcon />}
        </Button>
      </Dropdown>
    </span>
  );
}

Dropdown.Button = DropdownButton;
