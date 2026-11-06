import type { ValidateMessages } from '@rc-component/form/es/interface';
import type { TaoLocale, TaoMessages } from '../locales/types';
import { enUS, zhCN } from './locale';

export type ResolvedTaoLocale = TaoLocale & { messages: TaoMessages };

/** rc Form groups contain templates; override individual templates, not siblings. */
export function mergeValidateMessages(
  parent: ValidateMessages | undefined,
  override: ValidateMessages | undefined,
): ValidateMessages | undefined {
  if (!override) return parent;
  return {
    ...parent,
    ...override,
    date: { ...parent?.date, ...override.date },
    types: { ...parent?.types, ...override.types },
    string: { ...parent?.string, ...override.string },
    number: { ...parent?.number, ...override.number },
    array: { ...parent?.array, ...override.array },
    pattern: { ...parent?.pattern, ...override.pattern },
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
    ...override,
    messages: { ...parent.messages, ...legacy?.messages, ...override.messages },
    form: mergeValidateMessages(legacy?.form ?? parent.form, override.form),
  };
}
