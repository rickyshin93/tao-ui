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
      onChange?.(next ?? '', nextOptions);
    },
    [controlled, optionByValue, onChange],
  );

  const select = useCallback(
    (next: string): boolean => {
      if (disabled) return false;
      const option = optionByValue.get(next);
      if (!multiple) {
        publish(next);
        if (option) onSelect?.(next, option);
        return true;
      }

      const existed = selectedValueSet.has(next);
      const nextArray = existed
        ? valueArray.filter((item) => item !== next)
        : [...valueArray, next];
      if (!existed && maxCount != null && nextArray.length > maxCount)
        return false;

      publish(nextArray);
      if (option) {
        if (existed) onDeselect?.(next, option);
        else onSelect?.(next, option);
      }
      return true;
    },
    [
      disabled,
      multiple,
      selectedValueSet,
      valueArray,
      maxCount,
      optionByValue,
      publish,
      onSelect,
      onDeselect,
    ],
  );

  const addTokens = useCallback(
    (input: string) => {
      if (disabled) return;
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
      if (added.length === 0) return;
      const nextArray = [...valueArray, ...added];
      if (maxCount != null && nextArray.length > maxCount) return;

      publish(nextArray);
      for (const next of added) {
        const option = optionByValue.get(next);
        if (option) onSelect?.(next, option);
      }
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
      if (!multiple) return;
      publish(valueArray.filter((item) => item !== removed));
      const option = optionByValue.get(removed);
      if (option) onDeselect?.(removed, option);
    },
    [multiple, valueArray, optionByValue, publish, onDeselect],
  );

  const commit = useCallback(
    (nextArray: string[]) => {
      if (disabled) return;
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
      valueArray,
      selectedValueSet,
      optionByValue,
      publish,
      onSelect,
      onDeselect,
    ],
  );

  const clear = useCallback(() => {
    publish(multiple ? [] : undefined, true);
    onClear?.();
  }, [multiple, publish, onClear]);

  const selectedOption = useMemo(
    () => (!multiple && value ? optionByValue.get(value as string) : undefined),
    [multiple, value, optionByValue],
  );
  const selectedOptions = useMemo(
    () =>
      multiple
        ? valueArray
            .map(
              (item) =>
                optionByValue.get(item) ??
                (mode === 'tags' ? { label: item, value: item } : undefined),
            )
            .filter((option) => option !== undefined)
        : [],
    [multiple, valueArray, optionByValue, mode],
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
