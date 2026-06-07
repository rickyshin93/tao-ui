import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useState,
} from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './menu.css';

// ---- Public menu types (single source for Dropdown + ContextMenu) ----

export type MenuSemanticPart =
  | 'root'
  | 'content'
  | 'item'
  | 'itemIcon'
  | 'itemLabel'
  | 'itemExtra'
  | 'divider'
  | 'groupLabel'
  | 'subTrigger'
  | 'subContent';

export interface MenuItemType {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  /** Right-aligned extra content, e.g. a keyboard shortcut. */
  extra?: ReactNode;
  onClick?: (info: { key: string }) => void;
  /** Nested submenu. */
  children?: MenuItemType[];
}

export interface MenuDividerType {
  type: 'divider';
}

export interface MenuGroupType {
  type: 'group';
  key?: string;
  label?: ReactNode;
  children: MenuItemType[];
}

export type MenuItem = MenuItemType | MenuDividerType | MenuGroupType;

export interface MenuProps {
  items: MenuItem[];
  onClick?: (info: { key: string }) => void;
  /** Render items as checkbox/radio entries. */
  selectable?: boolean;
  /** Multi-select (checkbox) when selectable. Otherwise single (radio). */
  multiple?: boolean;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelect?: (info: { key: string; selectedKeys: string[] }) => void;
}

/**
 * Radix `react-dropdown-menu` and `react-context-menu` expose parallel
 * sub-components with identical names. We render an antd-style `items` array
 * against whichever set is passed in, so Dropdown and ContextMenu share one
 * renderer.
 */
// biome-ignore lint/suspicious/noExplicitAny: radix primitive props vary per namespace
type AnyComp = ComponentType<any>;

export interface MenuPrimitives {
  Item: AnyComp;
  CheckboxItem: AnyComp;
  RadioGroup: AnyComp;
  RadioItem: AnyComp;
  Label: AnyComp;
  Separator: AnyComp;
  Group: AnyComp;
  Sub: AnyComp;
  SubTrigger: AnyComp;
  SubContent: AnyComp;
  Portal: AnyComp;
  ItemIndicator: AnyComp;
}

export interface RenderCtx {
  P: MenuPrimitives;
  classNames?: SemanticClassNames<MenuSemanticPart>;
  styles?: SemanticStyles<MenuSemanticPart>;
  /** Fire item.onClick + menu.onClick for a plain action item. */
  onAction: (item: MenuItemType) => void;
  /** Multi-select: current keys + toggler. */
  selectedKeys: string[];
  multiple: boolean;
  selectable: boolean;
  onToggle: (key: string) => void;
}

// ---- Icons ----

