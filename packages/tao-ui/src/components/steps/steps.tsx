import {
  type CSSProperties,
  type KeyboardEvent,
  type Key,
  type MouseEvent,
  type ReactNode,
  createContext,
  useContext,
  useMemo,
} from 'react';
import { type TaoSize, useTaoConfig } from '../../provider/tao-provider';
import { useBreakpoint } from '../../utils/breakpoint';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Tooltip } from '../tooltip/tooltip';
import { PanelArrow, StepCheckIcon, StepCloseIcon } from './steps-icons';
import { type DisplayStep, useDisplaySteps } from './use-display-steps';
import './steps.css';

// ---- Types ----

export type StepsStatus = 'wait' | 'process' | 'finish' | 'error';
export type StepsType = 'default' | 'dot' | 'inline' | 'navigation' | 'panel';
export type StepsOrientation = 'horizontal' | 'vertical';
export type StepsTitlePlacement = 'horizontal' | 'vertical';
export type StepsVariant = 'filled' | 'outlined';
/** Steps renders at `small` or `medium` only — antd has no `large` step size. */
export type StepsSize = Exclude<TaoSize, 'large'>;

export type StepsSemanticPart =
  | 'root'
  | 'item'
  | 'itemWrapper'
  | 'itemIcon'
  | 'itemSection'
  | 'itemHeader'
  | 'itemTitle'
  | 'itemSubtitle'
  | 'itemContent'
  | 'itemRail';

/** Per-step overrides — every part except the Steps-level `root`. */
export type StepsItemSemanticPart = Exclude<StepsSemanticPart, 'root'>;

