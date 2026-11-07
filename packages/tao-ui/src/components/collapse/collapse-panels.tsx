import { useEffect, useId, useState } from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import { cx } from '../../utils/semantic';
import type {
  CollapseItem,
  CollapseProps,
  CollapseTriggerType,
} from './collapse';

function toKeys(value: CollapseProps['activeKey']): string[] {
  return value === undefined
    ? []
    : (Array.isArray(value) ? value : [value]).map(String);
}

export function CollapsePanels(
  props: CollapseProps & { items: CollapseItem[] },
) {
  const {
    items,
    activeKey,
    defaultActiveKey,
    onChange,
    accordion = false,
    bordered = true,
    ghost = false,
    size,
    disabled,
    collapsible = 'header',
    expandIconPlacement = 'start',
    expandIcon,
    destroyOnHidden = false,
    className,
    style,
    classNames,
    styles,
  } = props;
  const config = useTaoConfig();
  const [internalKeys, setInternalKeys] = useState(() =>
    toKeys(defaultActiveKey),
  );
  const controlled = 'activeKey' in props;
  const keys = controlled ? toKeys(activeKey) : internalKeys;
  const activeKeys = accordion ? keys.slice(0, 1) : keys;
  const toggle = (key: string) => {
    const presentKeys = new Set(items.map((item) => String(item.key)));
    const next = activeKeys.includes(key)
      ? activeKeys.filter((active) => active !== key && presentKeys.has(active))
      : accordion
        ? [key]
        : [...activeKeys.filter((active) => presentKeys.has(active)), key];
    if (!controlled) setInternalKeys(next);
    onChange?.([...next]);
  };

  return (
    <div
      data-tao-collapse=""
      data-tao-collapse-panels=""
      data-tao-size={size ?? config.size}
      data-tao-bordered={bordered}
      data-tao-ghost={ghost || undefined}
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      {items.map((item) => (
        <CollapsePanel
          key={item.key}
          item={item}
          open={activeKeys.includes(String(item.key))}
          onToggle={() => toggle(String(item.key))}
          triggerMode={
            (disabled ?? config.disabled)
              ? 'disabled'
              : (item.collapsible ?? collapsible)
          }
          expandIcon={expandIcon}
          expandIconPlacement={expandIconPlacement}
          destroyOnHidden={destroyOnHidden}
          classNames={classNames}
          styles={styles}
        />
      ))}
    </div>
  );
}

function CollapsePanel({
  item,
  open,
  onToggle,
  triggerMode,
  expandIcon,
  expandIconPlacement,
  destroyOnHidden,
  classNames,
  styles,
}: Pick<
  CollapseProps,
  | 'expandIcon'
  | 'expandIconPlacement'
  | 'destroyOnHidden'
  | 'classNames'
  | 'styles'
> & {
  item: CollapseItem;
  open: boolean;
  onToggle: () => void;
  triggerMode: CollapseTriggerType;
}) {
  const id = useId();
  const titleId = `${id}-title`;
  const bodyId = `${id}-body`;
  const [hasOpened, setHasOpened] = useState(open);
  useEffect(() => {
    if (open) setHasOpened(true);
  }, [open]);
  const renderBody =
    item.forceRender || open || (!destroyOnHidden && hasOpened);
  const disabled = triggerMode === 'disabled';
  const iconOnly = triggerMode === 'icon';
  if (iconOnly && item.showArrow === false) {
    throw new Error(
      'Collapse: collapsible="icon" requires showArrow to be enabled.',
    );
  }
  const icon = item.showArrow !== false && (
    <span
      data-tao-collapse-icon=""
      aria-hidden="true"
      className={classNames?.icon}
      style={styles?.icon}
    >
      {expandIcon ? (
        expandIcon({ key: item.key, isActive: open, disabled })
      ) : (
        <svg
          aria-hidden="true"
          data-tao-collapse-arrow=""
          viewBox="0 0 16 16"
          width="12"
          height="12"
          fill="none"
        >
          <path
            d="m6 3 5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
  const title = (
    <span
      id={titleId}
      data-tao-collapse-title=""
      className={classNames?.title}
      style={styles?.title}
    >
      {item.label}
    </span>
  );

  return (
    <div
      data-tao-collapse-item=""
      data-state={open ? 'open' : 'closed'}
      data-disabled={disabled || undefined}
      className={cx(classNames?.item, item.className)}
      style={{ ...styles?.item, ...item.style }}
    >
      <div
        data-tao-collapse-header=""
        data-tao-trigger-mode={iconOnly ? 'icon' : 'header'}
        data-tao-icon-placement={expandIconPlacement}
        className={cx(classNames?.header, item.classNames?.header)}
        style={{ ...styles?.header, ...item.styles?.header }}
      >
        <button
          type="button"
          data-tao-collapse-trigger=""
          data-tao-collapse-panel-trigger=""
          data-state={open ? 'open' : 'closed'}
          data-disabled={disabled || undefined}
          disabled={disabled}
          aria-expanded={open}
          aria-controls={bodyId}
          aria-labelledby={titleId}
          onClick={onToggle}
          className={classNames?.trigger}
          style={styles?.trigger}
        >
          {icon}
          {!iconOnly && title}
        </button>
        {iconOnly && title}
        {item.extra != null && (
          <span
            data-tao-collapse-extra=""
            className={classNames?.extra}
            style={styles?.extra}
          >
            {item.extra}
          </span>
        )}
      </div>
      <section
        id={bodyId}
        aria-labelledby={titleId}
        hidden={!open}
        data-tao-collapse-content=""
        data-tao-collapse-panel-content=""
        className={classNames?.content}
        style={styles?.content}
      >
        {renderBody && (
          <div
            data-tao-collapse-body=""
            className={cx(classNames?.body, item.classNames?.body)}
            style={{ ...styles?.body, ...item.styles?.body }}
          >
            {item.children}
          </div>
        )}
      </section>
    </div>
  );
}
