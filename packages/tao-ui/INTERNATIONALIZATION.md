# Internationalization contract

Implementation and acceptance are tracked in the root `STATUS.md`.

## Locale configuration and compatibility

- Keep `TaoProvider locale`, `enUS`, `zhCN`, all existing `TaoLocale` fields and component overrides compatible. Missing custom keys inherit from the nearest provider, with English at the root.
- Built-in locales cover `enUS`, `zhCN`, `zhTW`, `jaJP`, `koKR`, `frFR`, `deDE`, `esES`, `itIT`, `ptBR`, `ruRU`, `arEG`, `hiIN`, `trTR`, `idID`, `thTH` and `viVN`. Each is independently importable. Their dictionaries include component text, accessible names and default form validation messages.
- Explicit component text and formatting options take precedence over provider defaults. Caller-supplied labels, option content and business messages remain caller-owned.
- A nested provider merges individual `messages` keys and form validation groups rather than discarding sibling translations. Runtime locale changes update components and portaled content.
- Legacy dictionaries selecting `en_US` or `zh_CN` receive the corresponding built-in regional metadata and new messages when the selected language changes; their existing fields and explicit overrides stay authoritative.
- Text direction remains an independent setting. Arabic examples use both `locale={arEG}` and `direction="rtl"`.

## Dates

- `weekdays` keeps its existing Monday-first storage order. `weekStartsOn` selects the displayed first day (`0` is Sunday); a custom locale without this metadata retains inherited rules. Built-in Calendar and DatePicker use the same regional week rule.
- Date formatting and parsing use a Day.js instance locale. Loading or rendering a language pack must not change Day.js global locale.
- Existing ISO-like default `format` strings and callback/value types remain unchanged. Callers can use named-month or localized format tokens to request a regional display format.
- Calendar uses the pack's picker resources, with its existing per-component `locale` override taking precedence. The calendar system remains Gregorian.

## Numbers

- Built-in packs provide a BCP 47 `numberLocale`. Display grouping, decimal symbols and digits follow that locale. An explicit numeric component locale or separator overrides provider defaults.
- Numeric input continues to emit canonical ASCII decimal strings. Locale display and parsing must preserve precision, signs, percentage semantics, partial input and cursor behavior without converting the canonical value to a JavaScript Number.
- Native digits for the chosen locale and canonical ASCII digits are accepted. Locale switching changes presentation, not the represented value.
- Statistic retains existing precision/truncation semantics and custom formatter priority.

## Acceptance

- Complete dictionaries and placeholders for all 17 locales; sample translation assertions and default form errors.
- React 18/19 tests for nested providers, runtime changes, component overrides and date/number boundary behavior.
- Browser checks for desktop/mobile surfaces, portals, long translated text, Arabic RTL, French separators, Indian grouping and native Arabic digits.
- Full repository-required lint, types, tests, package/build and documentation/component checks. Browser evidence does not establish native mobile keyboard, screen-reader pronunciation or professional translation review.