export interface StepItem {
  key?: Key;
  /** Primary label. */
  title?: ReactNode;
  /** Secondary label shown next to (or under) the title. */
  subTitle?: ReactNode;
  /** Supporting copy shown under the header. */
  content?: ReactNode;
  /** Replaces the generated number / status glyph. */
  icon?: ReactNode;
  /** Overrides the status derived from `current`. */
  status?: StepsStatus;
  /** Blocks clicking and dims the step. */
  disabled?: boolean;
  /** Per-step click handler; runs in addition to `Steps` `onChange`. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<StepsItemSemanticPart>;
  styles?: SemanticStyles<StepsItemSemanticPart>;
}

/** The icon container handed to `iconRender` through `info.components.Icon`. */
export type StepsIconComponent = (props: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) => ReactNode;

export interface StepsIconRenderInfo {
  /** Zero-based absolute step index (includes `initial`). */
  index: number;
  /** Whether this is the current step. */
  active: boolean;
  /** The resolved step, with `content` filled in. */
  item: StepItem;
  components: { Icon: StepsIconComponent };
}

export type StepsIconRender = (
  originNode: ReactNode,
  info: StepsIconRenderInfo,
) => ReactNode;

export interface StepsProps {
  /** Step data. */
  items?: StepItem[];
  /** Current step, counted from 0. Overridden per step by `items.status`. */
  current?: number;
  /** Numbering offset — the first step is numbered `initial + 1`. */
  initial?: number;
  /** Status of the `current` step; the others derive theirs from position. */
  status?: StepsStatus;
  /** Layout axis. */
  orientation?: StepsOrientation;
  /** Where the title sits relative to the icon. */
  titlePlacement?: StepsTitlePlacement;
  /** Collapse to `vertical` below 576px. */
  responsive?: boolean;
  /** Visual density. */
  size?: StepsSize;
  /** Style variant. */
  variant?: StepsVariant;
  /** Steps flavour. */
  type?: StepsType;
  /** Progress ring on the `process` icon; ignored by `type="inline"`. */
  percent?: number;
  /** Collapse to at most N steps (`>= 3`); hidden ranges become an ellipsis step. */
  maxCount?: number;
  /** Leading flex offset for `type="inline"`. */
  offset?: number;
  /** Truncate overflowing titles, subtitles, and content. */
  ellipsis?: boolean;
  /** Replace the icon node of every step. */
  iconRender?: StepsIconRender;
  /** Fires with the absolute step index when a non-current step is activated. */
  onChange?: (current: number) => void;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<StepsSemanticPart>;
  styles?: SemanticStyles<StepsSemanticPart>;
}

// ---- Semantic contexts ----
// The icon element is handed to consumers through `iconRender`, which means it
// cannot be defined inside the render loop without remounting on every pass.
// Contexts keep it a stable component while still resolving both root-level and
// per-step semantic overrides.

const StepsSemanticContext = createContext<{
  classNames?: SemanticClassNames<StepsSemanticPart>;
  styles?: SemanticStyles<StepsSemanticPart>;
}>({});

const StepsItemSemanticContext = createContext<{
  classNames?: SemanticClassNames<StepsItemSemanticPart>;
  styles?: SemanticStyles<StepsItemSemanticPart>;
}>({});

// ---- Internal parts ----

function StepIcon({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const { classNames, styles } = useContext(StepsSemanticContext);
  const item = useContext(StepsItemSemanticContext);

  return (
    <div
      data-tao-step-icon=""
      className={cx(classNames?.itemIcon, item.classNames?.itemIcon, className)}
      style={{ ...styles?.itemIcon, ...item.styles?.itemIcon, ...style }}
    >
      {children}
    </div>
  );
}

/**
 * Progress ring drawn around the `process` icon. Geometry lives in CSS so it
 * tracks the theme's icon size; only the arc length is computed here.
 */
function ProgressIcon({
  percent,
  children,
}: {
  percent: number;
  children?: ReactNode;
}) {
  const dashArray = `calc(var(--tao-steps-progress-radius) * 2 * ${
    (Math.PI * percent) / 100
  }) 9999`;

  return (
    <>
      <svg
        data-tao-steps-progress=""
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <circle data-tao-steps-progress-rail="" />
        <circle
          data-tao-steps-progress-ptg=""
          strokeDasharray={dashArray}
          transform="rotate(-90 50 50)"
        />
      </svg>
      {children}
    </>
  );
}

/**
 * Resolve each visible step's status. An explicit `items[].status` always wins;
 * otherwise the current step takes `status` and its neighbours derive `finish`
 * before it / `wait` after it (antd's rc-steps rule).
 */
function resolveStatuses(
  displaySteps: DisplayStep[],
  displayCurrent: number,
  currentStatus: StepsStatus,
): StepsStatus[] {
  return displaySteps.map((step, index) => {
    if (step.item.status) return step.item.status;
    if (index === displayCurrent) return currentStatus;
    return index < displayCurrent ? 'finish' : 'wait';
  });
}

// ---- Steps ----

export function Steps({
  items,
  current = 0,
  initial = 0,
  status = 'process',
  orientation,
  titlePlacement,
  responsive = true,
  size,
  variant = 'filled',
  type,
  percent,
  maxCount,
  offset = 0,
  ellipsis = false,
  iconRender,
  onChange,
  className,
  style,
  classNames,
  styles,
}: StepsProps) {
  const { size: contextSize } = useTaoConfig();
  const screens = useBreakpoint();

  // `large` is not part of the Steps API — fall back to `medium`.
  const resolvedSize: StepsSize =
    size ?? (contextSize === 'large' ? 'medium' : contextSize);

  const mergedItems = useMemo(() => (items ?? []).filter(Boolean), [items]);

  // ============================= Layout =============================
  const mergedType: StepsType = type ?? 'default';
  const isInline = mergedType === 'inline';
  const isDot = mergedType === 'dot' || isInline;
  const isPanel = mergedType === 'panel';

  // Panels are a horizontal-only construct; `responsive` collapses the rest.
  const mergedOrientation: StepsOrientation = isPanel
    ? 'horizontal'
    : orientation === 'vertical' || (responsive && screens.xs === true)
      ? 'vertical'
      : 'horizontal';

  // Dots and vertical steps pin their own title axis; navigation is always
  // side-by-side. Only plain horizontal steps honour the prop.
  const mergedTitlePlacement: StepsTitlePlacement =
    isDot || mergedOrientation === 'vertical'
      ? mergedOrientation === 'vertical'
        ? 'horizontal'
        : 'vertical'
      : mergedType === 'navigation'
        ? 'horizontal'
        : (titlePlacement ?? 'horizontal');

  // Inline steps surface content in a tooltip, so the ring has nowhere to go.
  const mergedPercent = isInline ? undefined : percent;

  // ============================== Data ==============================
  const { canApplyMaxCount, displaySteps, displayCurrent } = useDisplaySteps(
    mergedItems,
    current,
    initial,
    maxCount,
  );

  const statuses = useMemo(
    () => resolveStatuses(displaySteps, displayCurrent, status),
    [displaySteps, displayCurrent, status],
  );

  const semanticValue = useMemo(
    () => ({ classNames, styles }),
    [classNames, styles],
  );

  // ============================= Events =============================
  // `onChange` only fires for a step that is not already current (antd parity).
  const handleStepClick = (displayIndex: number) => {
    const target = displaySteps[displayIndex];
    if (!onChange || !target || target.originIndex < 0) return;
    const next = initial + target.originIndex;
    if (next !== current) onChange(next);
  };

  // ============================= Render =============================
  // The inline offset travels as a custom property. It is layered first so a
  // consumer's `style` / `styles.root` can still override it.
  const rootStyle = {
    '--tao-steps-items-offset': String(isInline ? offset : 0),
    ...styles?.root,
    ...style,
  } as CSSProperties;

  return (
    <div
      data-tao-steps=""
      data-tao-orientation={mergedOrientation}
      data-tao-title-placement={mergedTitlePlacement}
      data-tao-type={mergedType}
      data-tao-variant={variant}
      data-tao-size={resolvedSize}
      data-tao-ellipsis={ellipsis || undefined}
      data-tao-max-count={canApplyMaxCount || undefined}
      data-tao-with-progress={mergedPercent !== undefined || undefined}
      className={cx(classNames?.root, className)}
      style={rootStyle}
    >
      <StepsSemanticContext.Provider value={semanticValue}>
        {displaySteps.map((displayStep, displayIndex) => {
          const { item, originIndex, ellipsis: isEllipsisStep } = displayStep;
          const stepStatus = statuses[displayIndex];
          const nextStatus = statuses[displayIndex + 1];
          const isLast = displayIndex === displaySteps.length - 1;
          const active = displayIndex === displayCurrent;
          const stepIndex = originIndex >= 0 ? initial + originIndex : displayIndex;

          const hasTitle = item.title !== undefined && item.title !== null;
          const hasSubTitle =
            item.subTitle !== undefined && item.subTitle !== null;
          const hasContent = item.content !== undefined && item.content !== null;

          const itemClassNames = item.classNames;
          const itemStyles = item.styles;

          const clickable =
            (!!onChange || !!item.onClick) && !item.disabled && !isEllipsisStep;

          // ---------------------------- Icon ----------------------------
          let iconContent: ReactNode = null;

          if (isDot || item.icon) {
            // Dot steps render the dot itself; custom icons render as-is.
            iconContent = item.icon;
          } else if (stepStatus === 'finish') {
            iconContent = <StepCheckIcon />;
          } else if (stepStatus === 'error') {
            iconContent = <StepCloseIcon />;
          } else {
            let numberNode: ReactNode = (
              <span data-tao-steps-icon-number="">{stepIndex + 1}</span>
            );

            if (stepStatus === 'process' && mergedPercent !== undefined) {
              numberNode = (
                <ProgressIcon percent={mergedPercent}>{numberNode}</ProgressIcon>
              );
            }

            iconContent = numberNode;
          }

          // biome-ignore lint/correctness/useJsxKeyInIterable: this node is rendered as a nested child of the item, not as an array element — the loop's key lives on the item itself.
          let iconNode: ReactNode = <StepIcon>{iconContent}</StepIcon>;

          if (iconRender) {
            iconNode = iconRender(iconNode, {
              index: stepIndex,
              active,
              item,
              components: { Icon: StepIcon },
            });
          }

          const accessibilityProps = clickable
            ? {
                role: 'button' as const,
                tabIndex: 0,
                onClick: (event: MouseEvent<HTMLElement>) => {
                  item.onClick?.(event);
                  handleStepClick(displayIndex);
                },
                onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.currentTarget.click();
                  }
                },
              }
            : {};

          const itemKey =
            originIndex >= 0 ? `step-${initial + originIndex}` : (item.key as Key);

          const stepNode = (
            <div
              key={itemKey}
              {...accessibilityProps}
              data-tao-step=""
              data-tao-status={stepStatus}
              data-tao-active={active || undefined}
              data-tao-disabled={item.disabled || undefined}
              data-tao-custom={item.icon ? true : undefined}
              data-tao-empty-header={!hasTitle && !hasSubTitle ? true : undefined}
              data-tao-ellipsis={isEllipsisStep || undefined}
              aria-current={active ? 'step' : undefined}
              className={cx(
                classNames?.item,
                itemClassNames?.item,
                item.className,
              )}
              style={{
                ...styles?.item,
                ...itemStyles?.item,
                ...item.style,
              }}
            >
              <StepsItemSemanticContext.Provider
                value={{ classNames: itemClassNames, styles: itemStyles }}
              >
                <div
                  data-tao-step-wrapper=""
                  className={cx(
                    classNames?.itemWrapper,
                    itemClassNames?.itemWrapper,
                  )}
                  style={{
                    ...styles?.itemWrapper,
                    ...itemStyles?.itemWrapper,
                  }}
                >
                  {iconNode}
                  <div
                    data-tao-step-section=""
                    className={cx(
                      classNames?.itemSection,
                      itemClassNames?.itemSection,
                    )}
                    style={{
                      ...styles?.itemSection,
                      ...itemStyles?.itemSection,
                    }}
                  >
                    <div
                      data-tao-step-header=""
                      className={cx(
                        classNames?.itemHeader,
                        itemClassNames?.itemHeader,
                      )}
                      style={{
                        ...styles?.itemHeader,
                        ...itemStyles?.itemHeader,
                      }}
                    >
                      {hasTitle && (
                        <div
                          data-tao-step-title=""
                          className={cx(
                            classNames?.itemTitle,
                            itemClassNames?.itemTitle,
                          )}
                          style={{
                            ...styles?.itemTitle,
                            ...itemStyles?.itemTitle,
                          }}
                        >
                          {item.title}
                        </div>
                      )}
                      {hasSubTitle && (
                        <div
                          data-tao-step-subtitle=""
                          title={
                            typeof item.subTitle === 'string'
                              ? item.subTitle
                              : undefined
                          }
                          className={cx(
                            classNames?.itemSubtitle,
                            itemClassNames?.itemSubtitle,
                          )}
                          style={{
                            ...styles?.itemSubtitle,
                            ...itemStyles?.itemSubtitle,
                          }}
                        >
                          {item.subTitle}
                        </div>
                      )}
                      {!isLast && (
                        <div
                          data-tao-step-rail=""
                          data-tao-status={nextStatus}
                          className={cx(
                            classNames?.itemRail,
                            itemClassNames?.itemRail,
                          )}
                          style={{
                            ...styles?.itemRail,
                            ...itemStyles?.itemRail,
                          }}
                        />
                      )}
                    </div>
                    {hasContent && (
                      <div
                        data-tao-step-content=""
                        className={cx(
                          classNames?.itemContent,
                          itemClassNames?.itemContent,
                        )}
                        style={{
                          ...styles?.itemContent,
                          ...itemStyles?.itemContent,
                        }}
                      >
                        {item.content}
                      </div>
                    )}
                  </div>
                </div>
              </StepsItemSemanticContext.Provider>
              {/* Panel steps are stitched together by notched separators;
                  the last one is hidden in CSS. */}
              {isPanel && <PanelArrow />}
            </div>
          );

          // Inline steps trade the body copy for a tooltip.
          if (isInline && hasContent) {
            return (
              <Tooltip key={itemKey} title={item.content}>
                {stepNode}
              </Tooltip>
            );
          }

          return stepNode;
        })}
      </StepsSemanticContext.Provider>
    </div>
  );
}
