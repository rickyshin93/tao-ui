import {
  type AriaAttributes,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  type TaoSize,
  useTaoConfig,
  useTaoDirection,
} from '../../provider/tao-provider';
import { mergeRefs } from '../../utils/refs';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './tabs.css';

// ---- Types ----

export type TabsSemanticPart = 'root' | 'nav' | 'tab' | 'indicator' | 'panel';

export interface TabItem {
  key: string;
  label: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps
  extends Pick<AriaAttributes, 'aria-label' | 'aria-labelledby'> {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  size?: TaoSize;
  variant?: 'line' | 'card';
  destroyInactiveTabPane?: boolean;
  className?: string;
  classNames?: SemanticClassNames<TabsSemanticPart>;
  styles?: SemanticStyles<TabsSemanticPart>;
}

// ---- Tabs ----

export function Tabs({
  items,
  activeKey: activeKeyProp,
  defaultActiveKey,
  onChange,
  size,
  variant = 'line',
  destroyInactiveTabPane = false,
  className,
  classNames,
  styles,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: TabsProps) {
  const ctx = useTaoConfig();
  const id = useId();
  const resolvedSize = size ?? ctx.size;
  const getItemId = (part: 'tab' | 'panel', key: string) =>
    `${id}-${part}-${encodeURIComponent(key)}`;

  // Controlled / uncontrolled
  const isControlled = activeKeyProp !== undefined;
  const firstEnabledKey = items.find((item) => !item.disabled)?.key;
  const [internalKey, setInternalKey] = useState(
    defaultActiveKey ?? firstEnabledKey,
  );
  const isInternalKeyEnabled = items.some(
    (item) => item.key === internalKey && !item.disabled,
  );
  if (
    !isControlled &&
    !isInternalKeyEnabled &&
    firstEnabledKey !== undefined &&
    internalKey !== firstEnabledKey
  ) {
    setInternalKey(firstEnabledKey);
  }
  const currentKey = isControlled
    ? activeKeyProp
    : isInternalKeyEnabled
      ? internalKey
      : firstEnabledKey;
  const [focusedKey, setFocusedKey] = useState<string>();
  const entryKey = items.some(
    (item) => item.key === currentKey && !item.disabled,
  )
    ? currentKey
    : firstEnabledKey;
  const focusKey = items.some(
    (item) => item.key === focusedKey && !item.disabled,
  )
    ? focusedKey
    : entryKey;

  const handleSelect = useCallback(
    (key: string) => {
      if (key === currentKey) return;
      if (!isControlled) setInternalKey(key);
      onChange?.(key);
    },
    [currentKey, isControlled, onChange],
  );

  // Ink bar (line variant)
  const tablistRef = useRef<HTMLDivElement>(null);
  const [direction, directionRef] = useTaoDirection(undefined, 'self');
  const listRef = useMemo(
    () => mergeRefs(tablistRef, directionRef),
    [directionRef],
  );
  const [inkStyle, setInkStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (variant !== 'line') return;
    const list = tablistRef.current;
    if (!list) return;
    const activeItem = items.find((item) => item.key === currentKey);
    const active = activeItem
      ? list.querySelector<HTMLElement>(
          `[data-tao-tab-key="${CSS.escape(activeItem.key)}"]`,
        )
      : null;
    if (!active) {
      setInkStyle(null);
      return;
    }
    const measure = () => {
      const { offsetLeft, offsetWidth: width } = active;
      // The ink starts at the right edge of the list in RTL.
      const left =
        direction === 'rtl'
          ? offsetLeft + width - list.clientWidth
          : offsetLeft;
      setInkStyle((previous) =>
        previous?.left === left && previous.width === width
          ? previous
          : { left, width },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    for (const tab of list.querySelectorAll('[data-tao-tab]')) {
      observer.observe(tab);
    }
    return () => observer.disconnect();
  }, [currentKey, direction, variant, items]);

  // Keyboard nav
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.defaultPrevented || !e.currentTarget.contains(e.target as Node))
        return;
      const enabledItems = items.filter((t) => !t.disabled);
      if (enabledItems.length === 0) return;
      const focusedKey =
        (e.target as HTMLElement)
          .closest('[data-tao-tab-key]')
          ?.getAttribute('data-tao-tab-key') ?? focusKey;
      const idx = enabledItems.findIndex((item) => item.key === focusedKey);
      let next: TabItem | undefined;

      const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
      if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) {
        e.preventDefault();
        next = enabledItems[(idx + 1) % enabledItems.length];
      } else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) {
        e.preventDefault();
        next =
          enabledItems[(idx - 1 + enabledItems.length) % enabledItems.length];
      } else if (e.key === 'Home') {
        e.preventDefault();
        next = enabledItems[0];
      } else if (e.key === 'End') {
        e.preventDefault();
        next = enabledItems[enabledItems.length - 1];
      }

