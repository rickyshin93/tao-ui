import { useCallback, useMemo, useState } from 'react';
import { buildSelectIndex } from './select-model';
import type { SelectProps } from './select-types';

type SelectionProps = Pick<
  SelectProps,
  | 'options'
  | 'value'
  | 'defaultValue'
  | 'mode'
  | 'maxCount'
  | 'tokenSeparators'
  | 'onChange'
  | 'onSelect'
  | 'onDeselect'
  | 'onClear'
>;

/** Owns selection values and their notifications across the Select displays. */
export function useSelectSelection(props: SelectionProps, disabled: boolean) {
  const {
    options,
    value: valueProp,
    defaultValue,
    mode,
    maxCount,
    tokenSeparators,
    onChange,
    onSelect,
    onDeselect,
    onClear,
  } = props;
  const multiple = mode === 'multiple' || mode === 'tags';
  const controlled = 'value' in props;
  const [internalValue, setInternalValue] = useState<
    string | string[] | undefined
  >(
    multiple
      ? ((defaultValue as string[] | undefined) ?? [])
      : (defaultValue as string | undefined),
  );
  const value = controlled ? valueProp : internalValue;
  const valueArray = useMemo<string[]>(() => {
    if (multiple) return (value as string[]) ?? [];
    return value ? [value as string] : [];
  }, [multiple, value]);
  const selectedValueSet = useMemo(() => new Set(valueArray), [valueArray]);
  const { optionByValue, optionByToken } = useMemo(
    () => buildSelectIndex(options),
    [options],
  );

  const publish = useCallback(
    (next: string | string[] | undefined, clear = false) => {
      if (!controlled) setInternalValue(next);
      const nextOptions = clear
        ? undefined
        : Array.isArray(next)
          ? next
              .map((item) => optionByValue.get(item))
              .filter((option) => option !== undefined)
          : optionByValue.get(next ?? '');
      onChange?.(Array.isArray(next) ? [...next] : (next ?? ''), nextOptions);
    },
    [controlled, optionByValue, onChange],
  );

  const select = useCallback(
    (next: string): boolean => {
      if (disabled) return false;
      const option =
        optionByValue.get(next) ??
        (mode === 'tags' ? optionByToken.get(next) : undefined);
      if (option?.disabled) return false;
      const canonical = option?.value ?? next;
      if (!multiple) {
        if (canonical !== value) publish(canonical);
        if (option) onSelect?.(canonical, option);
        return true;
      }

      const existed = selectedValueSet.has(canonical);
      const nextArray = existed
        ? valueArray.filter((item) => item !== canonical)
        : [...valueArray, canonical];
      if (!existed && maxCount != null && nextArray.length > maxCount)
        return false;

      publish(nextArray);
      if (option) {
        if (existed) onDeselect?.(canonical, option);
        else onSelect?.(canonical, option);
      }
      return true;
    },
    [
      disabled,
      mode,
      multiple,
      value,
      selectedValueSet,
      valueArray,
      maxCount,
      optionByValue,
      optionByToken,
      publish,
      onSelect,
      onDeselect,
    ],
  );

  const addTokens = useCallback(
    (input: string) => {
      if (disabled) return false;
      const tokens = (tokenSeparators ?? [])
        .reduce(
          (parts, separator) =>
            separator ? parts.flatMap((part) => part.split(separator)) : parts,
          [input],
        )
        .map((token) => token.trim())
        .filter(Boolean);
      const seen = new Set(selectedValueSet);
      const added: string[] = [];
      for (const token of tokens) {
        const option = optionByToken.get(token);
        if (option?.disabled || (!option && mode !== 'tags')) continue;
        const next = option?.value ?? token;
        if (seen.has(next)) continue;
        seen.add(next);
        added.push(next);
      }
      if (added.length === 0) return false;
      const nextArray = [...valueArray, ...added];
      if (maxCount != null && nextArray.length > maxCount) return false;

      publish(nextArray);
      for (const next of added) {
        const option = optionByValue.get(next);
        if (option) onSelect?.(next, option);
      }
      return true;
    },
    [
      disabled,
      tokenSeparators,
      selectedValueSet,
      valueArray,
      mode,
      maxCount,
      optionByToken,
      optionByValue,
      publish,
      onSelect,
    ],
  );

  const remove = useCallback(
    (removed: string) => {
      if (disabled || !multiple) return;
      const option = optionByValue.get(removed);
      if (option?.disabled) return;
      publish(valueArray.filter((item) => item !== removed));
      if (option) onDeselect?.(removed, option);
    },
    [disabled, multiple, valueArray, optionByValue, publish, onDeselect],
  );

  const commit = useCallback(
    (draft: string[]) => {
      if (disabled) return;
      const nextArray = draft.filter((item) => {
        if (selectedValueSet.has(item)) return true;
        const option = optionByValue.get(item);
        return option ? !option.disabled : mode === 'tags';
      });
      if (maxCount != null && nextArray.length > maxCount) return;
      publish(nextArray);
      const nextSet = new Set(nextArray);
      for (const next of nextArray) {
        if (!selectedValueSet.has(next)) {
          const option = optionByValue.get(next);
          if (option) onSelect?.(next, option);
        }
      }
      for (const previous of valueArray) {
        if (!nextSet.has(previous)) {
          const option = optionByValue.get(previous);
          if (option) onDeselect?.(previous, option);
        }
      }
    },
    [
      disabled,
      mode,
      maxCount,
      valueArray,
      selectedValueSet,
      optionByValue,
      publish,
      onSelect,
      onDeselect,
    ],
  );

  const clear = useCallback(() => {
    if (disabled) return;
    publish(multiple ? [] : undefined, true);
    onClear?.();
  }, [disabled, multiple, publish, onClear]);

  const selectedOption = useMemo(
    () =>
      !multiple && value
        ? (optionByValue.get(value as string) ?? {
            label: value as string,
            value: value as string,
          })
        : undefined,
    [multiple, value, optionByValue],
  );
  const selectedOptions = useMemo(
    () =>
      multiple
        ? valueArray.map(
            (item) => optionByValue.get(item) ?? { label: item, value: item },
          )
        : [],
    [multiple, valueArray, optionByValue],
  );

  return {
    value,
    valueArray,
    selectedValueSet,
    selectedOption,
    selectedOptions,
    select,
    addTokens,
    remove,
    commit,
    clear,
  };
}