function ChevronRightIcon() {
  return (
    <svg
      data-tao-menu-sub-icon=""
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

// ---- Item body (icon + label + extra) ----

function ItemBody({
  icon,
  label,
  extra,
  ctx,
}: {
  icon?: ReactNode;
  label: ReactNode;
  extra?: ReactNode;
  ctx: RenderCtx;
}) {
  return (
    <>
      {icon != null && (
        <span
          data-tao-menu-item-icon=""
          className={cx(ctx.classNames?.itemIcon)}
          style={ctx.styles?.itemIcon}
        >
          {icon}
        </span>
      )}
      <span
        data-tao-menu-item-label=""
        className={cx(ctx.classNames?.itemLabel)}
        style={ctx.styles?.itemLabel}
      >
        {label}
      </span>
      {extra != null && (
        <span
          data-tao-menu-item-extra=""
          className={cx(ctx.classNames?.itemExtra)}
          style={ctx.styles?.itemExtra}
        >
          {extra}
        </span>
      )}
    </>
  );
}

// ---- Recursive renderer ----

export function renderMenuItems(items: MenuItem[], ctx: RenderCtx): ReactNode {
  const { P } = ctx;

  return items.map((item, index) => {
    // Divider
    if ('type' in item && item.type === 'divider') {
      return (
        <P.Separator
          // biome-ignore lint/suspicious/noArrayIndexKey: dividers have no stable id
          key={`divider-${index}`}
          data-tao-menu-divider=""
          className={cx(ctx.classNames?.divider)}
          style={ctx.styles?.divider}
        />
      );
    }

    // Group
    if ('type' in item && item.type === 'group') {
      return (
        <P.Group key={item.key ?? `group-${index}`} data-tao-menu-group="">
          {item.label != null && (
            <P.Label
              data-tao-menu-group-label=""
              className={cx(ctx.classNames?.groupLabel)}
              style={ctx.styles?.groupLabel}
            >
              {item.label}
            </P.Label>
          )}
          {renderMenuItems(item.children, ctx)}
        </P.Group>
      );
    }

    // Submenu
    if (item.children && item.children.length > 0) {
      return (
        <P.Sub key={item.key}>
          <P.SubTrigger
            disabled={item.disabled}
            data-tao-menu-item=""
            data-tao-menu-sub-trigger=""
            data-tao-danger={item.danger || undefined}
            className={cx(ctx.classNames?.item, ctx.classNames?.subTrigger)}
            style={{ ...ctx.styles?.item, ...ctx.styles?.subTrigger }}
          >
            <ItemBody
              icon={item.icon}
              label={item.label}
              extra={item.extra}
              ctx={ctx}
            />
            <ChevronRightIcon />
          </P.SubTrigger>
          <P.Portal>
            <P.SubContent
              data-tao-menu-content=""
              data-tao-menu-sub-content=""
              className={cx(ctx.classNames?.subContent)}
              style={ctx.styles?.subContent}
              sideOffset={2}
              alignOffset={-4}
            >
              {renderMenuItems(item.children, ctx)}
            </P.SubContent>
          </P.Portal>
        </P.Sub>
      );
    }

    // Selectable leaf: checkbox (multiple) or radio (single)
    if (ctx.selectable) {
      if (ctx.multiple) {
        return (
          <P.CheckboxItem
            key={item.key}
            disabled={item.disabled}
            checked={ctx.selectedKeys.includes(item.key)}
            onCheckedChange={() => {
              ctx.onToggle(item.key);
              ctx.onAction(item);
            }}
            data-tao-menu-item=""
            data-tao-menu-selectable=""
            data-tao-danger={item.danger || undefined}
            className={cx(ctx.classNames?.item)}
            style={ctx.styles?.item}
          >
            <span data-tao-menu-item-indicator="">
              <P.ItemIndicator>
                <CheckIcon />
              </P.ItemIndicator>
            </span>
            <ItemBody
              icon={item.icon}
              label={item.label}
              extra={item.extra}
              ctx={ctx}
            />
          </P.CheckboxItem>
        );
      }
      // single → RadioItem (wrapped in a RadioGroup at the content root)
      return (
        <P.RadioItem
          key={item.key}
          value={item.key}
          disabled={item.disabled}
          onSelect={() => ctx.onAction(item)}
          data-tao-menu-item=""
          data-tao-menu-selectable=""
          data-tao-danger={item.danger || undefined}
          className={cx(ctx.classNames?.item)}
          style={ctx.styles?.item}
        >
          <span data-tao-menu-item-indicator="">
            <P.ItemIndicator>
              <DotIcon />
            </P.ItemIndicator>
          </span>
          <ItemBody
            icon={item.icon}
            label={item.label}
            extra={item.extra}
            ctx={ctx}
          />
        </P.RadioItem>
      );
    }

    // Plain action item
    return (
      <P.Item
        key={item.key}
        disabled={item.disabled}
        onSelect={() => ctx.onAction(item)}
        data-tao-menu-item=""
        data-tao-danger={item.danger || undefined}
        className={cx(ctx.classNames?.item)}
        style={ctx.styles?.item}
      >
        <ItemBody
          icon={item.icon}
          label={item.label}
          extra={item.extra}
          ctx={ctx}
        />
      </P.Item>
    );
  });
}

// ---- Shared controller hook ----

/**
 * Encapsulates a menu's selection state (controlled / uncontrolled), the
 * item-click dispatch (`item.onClick` → `menu.onClick`), and rendering of the
 * item tree (wrapping in a RadioGroup for single-select). Returns the ready
 * content node. Shared by Dropdown and ContextMenu.
 */
export function useMenuController(
  menu: MenuProps,
  P: MenuPrimitives,
  semantic: {
    classNames?: SemanticClassNames<MenuSemanticPart>;
    styles?: SemanticStyles<MenuSemanticPart>;
  },
): ReactNode {
  const selectable = !!menu.selectable;
  const multiple = !!menu.multiple;
  const isSelControlled = menu.selectedKeys != null;
  const [selInternal, setSelInternal] = useState<string[]>(
    menu.defaultSelectedKeys ?? [],
  );
  const selectedKeys = isSelControlled
    ? (menu.selectedKeys ?? [])
    : selInternal;

  const commitSel = useCallback(
    (next: string[], changedKey: string) => {
      if (!isSelControlled) setSelInternal(next);
      menu.onSelect?.({ key: changedKey, selectedKeys: next });
    },
    [isSelControlled, menu],
  );
  const toggleKey = useCallback(
    (key: string) => {
      const next = selectedKeys.includes(key)
        ? selectedKeys.filter((k) => k !== key)
        : [...selectedKeys, key];
      commitSel(next, key);
    },
    [selectedKeys, commitSel],
  );
  const radioChange = useCallback(
    (key: string) => commitSel([key], key),
    [commitSel],
  );

  const onAction = useCallback(
    (item: MenuItemType) => {
      item.onClick?.({ key: item.key });
      menu.onClick?.({ key: item.key });
    },
    [menu],
  );

  const ctx: RenderCtx = {
    P,
    classNames: semantic.classNames,
    styles: semantic.styles,
    onAction,
    selectedKeys,
    multiple,
    selectable,
    onToggle: toggleKey,
  };

  const body = renderMenuItems(menu.items, ctx);
  if (selectable && !multiple) {
    return (
      <P.RadioGroup value={selectedKeys[0]} onValueChange={radioChange}>
        {body}
      </P.RadioGroup>
    );
  }
  return body;
}
