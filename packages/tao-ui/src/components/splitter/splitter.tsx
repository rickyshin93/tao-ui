import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './splitter.css';

// ---- Types ----

export type SplitterSemanticPart = 'root' | 'panel' | 'dragger';

export interface SplitterPanelProps {
  defaultSize?: number | string;
  size?: number | string;
  min?: number | string;
  max?: number | string;
  collapsible?: boolean | { start?: boolean; end?: boolean };
  resizable?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export interface SplitterProps {
  orientation?: 'horizontal' | 'vertical';
  onResize?: (sizes: number[]) => void;
  onResizeEnd?: (sizes: number[]) => void;
  onResizeStart?: (sizes: number[]) => void;
  className?: string;
  classNames?: SemanticClassNames<SplitterSemanticPart>;
  styles?: SemanticStyles<SplitterSemanticPart>;
  children: ReactNode;
}

// ---- Helpers ----

function parseSize(
  value: number | string | undefined,
  total: number,
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  if (value.endsWith('%')) return (parseFloat(value) / 100) * total;
  return parseFloat(value);
}

function allocateSizes(
  panels: SplitterPanelProps[],
  previous: number[],
  available: number,
): number[] {
  const initialized = previous.length === panels.length;
  const desired = panels.map(
    (panel, i) =>
      parseSize(panel.size, available) ??
      (initialized ? previous[i] : parseSize(panel.defaultSize, available)),
  );
  const unspecified = desired.filter((size) => size === undefined).length;
  const remaining = Math.max(
    0,
    available - desired.reduce<number>((sum, size) => sum + (size ?? 0), 0),
  );
  const weights = desired.map((size) => size ?? remaining / unspecified);
  const bounds = panels.map((panel, i) => {
    const fixed = panel.size !== undefined;
    const collapsed = !fixed && panel.collapsible && weights[i] === 0;
    const min = collapsed
      ? 0
      : Math.max(0, parseSize(panel.min, available) ?? 0);
    const max = collapsed
      ? 0
      : Math.max(min, parseSize(panel.max, available) ?? Infinity);
    return { fixed, min, max };
  });
  const fixedTotal = weights.reduce(
    (sum, size, i) => sum + (bounds[i].fixed ? size : 0),
    0,
  );
  const flexibleTotal = weights.reduce(
    (sum, size, i) => sum + (bounds[i].fixed ? 0 : size),
    0,
  );
  const flexibleCount = bounds.filter((bound) => !bound.fixed).length;
  const flexibleSpace = Math.max(0, available - fixedTotal);
  const next = weights.map((size, i) => {
    if (bounds[i].fixed) return size;
    const share = flexibleTotal > 0 ? size / flexibleTotal : 1 / flexibleCount;
    return Math.max(
      bounds[i].min,
      Math.min(bounds[i].max, flexibleSpace * share),
    );
  });

  // Each incomplete pass exhausts at least one panel's capacity.
  for (let pass = 0; pass < panels.length; pass++) {
    const delta = available - next.reduce((sum, size) => sum + size, 0);
    if (Math.abs(delta) < 0.001) break;
    const adjustable = bounds
      .map((_, i) => i)
      .filter(
        (i) =>
          !bounds[i].fixed &&
          (delta > 0 ? next[i] < bounds[i].max : next[i] > bounds[i].min),
      );
    if (adjustable.length === 0) break;
    const totalWeight = adjustable.reduce((sum, i) => sum + weights[i], 0);
    for (const i of adjustable) {
      const share =
        totalWeight > 0 ? weights[i] / totalWeight : 1 / adjustable.length;
      next[i] = Math.max(
        bounds[i].min,
        Math.min(bounds[i].max, next[i] + delta * share),
      );
    }
  }
  return next;
}

// ---- Icons ----

function CollapseIcon({
  direction,
}: {
  direction: 'start' | 'end';
  orientation: 'horizontal' | 'vertical';
}) {
  // Simple chevron — rotated via CSS
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-tao-collapse-direction={direction}
    >
      <path
        d="M7.5 2.5L4 6l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---- Splitter.Panel ----

export function Panel(_props: SplitterPanelProps): ReactNode {
  // Rendered by Splitter parent, not standalone
  return null;
}

// ---- Splitter ----

export function Splitter({
  orientation = 'horizontal',
  onResize,
  onResizeEnd,
  onResizeStart,
  className,
  classNames,
  styles,
  children,
}: SplitterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { panels, panelChildren } = useMemo(() => {
    const nextPanels: SplitterPanelProps[] = [];
    const nextPanelChildren: ReactNode[] = [];
    const childArray = Array.isArray(children) ? children : [children];

    for (const child of childArray) {
      if (child && typeof child === 'object' && 'type' in child) {
        const panelChild = child as {
          type?: unknown;
          props?: SplitterPanelProps;
        };

        if (panelChild.type === Panel && panelChild.props) {
          nextPanels.push(panelChild.props);
          nextPanelChildren.push(panelChild.props.children);
        }
      }
    }

    return { panels: nextPanels, panelChildren: nextPanelChildren };
  }, [children]);

  const panelCount = panels.length;
  const isHorizontal = orientation === 'horizontal';

  // ---- Size state ----
  const [sizes, setSizes] = useState<number[]>([]);
  const [containerSize, setContainerSize] = useState(0);

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const total = isHorizontal
        ? entry.contentRect.width
        : entry.contentRect.height;
      setContainerSize(total);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isHorizontal]);

