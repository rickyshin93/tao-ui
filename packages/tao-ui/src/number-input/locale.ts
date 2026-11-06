/** Formatting metadata only: numeric values remain exact decimal strings. */
export interface NumberFormatOptions {
  decimalSeparator: string;
  thousandsSeparator: string;
  digits?: readonly string[];
  primaryGrouping?: number;
  secondaryGrouping?: number;
  minimumGrouping?: number;
  minusSign?: string;
  allowAsciiDecimal?: boolean;
}

export function resolveNumberFormat(
  locale: string | undefined,
  overrides: {
    decimalSeparator?: string;
    thousandsSeparator?: string;
  } = {},
): NumberFormatOptions {
  const formatter = new Intl.NumberFormat(locale ?? 'en-US');
  const parts = formatter.formatToParts(1234567890123);
  const groups = parts.filter((part) => part.type === 'integer');
  const primaryGrouping = groups.at(-1)!.value.length;
  const secondaryGrouping = groups.at(-2)?.value.length ?? primaryGrouping;
  const digitFormatter = new Intl.NumberFormat(locale ?? 'en-US', {
    useGrouping: false,
  });
  return {
    decimalSeparator:
      overrides.decimalSeparator ??
      formatter.formatToParts(1.1).find((part) => part.type === 'decimal')!
        .value,
    thousandsSeparator:
      overrides.thousandsSeparator ??
      parts.find((part) => part.type === 'group')!.value,
    digits: Array.from({ length: 10 }, (_, digit) =>
      digitFormatter.format(digit),
    ),
    primaryGrouping,
    secondaryGrouping,
    minimumGrouping: formatter
      .formatToParts(1000)
      .some((part) => part.type === 'group')
      ? 4
      : 5,
    minusSign: formatter
      .formatToParts(-1)
      .find((part) => part.type === 'minusSign')!.value,
    allowAsciiDecimal:
      locale !== undefined && overrides.decimalSeparator === undefined,
  };
}

export function localizeDigits(
  value: string,
  options: NumberFormatOptions,
): string {
  return options.digits
    ? value.replace(/\d/g, (digit) => options.digits![Number(digit)]!)
    : value;
}

/** Normalize only digits; date/time parsers retain their own punctuation grammar. */
export function normalizeDigits(
  value: string,
  options: Pick<NumberFormatOptions, 'digits'>,
): string {
  return options.digits
    ? value.replace(/[^\d]/gu, (character) => {
        const digit = options.digits!.indexOf(character);
        return digit === -1 ? character : String(digit);
      })
    : value;
}

export function groupInteger(
  value: string,
  options: NumberFormatOptions,
): string {
  if (
    !options.thousandsSeparator ||
    value.length < (options.minimumGrouping ?? 4)
  ) {
    return value;
  }
  const groups: string[] = [];
  let end = value.length;
  let size = options.primaryGrouping ?? 3;
  while (end > 0) {
    groups.unshift(value.slice(Math.max(0, end - size), end));
    end -= size;
    size = options.secondaryGrouping ?? 3;
  }
  return groups.join(options.thousandsSeparator);
}
