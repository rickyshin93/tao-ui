import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MutableRefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  countAnchored,
  findCursorAt,
  isThousandSepBeforeCursor,
  reposition,
} from './cursor';
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
    ref: MutableRefObject<HTMLInputElement | null>;
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

  const isValueControlled = 'value' in opts;
  const [buffer, setBuffer] = useState(() => ({
    display: canonicalToDisplay(
      isValueControlled ? (value ?? '') : (defaultValue ?? ''),
    ),
    format: fmtOpts,
    isPercentage,
  }));
  const displayBuffer = buffer.display;
  const setDisplayBuffer = (display: string) =>
    setBuffer({ display, format: fmtOpts, isPercentage });

  const isFocusedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingCursorRef = useRef<{
    display: string;
    start: number;
    end: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (buffer.format === fmtOpts && buffer.isPercentage === isPercentage)
      return;
    const previousCanonical = parse(buffer.display, buffer.format);
    const useExternalValue = isValueControlled && !isFocusedRef.current;
    const actual = useExternalValue
      ? (value ?? '')
      : buffer.isPercentage
        ? fromPercent(previousCanonical)
        : previousCanonical;
    let canonical = isPercentage ? toPercent(actual) : actual;
    if (
      !useExternalValue &&
      previousCanonical.endsWith('.') &&
      !canonical.includes('.')
    )
      canonical += '.';
    const display = format(canonical, fmtOpts);
    const input = inputRef.current;
    if (isFocusedRef.current && input && display !== buffer.display) {
      const beforeCount = countAnchored(
        buffer.display,
        buffer.display.length,
        buffer.format.thousandsSeparator,
      );
      const afterCount = countAnchored(
        display,
        display.length,
        thousandsSeparator,
      );
      const mapCursor = (position: number) =>
        findCursorAt(
          display,
          afterCount -
            beforeCount +
            countAnchored(
              buffer.display,
              position,
              buffer.format.thousandsSeparator,
            ),
          thousandsSeparator,
        );
      pendingCursorRef.current = {
        display,
        start: mapCursor(input.selectionStart ?? buffer.display.length),
        end: mapCursor(input.selectionEnd ?? buffer.display.length),
      };
    }
    setBuffer({ display, format: fmtOpts, isPercentage });
  }, [
    buffer,
    fmtOpts,
    isPercentage,
    isValueControlled,
    value,
    thousandsSeparator,
  ]);

  // External value sync (controlled, not focused).
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only react to external value changes
  useEffect(() => {
    if (!isValueControlled) return;
    if (isFocusedRef.current) return;
    const display = canonicalToDisplay(value ?? '');
    if (displayBuffer !== display) setDisplayBuffer(display);
  }, [value, isValueControlled]);

  // Apply pending cursor after buffer commit.
  useLayoutEffect(() => {
    const pending = pendingCursorRef.current;
    if (pending?.display !== displayBuffer) return;
    inputRef.current?.setSelectionRange(pending.start, pending.end);
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
    const cursorPosition = reposition({
      before: raw,
      beforeCursor: cursor,
      after: newDisplay,
      thousandsSeparator,
    });
    pendingCursorRef.current = {
      display: newDisplay,
      start: cursorPosition,
      end: cursorPosition,
    };
    setDisplayBuffer(newDisplay);
    const actual = isPercentage ? fromPercent(canonical) : canonical;
    onChange?.(actual);
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    const raw = isValueControlled
      ? canonicalToDisplay(value ?? '')
      : (inputRef.current?.value ?? displayBuffer);
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
    const canonical = parse(buffer.display, buffer.format);
    return buffer.isPercentage ? fromPercent(canonical) : canonical;
  }, [buffer]);

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
