import { useMemo } from 'react';
import type { StepItem } from './steps';
import { StepEllipsisIcon } from './steps-icons';

/**
 * `maxCount` collapsing. Ported from antd's `useDisplaySteps` so the visible
 * range, the remapped `current`, and the ellipsis statuses behave identically.
 */

export interface DisplayStep {
  item: StepItem;
  /** Index in the original `items` array; `-1` for a generated ellipsis step. */
  originIndex: number;
  /** Generated placeholder standing in for a hidden range. */
  ellipsis?: boolean;
}

export interface DisplayStepsResult {
  canApplyMaxCount: boolean;
  displaySteps: DisplayStep[];
  /** Index of `current` within `displaySteps`; negative when out of range. */
  displayCurrent: number;
}

/**
 * Build the disabled ellipsis item standing in for a hidden range. Its status
 * reflects the hidden range so the connector still communicates finished or
 * failed progress, and its key is derived from the adjacent real steps.
 */
function getEllipsisStep(
  items: StepItem[],
  currentIndex: number,
  prevIndex: number,
  nextIndex: number,
): DisplayStep {
  const prevKey = items[prevIndex].key ?? prevIndex;
  const nextKey = items[nextIndex].key ?? nextIndex;
  const hidden = items.slice(prevIndex + 1, nextIndex);
  const hiddenError = hidden.some((step) => step.status === 'error');

  return {
    item: {
      key: `__tao_steps_ellipsis-${prevKey}-${nextKey}`,
      // Empty (not undefined) title keeps the header height aligned with
      // its neighbours — antd does the same.
      title: '',
      icon: <StepEllipsisIcon />,
      status: hiddenError ? 'error' : nextIndex - 1 < currentIndex ? 'finish' : 'wait',
      disabled: true,
    },
    originIndex: -1,
    ellipsis: true,
  };
}

/**
 * Pick the real step indexes that stay visible under `maxCount`. First, last,
 * and current are always kept; remaining slots fill by priority: current left,
 * current right, first right, last left, then repeating at larger distances.
 *
 * `null` is inserted between non-contiguous indexes and rendered as an ellipsis.
 */
function getCollapsedIndexes(
  total: number,
  currentIndex: number,
  maxCount: number,
): Array<number | null> {
  const safeCurrent = Math.min(Math.max(currentIndex, 0), total - 1);
  const targetCount = Math.min(maxCount, total);
  const indexes = new Set([0, safeCurrent, total - 1]);

  for (
    let distance = 1;
    indexes.size < targetCount && distance < total;
    distance += 1
  ) {
    const candidates = [
      safeCurrent - distance,
      safeCurrent + distance,
      distance,
      total - 1 - distance,
    ];

    for (const index of candidates) {
      if (indexes.size >= targetCount) break;
      if (index >= 0 && index < total) indexes.add(index);
    }
  }

  return Array.from(indexes)
    .sort((a, b) => a - b)
    .flatMap((index, order, sorted) =>
      order > 0 && index - sorted[order - 1] > 1 ? [null, index] : [index],
    );
}

/**
 * Convert `items` + `current` into the list Steps actually renders. When steps
 * collapse, callers still see the original indexes: `onChange` maps a display
 * position back through `originIndex`.
 */
export function useDisplaySteps(
  items: StepItem[],
  current: number,
  initial: number,
  maxCount: number | undefined,
): DisplayStepsResult {
  const canApplyMaxCount =
    maxCount !== undefined && maxCount >= 3 && items.length > maxCount;

  const mappedCurrent = current - initial;

  const displaySteps = useMemo<DisplayStep[]>(() => {
    if (!canApplyMaxCount) {
      return items.map((item, originIndex) => ({ item, originIndex }));
    }

    const collapsed = getCollapsedIndexes(
      items.length,
      mappedCurrent,
      maxCount,
    );

    return collapsed.map((index, collapsedIndex) =>
      index === null
        ? getEllipsisStep(
            items,
            mappedCurrent,
            collapsed[collapsedIndex - 1] as number,
            collapsed[collapsedIndex + 1] as number,
          )
        : { item: items[index], originIndex: index },
    );
  }, [canApplyMaxCount, mappedCurrent, items, maxCount]);

  const found = displaySteps.findIndex(
    (step) => step.originIndex === mappedCurrent,
  );

  return {
    canApplyMaxCount,
    displaySteps,
    displayCurrent: found >= 0 ? found : mappedCurrent,
  };
}
