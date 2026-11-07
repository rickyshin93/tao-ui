import type { ValidateMessages } from '@rc-component/form/es/interface';
import type { TaoLocale, TaoMessages } from '../locales/types';
import { enUS, zhCN } from './locale';

export type ResolvedTaoLocale = TaoLocale & { messages: TaoMessages };

function defined<T extends object>(value: T | undefined): Partial<T> {
  return Object.fromEntries(
    Object.entries(value ?? {}).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>;
}

/** rc Form groups contain templates; override individual templates, not siblings. */
export function mergeValidateMessages(
  parent: ValidateMessages | undefined,
  override: ValidateMessages | undefined,
): ValidateMessages | undefined {
  if (!override) return parent;
  return {
    ...parent,
    ...defined(override),
    date: { ...parent?.date, ...defined(override.date) },
    types: { ...parent?.types, ...defined(override.types) },
    string: { ...parent?.string, ...defined(override.string) },
    number: { ...parent?.number, ...defined(override.number) },
    array: { ...parent?.array, ...defined(override.array) },
    pattern: { ...parent?.pattern, ...defined(override.pattern) },
  };
}

export function mergeLocale(
  parent: ResolvedTaoLocale,
  override: Partial<TaoLocale> | undefined,
): ResolvedTaoLocale {
  if (!override) return parent;
  // Legacy dictionaries selected these two regional engines by their existing id.
  const legacy =
    override.locale !== parent.locale
      ? override.locale === 'zh_CN'
        ? zhCN
        : override.locale === 'en_US'
          ? enUS
          : undefined
      : undefined;
  return {
    ...parent,
    ...(legacy
      ? {
          numberLocale: legacy.numberLocale,
          dayjsLocale: legacy.dayjsLocale,
          weekStartsOn: legacy.weekStartsOn,
          pickerLocale: legacy.pickerLocale,
        }
      : {}),
    ...defined(override),
    messages: {
      ...parent.messages,
      ...legacy?.messages,
      ...defined(override.messages),
    },
    form: mergeValidateMessages(legacy?.form ?? parent.form, override.form),
  };
}
