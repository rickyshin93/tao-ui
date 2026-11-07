import { createContext, useContext } from 'react';
import type { FormFieldLayout } from '../form-field/form-field-view';
import type { FieldRegistry, FormInstance } from './use-form';

export interface FormLayoutContextValue {
  layout: FormFieldLayout;
  form?: FormInstance;
  fields?: FieldRegistry;
}

/** Internal layout channel: Form → Form.Item. */
export const FormLayoutContext = createContext<FormLayoutContextValue>({
  layout: 'vertical',
});

export interface FormFieldChange {
  onChange: unknown;
  collect: (value: unknown) => void;
}

/** Lets a bound control update the store independently of consumer callbacks. */
export const FormFieldChangeContext = createContext<FormFieldChange | null>(
  null,
);

export function useFormLayout(): FormLayoutContextValue {
  return useContext(FormLayoutContext);
}
