import { getNodeRef } from '@rc-component/util';
import {
  cloneElement,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type ReactElement,
  type RefAttributes,
} from 'react';
import { mergeRefs } from '../../utils/refs';

const originalEvents = new WeakMap<KeyboardEvent, KeyboardEvent>();

/** rc-tree's horizontal key handler uses LTR semantics even with direction="rtl". */
export function treeKeyboardEvent<T extends Element>(
  event: KeyboardEvent<T>,
  direction?: 'ltr' | 'rtl',
): KeyboardEvent<T> {
  if (
    direction !== 'rtl' ||
    (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
  ) {
    return event;
  }
  const mapped: KeyboardEvent<T> = Object.create(event);
  mapped.key = event.key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
  mapped.preventDefault = () => event.preventDefault();
  mapped.stopPropagation = () => event.stopPropagation();
  originalEvents.set(mapped, event);
  return mapped;
}

export function originalTreeKeyboardEvent<T extends Element>(
  event: KeyboardEvent<T>,
): KeyboardEvent<T> {
  return (originalEvents.get(event) as KeyboardEvent<T> | undefined) ?? event;
}

type TreeKeyboardHandle = { onKeyDown: KeyboardEventHandler };

/** Adapt only rc-select's internal OptionList handle; its public events stay intact. */
export function treeKeyboardPopup(
  menu: ReactElement,
  direction: 'ltr' | 'rtl',
): ReactElement {
  if (direction !== 'rtl') return menu;
  const forwardRef = mergeRefs(
    getNodeRef<TreeKeyboardHandle>(menu) ?? undefined,
  );
  return cloneElement(menu as ReactElement<RefAttributes<TreeKeyboardHandle>>, {
    ref: (handle) =>
      forwardRef(
        handle && {
          ...handle,
          onKeyDown: (event) =>
            handle.onKeyDown(treeKeyboardEvent(event, direction)),
        },
      ),
  });
}
