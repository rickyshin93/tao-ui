import {
  groupInteger,
  localizeDigits,
  type NumberFormatOptions,
  normalizeDigits,
} from './locale';
import type { PadDecimalsOnBlur } from './types';

export function format(canonical: string, opts: NumberFormatOptions): string {
  if (canonical === '') return canonical;
  if (canonical === '-') return opts.minusSign ?? '-';

  const negative = canonical.startsWith('-');
  const abs = negative ? canonical.slice(1) : canonical;
  const dotIndex = abs.indexOf('.');
  const intPart = dotIndex === -1 ? abs : abs.slice(0, dotIndex);
  const fracPart = dotIndex === -1 ? '' : abs.slice(dotIndex + 1);

  const groupedInt = groupInteger(intPart, opts);

  let result = groupedInt;
  if (dotIndex !== -1) {
    result += opts.decimalSeparator + fracPart;
  }

  return (
    (negative ? (opts.minusSign ?? '-') : '') + localizeDigits(result, opts)
  );
}

export function parse(display: string, opts: NumberFormatOptions): string {
  if (!display) return '';

  const text = normalizeDigits(display, opts).replace(
    /[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g,
    '',
  );
  const negative =
    text.startsWith('-') || text.startsWith(opts.minusSign ?? '-');
  const body = negative ? text.slice(1) : text;

  let cleaned = '';
  let seenDecimal = false;
  for (const ch of body) {
    if (ch >= '0' && ch <= '9') {
      cleaned += ch;
    } else if (
      !seenDecimal &&
      (ch === opts.decimalSeparator ||
        (opts.allowAsciiDecimal &&
          ch === '.' &&
          opts.thousandsSeparator !== '.'))
    ) {
      cleaned += '.';
      seenDecimal = true;
    }
  }

  if (cleaned.startsWith('.')) cleaned = `0${cleaned}`;

  return (negative ? '-' : '') + cleaned;
}

export function truncateDecimals(
  canonical: string,
  decimalPlaces: number,
): string {
  const dotIndex = canonical.indexOf('.');
  if (dotIndex === -1) return canonical;
  if (decimalPlaces === 0) return canonical.slice(0, dotIndex);
  return canonical.slice(0, dotIndex + 1 + decimalPlaces);
}

export function padOnBlur(
  canonical: string,
  decimalPlaces: number,
  mode: PadDecimalsOnBlur,
): string {
  if (mode === 'never') return canonical;
  if (canonical === '' || canonical === '-') return canonical;

  const dotIndex = canonical.indexOf('.');
  const hasDot = dotIndex !== -1;
  const fracLen = hasDot ? canonical.length - dotIndex - 1 : 0;

  if (mode === 'whenHasDecimal') {
    if (!hasDot || fracLen === 0) {
      return hasDot ? canonical.slice(0, dotIndex) : canonical;
    }
    if (fracLen >= decimalPlaces) return canonical;
    return canonical + '0'.repeat(decimalPlaces - fracLen);
  }

  // mode === 'always'
  if (decimalPlaces === 0) {
    return hasDot ? canonical.slice(0, dotIndex) : canonical;
  }
  if (!hasDot) {
    return `${canonical}.${'0'.repeat(decimalPlaces)}`;
  }
  if (fracLen >= decimalPlaces) return canonical;
  return canonical + '0'.repeat(decimalPlaces - fracLen);
}
