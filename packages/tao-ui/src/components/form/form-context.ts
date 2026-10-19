import { createContext, useContext } from 'react';
import type { FormFieldLayout } from '../form-field/form-field-view';

export interface FormLayoutContextValue {
  layout: FormFieldLayout;
}

/** Internal layout channel: Form → Form.Item. */
export const FormLayoutContext = createContext<FormLayoutContextValue>({
  layout: 'vertical',
});

export function useFormLayout(): FormLayoutContextValue {
  return useContext(FormLayoutContext);
}