  useEffect(() => {
    if (containerSize <= 0 || panelCount === 0) return;
    const available = Math.max(0, containerSize - (panelCount - 1));
    const next = allocateSizes(panels, sizes, available);
    if (
      next.length !== sizes.length ||
      next.some((size, i) => Math.abs(size - sizes[i]) > 0.001)
    ) {
      setSizes(next);
    }
  }, [containerSize, panelCount, panels, sizes]);

  // ---- Drag logic ----
  const dragCleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => dragCleanup.current?.(), []);

  const resizePanels = useCallback(
    (index: number, delta: number, startSizes: number[]) => {
      const draggerSpace = (panelCount - 1) * 1;
      const available = containerSize - draggerSpace;
      const leftIdx = index;
      const rightIdx = index + 1;
      const leftMin = parseSize(panels[leftIdx].min, available) ?? 0;
      const leftMax = parseSize(panels[leftIdx].max, available);
      const rightMin = parseSize(panels[rightIdx].min, available) ?? 0;
      const rightMax = parseSize(panels[rightIdx].max, available);
      const total = startSizes[leftIdx] + startSizes[rightIdx];
      let newLeft = startSizes[leftIdx] + delta;

      newLeft = Math.max(newLeft, leftMin);
      if (leftMax !== undefined) newLeft = Math.min(newLeft, leftMax);
      if (rightMin !== undefined) newLeft = Math.min(newLeft, total - rightMin);
      if (rightMax !== undefined) newLeft = Math.max(newLeft, total - rightMax);
      newLeft = Math.max(0, Math.min(newLeft, total));

      const next = [...startSizes];
      next[leftIdx] = newLeft;
      next[rightIdx] = total - newLeft;
      return next;
    },
    [containerSize, panelCount, panels],
  );

  const handleDragStart = useCallback(
    (index: number, e: React.PointerEvent) => {
      e.preventDefault();
      dragCleanup.current?.();
      const pos = isHorizontal ? e.clientX : e.clientY;
      const pointerId = e.pointerId;
      const sign =
        isHorizontal &&
        getComputedStyle(containerRef.current!).direction === 'rtl'
          ? -1
          : 1;
      const startSizes = [...sizes];
      let currentSizes = startSizes;
      onResizeStart?.(sizes);

      const handleMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        const delta = ((isHorizontal ? ev.clientX : ev.clientY) - pos) * sign;

        const next = resizePanels(index, delta, startSizes);
        currentSizes = next;

        setSizes(next);
        onResize?.(next);
      };

      const cleanup = () => {
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', handleEnd);
        document.removeEventListener('pointercancel', handleEnd);
        dragCleanup.current = null;
      };
      const handleEnd = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        cleanup();
        onResizeEnd?.(currentSizes);
      };
      dragCleanup.current = cleanup;

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointerup', handleEnd);
      document.addEventListener('pointercancel', handleEnd);
    },
    [isHorizontal, sizes, onResize, onResizeEnd, onResizeStart, resizePanels],
  );

  const handleDraggerKeyDown = useCallback(
    (index: number, event: React.KeyboardEvent<HTMLDivElement>) => {
      const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
      const growKey = isHorizontal
        ? rtl
          ? 'ArrowLeft'
          : 'ArrowRight'
        : 'ArrowDown';
      const shrinkKey = isHorizontal
        ? rtl
          ? 'ArrowRight'
          : 'ArrowLeft'
        : 'ArrowUp';
      if (event.key !== growKey && event.key !== shrinkKey) return;
      event.preventDefault();
      const delta = event.key === growKey ? 10 : -10;
      onResizeStart?.(sizes);
      const next = resizePanels(index, delta, sizes);
      setSizes(next);
      onResize?.(next);
      onResizeEnd?.(next);
    },
    [isHorizontal, onResize, onResizeEnd, onResizeStart, resizePanels, sizes],
  );

  // ---- Collapse ----
  const handleCollapse = useCallback(
    (index: number, direction: 'start' | 'end') => {
      const draggerSpace = (panelCount - 1) * 1;
      const available = containerSize - draggerSpace;

      const targetIdx = direction === 'start' ? index : index + 1;
      const adjacentIdx = direction === 'start' ? index + 1 : index;

      setSizes((prev) => {
        const next = [...prev];
        const isCollapsed = next[targetIdx] <= 0;

        if (isCollapsed) {
          // Expand to default or equal split
          const def = parseSize(panels[targetIdx].defaultSize, available);
          const expandTo = def ?? available / panelCount;
          const take = Math.min(expandTo, next[adjacentIdx]);
          next[targetIdx] = take;
          next[adjacentIdx] -= take;
        } else {
          // Collapse
          next[adjacentIdx] += next[targetIdx];
          next[targetIdx] = 0;
        }

        onResize?.(next);
        onResizeEnd?.(next);
        return next;
      });
    },
    [panelCount, containerSize, panels, onResize, onResizeEnd],
  );

  // ---- Collapsible config for each dragger ----
  function getDraggerCollapse(index: number): { start: boolean; end: boolean } {
    const leftPanel = panels[index];
    const rightPanel = panels[index + 1];

    let startCollapsible = false;
    let endCollapsible = false;

    if (leftPanel.collapsible === true) startCollapsible = true;
    else if (typeof leftPanel.collapsible === 'object') {
      if (leftPanel.collapsible.end) startCollapsible = true;
    }

    if (rightPanel.collapsible === true) endCollapsible = true;
    else if (typeof rightPanel.collapsible === 'object') {
      if (rightPanel.collapsible.start) endCollapsible = true;
    }

    return { start: startCollapsible, end: endCollapsible };
  }

  // ---- Render ----
  if (sizes.length !== panelCount) {
    return (
      <div
        ref={containerRef}
        data-tao-splitter=""
        data-tao-orientation={orientation}
        className={cx(classNames?.root, className)}
        style={styles?.root}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      data-tao-splitter=""
      data-tao-orientation={orientation}
      className={cx(classNames?.root, className)}
      style={styles?.root}
    >
      {panels.map((panel, i) => {
        const sizeStyle = isHorizontal
          ? { width: sizes[i], flexShrink: 0, flexGrow: 0 }
          : { height: sizes[i], flexShrink: 0, flexGrow: 0 };
        const isCollapsed = sizes[i] <= 0;
        const draggerResizable =
          i < panelCount - 1 &&
          (panel.resizable ?? true) &&
          (panels[i + 1]?.resizable ?? true);
        const available = containerSize - (panelCount - 1);
        const pairSize = sizes[i] + (sizes[i + 1] ?? 0);
        const valueMin = parseSize(panel.min, available) ?? 0;
        const nextMin = parseSize(panels[i + 1]?.min, available) ?? 0;
        const valueMax = Math.min(
          parseSize(panel.max, available) ?? pairSize,
          pairSize - nextMin,
        );

        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: Splitter panels are positional layout slots; their order defines resize handles.
          <div key={i} style={{ display: 'contents' }}>
            <div
              data-tao-splitter-panel=""
              data-tao-collapsed={isCollapsed || undefined}
              className={cx(classNames?.panel, panel.className)}
              style={{ ...sizeStyle, ...styles?.panel, ...panel.style }}
            >
              {panelChildren[i]}
            </div>
            {i < panelCount - 1 && (
              // biome-ignore lint/a11y/useSemanticElements: an interactive splitter separator needs a focusable div with drag handlers.
              <div
                data-tao-splitter-dragger=""
                data-tao-orientation={orientation}
                role="separator"
                aria-label={`Resize panels ${i + 1} and ${i + 2}`}
                aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
                aria-valuemin={Math.round(valueMin)}
                aria-valuemax={Math.round(valueMax)}
                aria-valuenow={Math.round(sizes[i])}
                tabIndex={draggerResizable ? 0 : undefined}
                className={cx(classNames?.dragger)}
                style={styles?.dragger}
                onPointerDown={(e) => {
                  if (draggerResizable) {
                    handleDragStart(i, e);
                  }
                }}
                onKeyDown={(event) => {
                  if (draggerResizable) handleDraggerKeyDown(i, event);
                }}
              >
                <div data-tao-splitter-dragger-bar="" />
                {(() => {
                  const { start, end } = getDraggerCollapse(i);
                  return (
                    <>
                      {start && (
                        <button
                          type="button"
                          data-tao-splitter-collapse=""
                          data-tao-collapse-direction="start"
                          data-tao-orientation={orientation}
                          aria-label="Collapse panel"
                          onClick={() => handleCollapse(i, 'start')}
                        >
                          <CollapseIcon
                            direction={sizes[i] <= 0 ? 'end' : 'start'}
                            orientation={orientation}
                          />
                        </button>
                      )}
                      {end && (
                        <button
                          type="button"
                          data-tao-splitter-collapse=""
                          data-tao-collapse-direction="end"
                          data-tao-orientation={orientation}
                          aria-label="Collapse panel"
                          onClick={() => handleCollapse(i, 'end')}
                        >
                          <CollapseIcon
                            direction={sizes[i + 1] <= 0 ? 'start' : 'end'}
                            orientation={orientation}
                          />
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

Splitter.Panel = Panel;
