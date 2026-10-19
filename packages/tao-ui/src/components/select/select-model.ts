import type { SelectOption } from './select-types';

export interface SelectIndex {
  optionByValue: Map<string, SelectOption>;
  optionByToken: Map<string, SelectOption>;
}

function forEachLeafOption(
  options: SelectOption[],
  visit: (option: SelectOption) => void,
) {
  for (const option of options) {
    if (option.options) {
      forEachLeafOption(option.options, visit);
    } else {
      visit(option);
    }
  }
}

export function buildSelectIndex(options: SelectOption[]): SelectIndex {
  const optionByValue = new Map<string, SelectOption>();
  const optionByToken = new Map<string, SelectOption>();

  forEachLeafOption(options, (option) => {
    if (!optionByValue.has(option.value)) {
      optionByValue.set(option.value, option);
    }
    if (!optionByToken.has(option.value)) {
      optionByToken.set(option.value, option);
    }
    if (typeof option.label === 'string' && !optionByToken.has(option.label)) {
      optionByToken.set(option.label, option);
    }
  });

  return { optionByValue, optionByToken };
}

export function flattenLeafOptions(options: SelectOption[]): SelectOption[] {
  const result: SelectOption[] = [];
  forEachLeafOption(options, (option) => result.push(option));
  return result;
}

export function countLeafOptions(options: SelectOption[]): number {
  let count = 0;
  forEachLeafOption(options, () => {
    count += 1;
  });
  return count;
}

export function defaultFilter(input: string, option: SelectOption): boolean {
  const label =
    typeof option.label === 'string' ? option.label : String(option.label);
  return label.toLowerCase().includes(input.toLowerCase());
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
