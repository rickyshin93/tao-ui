import { createContext, useCallback, useContext, useRef } from 'react';
export interface WatermarkContextValue {
  add: (element: HTMLElement) => void;
  remove: (element: HTMLElement) => void;
}
export const WatermarkContext = createContext<WatermarkContextValue | null>(
  null,
);
/** Register a portaled Modal/Drawer panel with its closest inheritable watermark. */
export function useWatermarkPanelRef() {
  const context = useContext(WatermarkContext);
  const previous = useRef<HTMLElement | null>(null);
  return useCallback(
    (element: HTMLElement | null) => {
      if (previous.current) context?.remove(previous.current);
      previous.current = element;
      if (element) context?.add(element);
    },
    [context],
  );
}
