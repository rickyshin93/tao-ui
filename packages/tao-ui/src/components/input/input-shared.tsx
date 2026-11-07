import {
  type ChangeEvent,
  type CompositionEvent,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { type TaoVariant, useTaoConfig } from '../../provider/tao-provider';
import { mergeRefs } from '../../utils/refs';
import { CloseIcon } from '../select/select-icons';
import './input-shared.css';

export type InputVariant = TaoVariant | 'underlined';
export interface InputFocusOptions extends FocusOptions {
  cursor?: 'start' | 'end' | 'all';
}
export interface CountConfig {
  max?: number;
  strategy?: (value: string) => number;
  show?: boolean | ((info: CountInfo) => ReactNode);
  exceedFormatter?: (value: string, config: { max: number }) => string;
}
export interface CountInfo {
  value: string;
  count: number;
  maxLength?: number;
}
export interface AllowClearConfig {
  clearIcon?: ReactNode;
  disabled?: boolean;
  tabIndex?: number;
}
export interface TextControlProps<
  T extends HTMLInputElement | HTMLTextAreaElement,
> {
  allowClear?: boolean | AllowClearConfig;
  onClear?: () => void;
  showCount?: boolean | { formatter: (info: CountInfo) => ReactNode };
  count?: CountConfig;
  onPressEnter?: (event: KeyboardEvent<T>) => void;
}
export type InputSemanticValue<T, P> = T | ((info: { props: P }) => T);

/** Keep native DOM refs compatible while adding the documented cursor options. */
export function useTextControlRef<
  T extends HTMLInputElement | HTMLTextAreaElement,
>(
  ref: Ref<T> | undefined,
  nodeRef: RefObject<T | null>,
  rootRef: RefObject<HTMLDivElement | null>,
) {
  useImperativeHandle(mergeRefs(ref), () => {
    const node = nodeRef.current!;
    const nativeFocus =
      Object.getPrototypeOf(node).focus ?? HTMLElement.prototype.focus;
    return Object.assign(node, {
      input: node,
      textArea: node,
      nativeElement: rootRef.current!,
      focus(options?: InputFocusOptions) {
        nativeFocus.call(node, options);
        if (
          options?.cursor &&
          (node instanceof HTMLTextAreaElement ||
            ['text', 'search', 'password', 'tel', 'url'].includes(node.type))
        ) {
          const end = node.value.length;
          node.setSelectionRange(
            options.cursor === 'end' ? end : 0,
            options.cursor === 'start' ? 0 : end,
          );
        }
      },
    });
  });
}

export function useTextControl<
  T extends HTMLInputElement | HTMLTextAreaElement,
>(
  props: TextControlProps<T> & {
    value?: string | number | readonly string[];
    defaultValue?: string | number | readonly string[];
    form?: string;
    maxLength?: number;
    onChange?: (event: ChangeEvent<T>) => void;
    onBlur?: (event: FocusEvent<T>) => void;
  },
  nodeRef: RefObject<T | null>,
) {
  const [innerValue, setInnerValue] = useState(
    String(props.defaultValue ?? ''),
  );
  const controlled = 'value' in props;
  const value = controlled ? String(props.value ?? '') : innerValue;
  const composing = useRef(false);
  const count = props.count?.strategy?.(value) ?? value.length;
  const max = props.count?.max ?? props.maxLength;
  const show = props.count?.show ?? props.showCount;
  const info = { value, count, maxLength: max };
  const counter =
    typeof show === 'function'
      ? show(info)
      : typeof show === 'object'
        ? show.formatter(info)
        : max === undefined
          ? count
          : `${count} / ${max}`;
  const normalize = (next: string) => {
    const config = props.count;
    return config?.exceedFormatter &&
      max !== undefined &&
      (config.strategy?.(next) ?? next.length) > max
      ? config.exceedFormatter(next, { max })
      : next;
  };
  const applyChange = (event: ChangeEvent<T>, next: string) => {
    event.target.value = next;
    if (!controlled) setInnerValue(next);
    props.onChange?.(event);
  };
  const change = (event: ChangeEvent<T>, next = event.target.value) => {
    applyChange(event, composing.current ? next : normalize(next));
  };
  const blur = (event: FocusEvent<T>) => {
    composing.current = false;
    props.onBlur?.(event);
  };
  const endComposition = (event: CompositionEvent<T>) => {
    composing.current = false;
    const target = event.currentTarget;
    const normalized = normalize(target.value);
    if (normalized !== target.value) {
      applyChange(
        Object.create(event, { target: { value: target } }),
        normalized,
      );
    }
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: changing props.form changes the node's native form owner.
  useEffect(() => {
    const form = nodeRef.current?.form;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        composing.current = false;
        if (!controlled) setInnerValue(String(props.defaultValue ?? ''));
      });
    };
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  }, [nodeRef, controlled, props.defaultValue, props.form]);
  const clear = (event: MouseEvent<HTMLButtonElement>) => {
    const target = nodeRef.current!.cloneNode(true) as T;
    target.value = '';
    change(
      Object.create(event, {
        target: { value: target },
        currentTarget: { value: target },
      }) as ChangeEvent<T>,
      '',
    );
    props.onClear?.();
    nodeRef.current?.focus();
  };
  return {
    value,
    composing,
    change,
    blur,
    endComposition,
    clear,
    counter: show ? counter : null,
    exceeded: max !== undefined && count > max,
  };
}

export function InputClear({
  config,
  onClick,
  className,
  style,
}: {
  config: boolean | AllowClearConfig;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: CSSProperties;
}) {
  const { locale } = useTaoConfig();
  const options = typeof config === 'object' ? config : {};
  return (
    <button
      type="button"
      data-tao-input-clear=""
      data-tao-input-action=""
      className={className}
      style={style}
      aria-label={locale.clear}
      disabled={options.disabled}
      tabIndex={options.tabIndex}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {options.clearIcon ?? <CloseIcon />}
    </button>
  );
}
