import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isThousandSepBeforeCursor, reposition } from './cursor';
import { format, padOnBlur, parse, truncateDecimals } from './format';
import { fromPercent, toPercent } from './percentage';
import type { FormatOptions, PadDecimalsOnBlur } from './types';
import {
  clampToRange,
  isValidCanonical,
  stripDisallowedSign,
} from './validate';

export interface UseNumberInputOptions {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  decimalSeparator?: '.' | ',';
  thousandsSeparator?: ',' | '.' | "'" | ' ' | '';
  decimalPlaces?: number;
  padDecimalsOnBlur?: PadDecimalsOnBlur;
  isPercentage?: boolean;
  allowNegative?: boolean;
  min?: number;
  max?: number;
}

export interface UseNumberInputReturn {
  inputProps: {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: FocusEvent<HTMLInputElement>) => void;
    onFocus: (e: FocusEvent<HTMLInputElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    ref: RefObject<HTMLInputElement | null>;
    inputMode: 'decimal' | 'numeric';
  };
  value: string;
  displayValue: string;
}

export function useNumberInput(
  opts: UseNumberInputOptions,
): UseNumberInputReturn {
  const {
    value,
    defaultValue,
    onChange,
    onBlur,
    decimalSeparator = '.',
    thousandsSeparator = ',',
    decimalPlaces = 2,
    padDecimalsOnBlur: padMode = 'never',
    isPercentage = false,
    allowNegative = false,
    min,
    max,
  } = opts;

  const fmtOpts = useMemo<FormatOptions>(
    () => ({ decimalSeparator, thousandsSeparator }),
    [decimalSeparator, thousandsSeparator],
  );

  const canonicalToDisplay = (actual: string): string => {
    const canonical = isPercentage ? toPercent(actual) : actual;
    return format(canonical, fmtOpts);
  };

  const [displayBuffer, setDisplayBuffer] = useState<string>(() =>
    canonicalToDisplay(value ?? defaultValue ?? ''),
  );

  const isFocusedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingCursorRef = useRef<number | null>(null);

  // External value sync (controlled, not focused).
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only react to external value changes
  useEffect(() => {
    if (value === undefined) return;
    if (isFocusedRef.current) return;
    const display = canonicalToDisplay(value);
    setDisplayBuffer((prev) => (prev === display ? prev : display));
  }, [value]);

  // Apply pending cursor after buffer commit.
  // biome-ignore lint/correctness/useExhaustiveDependencies: displayBuffer is the trigger, not a closure value
  useLayoutEffect(() => {
    if (pendingCursorRef.current === null) return;
    const pos = pendingCursorRef.current;
    inputRef.current?.setSelectionRange(pos, pos);
    pendingCursorRef.current = null;
  }, [displayBuffer]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cursor = e.target.selectionStart ?? raw.length;
    let canonical = parse(raw, fmtOpts);
    canonical = stripDisallowedSign(canonical, allowNegative);
    canonical = truncateDecimals(canonical, decimalPlaces);
    if (!isValidCanonical(canonical)) return;
    const newDisplay = format(canonical, fmtOpts);
    pendingCursorRef.current = reposition({
      before: raw,
      beforeCursor: cursor,
      after: newDisplay,
      thousandsSeparator,
    });
    setDisplayBuffer(newDisplay);
    const actual = isPercentage ? fromPercent(canonical) : canonical;
    onChange?.(actual);
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    const raw = inputRef.current?.value ?? displayBuffer;
    let canonical = parse(raw, fmtOpts);
    canonical = padOnBlur(canonical, decimalPlaces, padMode);
    let actual = isPercentage ? fromPercent(canonical) : canonical;
    actual = clampToRange(actual, min, max);
    const canonicalAfter = isPercentage ? toPercent(actual) : actual;
    const newDisplay = format(canonicalAfter, fmtOpts);
    setDisplayBuffer(newDisplay);
    onChange?.(actual);
    onBlur?.(actual);
  };

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return;
    const el = inputRef.current;
    if (!el) return;
    const cursor = el.selectionStart ?? 0;
    if (
      cursor > 0 &&
      isThousandSepBeforeCursor(displayBuffer, cursor, thousandsSeparator)
    ) {
      el.setSelectionRange(cursor - 1, cursor - 1);
    }
  };

  const derivedActual = useMemo(() => {
    const canonical = parse(displayBuffer, fmtOpts);
    return isPercentage ? fromPercent(canonical) : canonical;
  }, [displayBuffer, isPercentage, fmtOpts]);

  return {
    inputProps: {
      value: displayBuffer,
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      onKeyDown: handleKeyDown,
      ref: inputRef,
      inputMode: decimalPlaces > 0 ? 'decimal' : 'numeric',
    },
    value: derivedActual,
    displayValue: displayBuffer,
  };
}
