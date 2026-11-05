import { createContext, type ReactNode, useContext } from 'react';

/** The field's label content, without its required mark or help text. */
export const FieldLabelContext = createContext<ReactNode>(undefined);

export function useMobileTitle(
  title: ReactNode,
  fallback: ReactNode,
): ReactNode {
  const label = useContext(FieldLabelContext);
  return title ?? label ?? fallback;
}