      if (next) {
        handleSelect(next.key);
        // Focus the new tab button
        const list = tablistRef.current;
        const btn = list?.querySelector<HTMLElement>(
          `[data-tao-tab-key="${CSS.escape(next.key)}"]`,
        );
        btn?.focus();
      }
    },
    [items, focusKey, handleSelect],
  );

  return (
    <div
      data-tao-tabs=""
      data-tao-variant={variant}
      data-tao-size={resolvedSize}
      className={cx(classNames?.root, className)}
      style={styles?.root}
    >
      <div
        data-tao-tabs-nav=""
        className={cx(classNames?.nav)}
        style={styles?.nav}
      >
        <div
          ref={listRef}
          role="tablist"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          data-tao-tabs-list=""
          onBlur={(event) => {
            if (
              !(event.relatedTarget instanceof Node) ||
              !event.currentTarget.contains(event.relatedTarget)
            ) {
              setFocusedKey(undefined);
            }
          }}
          onKeyDown={handleKeyDown}
        >
          {items.map((item) => {
            const isActive = item.key === currentKey;
            const tabId = getItemId('tab', item.key);
            const panelId = getItemId('panel', item.key);
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                id={tabId}
                aria-selected={isActive}
                aria-controls={
                  !destroyInactiveTabPane || isActive ? panelId : undefined
                }
                aria-disabled={item.disabled || undefined}
                tabIndex={!item.disabled && item.key === focusKey ? 0 : -1}
                data-tao-tab=""
                data-tao-tab-key={item.key}
                data-tao-active={isActive || undefined}
                data-tao-disabled={item.disabled || undefined}
                disabled={item.disabled}
                onFocus={(event) => {
                  if (event.currentTarget.contains(event.target))
                    setFocusedKey(item.key);
                }}
                onClick={(event) => {
                  if (event.currentTarget.contains(event.target as Node))
                    handleSelect(item.key);
                }}
                className={cx(classNames?.tab)}
                style={styles?.tab}
              >
                {item.label}
              </button>
            );
          })}
          {variant === 'line' && inkStyle && (
            <span
              data-tao-tabs-ink=""
              style={{
                transform: `translateX(${inkStyle.left}px) scaleX(${inkStyle.width})`,
                transformOrigin:
                  direction === 'rtl' ? 'right center' : undefined,
                ...styles?.indicator,
              }}
              className={cx(classNames?.indicator)}
            />
          )}
        </div>
      </div>

      {items.map((item) => {
        const isActive = item.key === currentKey;
        const tabId = getItemId('tab', item.key);
        const panelId = getItemId('panel', item.key);
        if (destroyInactiveTabPane && !isActive) return null;
        return (
          <div
            key={item.key}
            role="tabpanel"
            tabIndex={isActive ? 0 : -1}
            id={panelId}
            aria-labelledby={tabId}
            hidden={!isActive}
            data-tao-tabs-panel=""
            data-tao-active={isActive || undefined}
            className={cx(classNames?.panel)}
            style={styles?.panel}
          >
            {item.children}
          </div>
        );
      })}
    </div>
  );
}
