import type { FormatOptions, PadDecimalsOnBlur } from './types';

const THOUSAND_SEP_REGEX = /\B(?=(\d{3})+(?!\d))/g;

export function format(canonical: string, opts: FormatOptions): string {
  if (canonical === '' || canonical === '-') return canonical;

  const negative = canonical.startsWith('-');
  const abs = negative ? canonical.slice(1) : canonical;
  const dotIndex = abs.indexOf('.');
  const intPart = dotIndex === -1 ? abs : abs.slice(0, dotIndex);
  const fracPart = dotIndex === -1 ? '' : abs.slice(dotIndex + 1);

  const groupedInt = opts.thousandsSeparator
    ? intPart.replace(THOUSAND_SEP_REGEX, opts.thousandsSeparator)
    : intPart;

  let result = groupedInt;
  if (dotIndex !== -1) {
    result += opts.decimalSeparator + fracPart;
  }

  return (negative ? '-' : '') + result;
}

export function parse(display: string, opts: FormatOptions): string {
  if (!display) return '';

  const negative = display.startsWith('-');
  const body = negative ? display.slice(1) : display;

  let cleaned = '';
  let seenDecimal = false;
  for (const ch of body) {
    if (ch >= '0' && ch <= '9') {
      cleaned += ch;
    } else if (ch === opts.decimalSeparator && !seenDecimal) {
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
