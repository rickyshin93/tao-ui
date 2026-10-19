export function shiftDecimal(value: string, places: number): string {
  if (places === 0) return value;
  if (value === '' || value === '-') return value;

  const negative = value.startsWith('-');
  const abs = negative ? value.slice(1) : value;
  const [intPart = '0', fracPart = ''] = abs.split('.');
  const digits = intPart + fracPart;
  const newDecimalPos = intPart.length + places;

  let result: string;
  if (newDecimalPos <= 0) {
    result = `0.${'0'.repeat(-newDecimalPos)}${digits}`;
  } else if (newDecimalPos >= digits.length) {
    result = digits + '0'.repeat(newDecimalPos - digits.length);
  } else {
    result = `${digits.slice(0, newDecimalPos)}.${digits.slice(newDecimalPos)}`;
  }

  return (negative ? '-' : '') + cleanup(result);
}

export function fromPercent(displayValue: string): string {
  return shiftDecimal(displayValue, -2);
}

export function toPercent(actualValue: string): string {
  return shiftDecimal(actualValue, 2);
}

function cleanup(s: string): string {
  if (s.includes('.')) {
    s = s.replace(/0+$/, '');
    s = s.replace(/\.$/, '');
  }
  s = s.replace(/^0+(?=\d)/, '');
  if (s === '') return '0';
  return s;
}
