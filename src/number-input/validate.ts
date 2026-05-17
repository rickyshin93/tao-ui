const CANONICAL_REGEX = /^-?\d*\.?\d*$/;

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

export function clampToRange(
  canonical: string,
  min: number | undefined,
  max: number | undefined,
): string {
  if (canonical === '' || canonical === '-') return canonical;
  const n = Number(canonical);
  if (!Number.isFinite(n)) return canonical;
  if (min !== undefined && n < min) return String(min);
  if (max !== undefined && n > max) return String(max);
  return canonical;
}
