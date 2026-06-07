import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { type TaoSize, useTaoConfig } from '../../provider/tao-provider';
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

export interface TabsProps {
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
}: TabsProps) {
  const ctx = useTaoConfig();
  const resolvedSize = size ?? ctx.size;

  // Controlled / uncontrolled
  const isControlled = activeKeyProp !== undefined;
  const firstEnabledKey =
    items.find((t) => !t.disabled)?.key ?? items[0]?.key ?? '';
  const [internalKey, setInternalKey] = useState(
    defaultActiveKey ?? firstEnabledKey,
  );
  const currentKey = isControlled ? activeKeyProp : internalKey;

  const handleSelect = useCallback(
    (key: string) => {
      if (!isControlled) setInternalKey(key);
      onChange?.(key);
    },
    [isControlled, onChange],
  );

  // Ink bar (line variant)
  const tablistRef = useRef<HTMLDivElement>(null);
  const [inkStyle, setInkStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (variant !== 'line') return;
    const list = tablistRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>(
      `[data-tao-tab-key="${CSS.escape(currentKey)}"]`,
    );
    if (active) {
      setInkStyle({ left: active.offsetLeft, width: active.offsetWidth });
    }
  }, [currentKey, variant, items]);

  // Keyboard nav
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const enabledItems = items.filter((t) => !t.disabled);
      const idx = enabledItems.findIndex((t) => t.key === currentKey);
      let next: TabItem | undefined;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        next = enabledItems[(idx + 1) % enabledItems.length];
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
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
    [items, currentKey, handleSelect],
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
          ref={tablistRef}
          role="tablist"
          data-tao-tabs-list=""
          onKeyDown={handleKeyDown}
        >
          {items.map((item) => {
            const isActive = item.key === currentKey;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${item.key}`}
                aria-disabled={item.disabled || undefined}
                tabIndex={isActive ? 0 : -1}
                data-tao-tab=""
                data-tao-tab-key={item.key}
                data-tao-active={isActive || undefined}
                data-tao-disabled={item.disabled || undefined}
                disabled={item.disabled}
                onClick={() => handleSelect(item.key)}
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
                left: inkStyle.left,
                width: inkStyle.width,
                ...styles?.indicator,
              }}
              className={cx(classNames?.indicator)}
            />
          )}
        </div>
      </div>

      {items.map((item) => {
        const isActive = item.key === currentKey;
        if (destroyInactiveTabPane && !isActive) return null;
        return (
          <div
            key={item.key}
            role="tabpanel"
            id={`tabpanel-${item.key}`}
            aria-labelledby={item.key}
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
