import { shiftDecimal } from './percentage';

const CANONICAL_REGEX = /^-?\d*\.?\d*$/;

function toCanonical(value: number): string {
  const [coefficient, exponent] = String(value).split('e');
  return exponent === undefined
    ? coefficient
    : shiftDecimal(coefficient, Number(exponent));
}

export function isValidCanonical(canonical: string): boolean {
  return CANONICAL_REGEX.test(canonical);
}

export function stripDisallowedSign(
  canonical: string,
  allowNegative: boolean,
): string {
  if (allowNegative) return canonical;
  return canonical.startsWith('-') ? canonical.slice(1) : canonical;
}

function decimalParts(value: string) {
  const [integer, fraction = ''] = value.replace(/^-/, '').split('.');
  const whole = integer.replace(/^0+/, '') || '0';
  const decimals = fraction.replace(/0+$/, '');
  const sign = value.startsWith('-') && (whole !== '0' || decimals) ? -1 : 1;
  return { whole, decimals, sign };
}

function compareDecimals(left: string, right: string): number {
  const a = decimalParts(left);
  const b = decimalParts(right);
  if (a.sign !== b.sign) return a.sign - b.sign;
  if (a.whole.length !== b.whole.length)
    return (a.whole.length - b.whole.length) * a.sign;
  if (a.whole !== b.whole) return (a.whole > b.whole ? 1 : -1) * a.sign;
  const length = Math.max(a.decimals.length, b.decimals.length);
  const aFraction = a.decimals.padEnd(length, '0');
  const bFraction = b.decimals.padEnd(length, '0');
  if (aFraction === bFraction) return 0;
  return (aFraction > bFraction ? 1 : -1) * a.sign;
}

export function clampToRange(
  canonical: string,
  min: number | undefined,
  max: number | undefined,
): string {
  if (!/\d/.test(canonical)) return canonical;
  if (min !== undefined && Number.isFinite(min)) {
    const lower = toCanonical(min);
    if (compareDecimals(canonical, lower) < 0) return lower;
  }
  if (max !== undefined && Number.isFinite(max)) {
    const upper = toCanonical(max);
    if (compareDecimals(canonical, upper) > 0) return upper;
  }
  return canonical;
}
