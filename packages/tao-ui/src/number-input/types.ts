export type PadDecimalsOnBlur = 'never' | 'always' | 'whenHasDecimal';

export interface FormatOptions {
  decimalSeparator: '.' | ',';
  thousandsSeparator: ',' | '.' | "'" | ' ' | '';
}
