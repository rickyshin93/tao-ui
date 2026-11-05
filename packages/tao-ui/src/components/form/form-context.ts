import { createContext, useContext } from 'react';
import type { FormFieldLayout } from '../form-field/form-field-view';
import type { FieldTarget, FormInstance } from './use-form';

export interface FormLayoutContextValue {
  layout: FormFieldLayout;
  form?: FormInstance;
  fields?: Map<string, FieldTarget>;
}

/** Internal layout channel: Form → Form.Item. */
export const FormLayoutContext = createContext<FormLayoutContextValue>({
  layout: 'vertical',
});

export function useFormLayout(): FormLayoutContextValue {
  return useContext(FormLayoutContext);
}
