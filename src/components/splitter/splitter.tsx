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
  const initialized = useRef(false);

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

  // Initialize sizes
  useEffect(() => {
    if (containerSize <= 0 || panelCount === 0) return;
    if (initialized.current && sizes.length === panelCount) return;

    const draggerSpace = (panelCount - 1) * 1; // dragger width (1px line)
    const available = containerSize - draggerSpace;

    const newSizes: number[] = [];
    let allocated = 0;
    let unspecified = 0;

    for (let i = 0; i < panelCount; i++) {
      const p = panels[i];
      const controlled =
        p.size !== undefined ? parseSize(p.size, available) : undefined;
      const def =
        p.defaultSize !== undefined
          ? parseSize(p.defaultSize, available)
          : undefined;
      const s = controlled ?? def;
      if (s !== undefined) {
        newSizes.push(s);
        allocated += s;
      } else {
        newSizes.push(-1); // placeholder
        unspecified++;
      }
    }

    const remaining = Math.max(0, available - allocated);
    const perUnspecified = unspecified > 0 ? remaining / unspecified : 0;

    for (let i = 0; i < newSizes.length; i++) {
      if (newSizes[i] < 0) newSizes[i] = perUnspecified;
    }

    setSizes(newSizes);
    initialized.current = true;
  }, [containerSize, panelCount, panels, sizes.length]);

  // Sync controlled sizes
  useEffect(() => {
    if (!initialized.current || sizes.length !== panelCount) return;
    const draggerSpace = (panelCount - 1) * 1;
    const available = containerSize - draggerSpace;

    let changed = false;
    const next = [...sizes];
    for (let i = 0; i < panelCount; i++) {
      const controlled =
        panels[i].size !== undefined
          ? parseSize(panels[i].size, available)
          : undefined;
      if (controlled !== undefined && Math.abs(controlled - next[i]) > 0.5) {
        next[i] = controlled;
        changed = true;
      }
    }
    if (changed) setSizes(next);
  }, [containerSize, panelCount, panels, sizes]);

  // ---- Drag logic ----
  const dragging = useRef<{
    index: number;
    startPos: number;
    startSizes: number[];
  } | null>(null);

  const handleDragStart = useCallback(
    (index: number, e: React.PointerEvent) => {
      e.preventDefault();
      const pos = isHorizontal ? e.clientX : e.clientY;
      dragging.current = { index, startPos: pos, startSizes: [...sizes] };
      onResizeStart?.(sizes);

      const handleMove = (ev: PointerEvent) => {
        if (!dragging.current) return;
        const { index: idx, startPos, startSizes } = dragging.current;
        const delta = (isHorizontal ? ev.clientX : ev.clientY) - startPos;

        const draggerSpace = (panelCount - 1) * 1;
        const available = containerSize - draggerSpace;

        const leftIdx = idx;
        const rightIdx = idx + 1;

        const leftMin = parseSize(panels[leftIdx].min, available) ?? 0;
        const leftMax = parseSize(panels[leftIdx].max, available);
        const rightMin = parseSize(panels[rightIdx].min, available) ?? 0;
        const rightMax = parseSize(panels[rightIdx].max, available);

        let newLeft = startSizes[leftIdx] + delta;
        let newRight = startSizes[rightIdx] - delta;

        // Clamp delta by both panels' constraints
        const total = startSizes[leftIdx] + startSizes[rightIdx];

        // Left panel constraints → bound newLeft
        if (leftMin !== undefined) newLeft = Math.max(newLeft, leftMin);
        if (leftMax !== undefined) newLeft = Math.min(newLeft, leftMax);
        newLeft = Math.max(0, newLeft);

        // Right panel constraints → bound newLeft from the other side
        if (rightMin !== undefined)
          newLeft = Math.min(newLeft, total - rightMin);
        if (rightMax !== undefined)
          newLeft = Math.max(newLeft, total - rightMax);
        newLeft = Math.max(0, Math.min(newLeft, total));

        newRight = total - newLeft;

        const next = [...startSizes];
        next[leftIdx] = newLeft;
        next[rightIdx] = newRight;

        setSizes(next);
        onResize?.(next);
      };

      const handleUp = () => {
        if (dragging.current) {
          dragging.current = null;
          document.removeEventListener('pointermove', handleMove);
          document.removeEventListener('pointerup', handleUp);
          setSizes((cur) => {
            onResizeEnd?.(cur);
            return cur;
          });
        }
      };

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointerup', handleUp);
    },
    [
      isHorizontal,
      sizes,
      panelCount,
      containerSize,
      panels,
      onResize,
      onResizeEnd,
      onResizeStart,
    ],
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
              <div
                data-tao-splitter-dragger=""
                data-tao-orientation={orientation}
                className={cx(classNames?.dragger)}
                style={styles?.dragger}
                onPointerDown={(e) => {
                  if (
                    (panel.resizable ?? true) &&
                    (panels[i + 1]?.resizable ?? true)
                  ) {
                    handleDragStart(i, e);
                  }
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
