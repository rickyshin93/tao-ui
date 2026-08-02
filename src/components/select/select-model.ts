import type { SelectOption } from './select-types';

export function defaultFilter(input: string, option: SelectOption): boolean {
  const label =
    typeof option.label === 'string' ? option.label : String(option.label);
  return label.toLowerCase().includes(input.toLowerCase());
}

export function flattenOptions(options: SelectOption[]): SelectOption[] {
  const result: SelectOption[] = [];
  for (const option of options) {
    if (option.options) result.push(...flattenOptions(option.options));
    else result.push(option);
  }
  return result;
}

export function filterTree(
  options: SelectOption[],
  filter: (input: string, option: SelectOption) => boolean,
  input: string,
): SelectOption[] {
  const result: SelectOption[] = [];
  for (const option of options) {
    if (option.options) {
      const children = filterTree(option.options, filter, input);
      if (children.length) result.push({ ...option, options: children });
    } else if (filter(input, option)) {
      result.push(option);
    }
  }
  return result;
}
