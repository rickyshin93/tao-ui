import {
  type MutableRefObject,
  type Ref,
  useLayoutEffect,
  useRef,
} from 'react';

/** Timers and document listeners only see values from committed renders. */
export function useCommittedRef<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

export function mergeRefs<T>(
  ...refs: Array<Ref<T> | undefined>
): (value: T | null) => void {
  // Handle detach here so callback cleanups also work with React 18.
  let cleanups: Array<() => void> = [];
  return (value) => {
    if (value === null) {
      const pending = cleanups;
      cleanups = [];
      for (const cleanup of pending) cleanup();
      return;
    }
    for (const ref of refs) {
      if (typeof ref === 'function') {
        const cleanup: unknown = ref(value);
        cleanups.push(
          typeof cleanup === 'function' ? () => cleanup() : () => ref(null),
        );
      } else if (ref) {
        const objectRef = ref as MutableRefObject<T | null>;
        objectRef.current = value;
        cleanups.push(() => {
          objectRef.current = null;
        });
      }
    }
  };
}
