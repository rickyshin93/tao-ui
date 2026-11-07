import { getNodeRef, supportNodeRef } from '@rc-component/util/es/ref';
import useLayoutEffect from '@rc-component/util/es/hooks/useLayoutEffect';
import { cloneElement, type ReactElement, useId, useMemo } from 'react';
import { mergeRefs } from '../../utils/refs';
import {
  type FormFieldChange,
  FormFieldChangeContext,
  useFormLayout,
} from './form-context';
import { type FieldTarget, fieldKey } from './use-form';

/** Register the actual control, including noStyle and Form.List fields. */
export function FieldControl({
  name,
  children,
  valueChange,
}: {
  name: (string | number)[];
  children: ReactElement<Record<string, unknown>>;
  valueChange: FormFieldChange | null;
}) {
  const { fields } = useFormLayout();
  const generatedId = useId();
  const id =
    typeof children.props.id === 'string'
      ? children.props.id
      : `${generatedId}-control`;
  const key = fieldKey(name);
  const target = useMemo<FieldTarget>(() => ({ id, instance: null }), [id]);
  const childRef = getNodeRef(children);
  const ref = useMemo(
    () =>
      mergeRefs((instance: unknown) => {
        target.instance = instance;
      }, childRef),
    [target, childRef],
  );

  useLayoutEffect(() => {
    if (!fields) return;
    const targets = fields.get(key) ?? new Set<FieldTarget>();
    targets.add(target);
    fields.set(key, targets);
    return () => {
      targets.delete(target);
      if (!targets.size) fields.delete(key);
    };
  }, [fields, key, target]);

  return (
    <FormFieldChangeContext.Provider value={valueChange}>
      {cloneElement(children, {
        id,
        ...(supportNodeRef(children) ? { ref } : {}),
      })}
    </FormFieldChangeContext.Provider>
  );
}
