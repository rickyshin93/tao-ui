import {
  type FormInstance as RcFormInstance,
  type NamePath,
  useForm as useRcForm,
} from '@rc-component/form';
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

export interface FieldTarget {
  id: string;
  instance: unknown;
}

const fieldRegistries = new WeakMap<object, Map<string, FieldTarget>>();

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
    const fields = new Map<string, FieldTarget>();
    const instance: FormInstance<Values> = {
      ...rcForm,
      scrollToField(name, options = {}) {
        const target = fields.get(fieldKey(name));
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
