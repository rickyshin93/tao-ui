import { getNodeRef, supportNodeRef } from '@rc-component/util/es/ref';
import useLayoutEffect from '@rc-component/util/es/hooks/useLayoutEffect';
import { cloneElement, type ReactElement, useId, useMemo } from 'react';
import { mergeRefs } from '../../utils/refs';
import { useFormLayout } from './form-context';
import { type FieldTarget, fieldKey } from './use-form';

/** Register the actual control, including noStyle and Form.List fields. */
export function FieldControl({
  name,
  children,
}: {
  name: (string | number)[];
  children: ReactElement<Record<string, unknown>>;
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
    fields?.set(key, target);
    return () => {
      fields?.delete(key);
    };
  }, [fields, key, target]);

  return cloneElement(children, {
    id,
    ...(supportNodeRef(children) ? { ref } : {}),
  });
}
