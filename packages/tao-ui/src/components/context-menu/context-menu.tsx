import * as RC from '@radix-ui/react-context-menu';
import type { CSSProperties, ReactNode } from 'react';
import {
  TaoPortalScope,
  useTaoConfig,
  useTaoDirection,
} from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import {
  type MenuPrimitives,
  type MenuProps,
  type MenuSemanticPart,
  useMenuController,
} from '../menu/menu-render';
import './context-menu.css';

export type ContextMenuSemanticPart = MenuSemanticPart;

export interface ContextMenuProps {
  direction?: 'ltr' | 'rtl';
  menu: MenuProps;
  /** Element whose right-click (long-press on touch) opens the menu. */
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /** Merged onto the floating content. */
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<ContextMenuSemanticPart>;
  styles?: SemanticStyles<ContextMenuSemanticPart>;
}

const CM: MenuPrimitives = {
  Item: RC.Item,
  CheckboxItem: RC.CheckboxItem,
  RadioGroup: RC.RadioGroup,
  RadioItem: RC.RadioItem,
  Label: RC.Label,
  Separator: RC.Separator,
  Group: RC.Group,
  Sub: RC.Sub,
  SubTrigger: RC.SubTrigger,
  SubContent: RC.SubContent,
  Portal: RC.Portal,
  ItemIndicator: RC.ItemIndicator,
};

export function ContextMenu({
  direction: directionProp,
  menu,
  children,
  open,
  onOpenChange,
  disabled,
  className,
  style,
  classNames,
  styles,
}: ContextMenuProps) {
  const [direction, directionRef] = useTaoDirection(directionProp, 'self');
  const { size, disabled: ctxDisabled } = useTaoConfig();
  const resolvedDisabled = disabled ?? ctxDisabled;

  const content = useMenuController(menu, CM, { classNames, styles });

  return (
    <RC.Root dir={direction} open={open} onOpenChange={onOpenChange}>
      <RC.Trigger
        ref={directionRef}
        disabled={resolvedDisabled}
        data-tao-context-menu-trigger=""
      >
        {children}
      </RC.Trigger>
      <RC.Portal>
        <TaoPortalScope asChild direction={direction}>
          <RC.Content
            data-tao-menu-content=""
            data-tao-context-menu=""
            data-tao-size={size}
            className={cx(classNames?.content, className)}
            style={{ ...styles?.content, ...style }}
          >
            {content}
          </RC.Content>
        </TaoPortalScope>
      </RC.Portal>
    </RC.Root>
  );
}
