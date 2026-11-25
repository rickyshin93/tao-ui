import {
  type NamePath,
  type FormInstance as RcFormInstance,
  useForm as useRcForm,
} from '@rc-component/form';
import { isEqual } from '@rc-component/util';
import { getDOM } from '@rc-component/util/es/Dom/findDOMNode';
import { useMemo } from 'react';
import scrollIntoView, { type Options } from 'scroll-into-view-if-needed';

// The upstream overloads split native and callback behavior; our public API accepts both.
const scroll = scrollIntoView as (target: Element, options: Options) => unknown;

export type FormScrollOptions = Options & { focus?: boolean };

// biome-ignore lint/suspicious/noExplicitAny: preserve the previously exported rc-form default generic
export interface FormInstance<Values = any> extends RcFormInstance<Values> {
  /** Scroll a mounted field into view; optionally focus its control. */
  scrollToField: (name: NamePath<Values>, options?: FormScrollOptions) => void;
}

/** Validation state keys; a plain value write must not drop these. */
const VALIDATION_STATE_KEYS = [
  'errors',
  'warnings',
  'touched',
  'validating',
] as const;

export interface FieldTarget {
  id: string;
  instance: unknown;
}

export type FieldRegistry = Map<string, Set<FieldTarget>>;

const fieldRegistries = new WeakMap<object, FieldRegistry>();

export function getFieldRegistry(form: object) {
  return fieldRegistries.get(form);
}

export function fieldKey(name: unknown) {
  return JSON.stringify(Array.isArray(name) ? name : [name]);
}

// biome-ignore lint/suspicious/noExplicitAny: preserve the existing Form.useForm() inference when no value type is supplied
export function useForm<Values = any>(
  form?: FormInstance<Values>,
): [FormInstance<Values>] {
  const [rcForm] = useRcForm<Values>(form);
  const wrapped = useMemo(() => {
    if (form) return form;
    const fields: FieldRegistry = new Map();
    const instance: FormInstance<Values> = {
      ...rcForm,
      setFields(nextFields) {
        // Upstream keeps previous validation errors when a `setField` write only
        // updates the value, so a value written through `setFields` — e.g. the
        // controlled `fields` prop — leaves errors from the old value rendered.
        // Mirror `setFieldsValue`: clear those stale errors before the value
        // lands, unless the caller also supplies fresh validation state.
        const stale = nextFields.filter(
          (field) =>
            'value' in field &&
            VALIDATION_STATE_KEYS.every((key) => !(key in field)) &&
            !isEqual(field.value, rcForm.getFieldValue(field.name)),
        );
        rcForm.setFields(
          stale.length
            ? [
                ...stale.map((field) => ({
                  name: field.name,
                  errors: [],
                  warnings: [],
                })),
                ...nextFields,
              ]
            : nextFields,
        );
      },
      scrollToField(name, options = {}) {
        const targets = fields.get(fieldKey(name));
        const target = targets && Array.from(targets).at(-1);
        if (!target) return;
        const node =
          getDOM(target.instance) ?? document.getElementById(target.id);
        if (!node) return;
        const { focus, ...scrollOptions } = options;
        scroll(node, {
          scrollMode: 'if-needed',
          block: 'nearest',
          ...scrollOptions,
        });
        if (focus) {
          const control = target.instance as {
            focus?: (options?: FocusOptions) => void;
          } | null;
          if (typeof control?.focus === 'function') {
            control.focus({ preventScroll: true });
          } else {
            node.focus({ preventScroll: true });
          }
        }
      },
    };
    fieldRegistries.set(instance, fields);
    return instance;
  }, [form, rcForm]);
  return [wrapped];
}
