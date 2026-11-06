# Responsive behavior

## Select

- Automatic mode uses viewport width below 576px, not device identity or container width. `mobile` explicitly selects the initial surface.
- An open Select keeps its surface until it closes. Resizing or rotating preserves the mobile draft, search input and focus. The next opening uses the new viewport or `mobile` value. Initial automatic mode resolves after hydration.
- Desktop changes commit immediately. Mobile single selection commits immediately; mobile multiple/tags selection commits on Done and cancels on other close actions.
- `maxCount`, controlled `searchValue` / `onSearch`, `filterOption`, tag creation, `tokenSeparators` and `autoClearSearchValue` use the same selection rules in both surfaces. New mobile tags remain visible and can be deselected before Done. IME composition does not create a tag until confirmed.
- `maxTagCount="responsive"` measures available trigger space and folds excess tags into `maxTagPlaceholder`. It observes container and tag size changes, including custom `tagRender` output. Numeric limits retain their fixed-count behavior.
- `classNames` / `styles` apply to trigger/tag parts and mobile popup, search, group, item and empty parts. On mobile, `popup` styles the Drawer root, and `popupRender` wraps its content. `optionRender`, `labelRender` and `tagRender` work in both surfaces.
- `placement`, `popupMatchSelectWidth`, `listHeight` and `getPopupContainer` configure desktop popups. Mobile uses the bottom Drawer and its viewport-based height. `hideSelected` remains a desktop list option. Native `name` serialization is supported for desktop single-select; serialize application values explicitly for multiple/mobile selection.

## Cascader

- Like Select, Cascader uses a bottom Drawer below 576px; `mobile` overrides automatic detection and `mobileTitle` overrides the field-label/localized title. The active surface stays fixed until closed.
- Single leaf selection commits immediately. Multiple selection uses a draft: Done commits it, while closing the drawer cancels it. Search, custom field names, disabled options and lazy loading retain the Cascader engine's behavior.
- Hierarchy columns stay inside the drawer, with touch-sized rows and horizontal scrolling when the full path exceeds the available width. `Cascader.Panel` remains inline.
- Desktop clear actions replace the suffix on hover or keyboard focus. Touch keeps the clear action visible in the suffix position, matching Select.

## Layout and touch

Select, DatePicker and RangePicker share mobile drawer title resolution: `mobileTitle` → nearest `Form.Item`/`FormField` label → localized component text. Labels flow through wrappers and update with the field; generated required marks and help text are excluded. `mobileTitle` accepts React content and also works without a form. Placeholders remain input hints and no longer name drawers. Fields built with native labels should pass `mobileTitle` explicitly. Desktop popup behavior is unchanged.

Select, TreeSelect, Cascader, AutoComplete, DatePicker, RangePicker, TimePicker (including TimePicker.RangePicker) and Mentions reveal their field clear action on hover for fine pointers. Keyboard focus on the clear action also reveals it; touch devices without hover keep it visible. Individual tag removal actions remain visible.

RangePicker constrains its two-panel surface to the viewport. Pagination wraps its controls when space is limited. Multi-select triggers grow with their tags unless responsive folding is enabled.

On a coarse primary pointer, Button, form controls, Checkbox/Radio labels, pagination and Select clear/tag actions target 44px. Switch retains its compact visual track and reserves space for a 44px hit area. Fine-pointer sizes and compact density remain unchanged. This rule covers these basic controls, not every dense calendar/table cell or arbitrary custom renderer.

## Language

`TaoProvider` accepts `locale?: Partial<TaoLocale>`. The root uses `enUS`; nested providers merge overrides with their parent's dictionary, including individual `messages` keys and form validation groups. All 17 built-in packs are exported from the root and `/provider`, with independent `/locale/fr-FR`-style imports. See [Internationalization](./INTERNATIONALIZATION.md) for the complete contract.

The dictionary supplies component defaults, accessible names, empty states, upload actions, date/time controls and default form validation errors. Caller-supplied labels, business content and explicit component text such as `placeholder` and `notFoundContent` take precedence. Static Modal methods created outside the tree retain root defaults; use `Modal.useModal()` and render its holder inside the provider for contextual language.

`months` has 12 January-first entries and `weekdays` has seven Monday-first entries. `weekStartsOn` selects the displayed first day consistently across Calendar and DatePicker. `monthTitle` and `calendarTitle` receive a **zero-based** month and the year. Date values and default ISO formats remain unchanged; explicit localized tokens such as `format="L"` select a regional format. Named months use the provider's Day.js locale without mutating the value or global locale. Numbers follow `numberLocale` while numeric input callbacks retain canonical ASCII decimal strings.

```tsx
import { TaoProvider, zhCN } from '@rockshin/tao-ui/provider';

<TaoProvider locale={{ ...zhCN, done: '确认选择' }}>
  <App />
</TaoProvider>
```

## Verification boundary

Local regression covers React 18/19 behavior and a Chrome viewport/pointer matrix at 320, 375, 479, 480, 575, 576, 768 and 1024px, including container resize, draft/focus retention, touch hit testing and Chinese text. This is desktop browser emulation; real iOS Safari/Android devices, software keyboards, safe areas and screen readers still require separate acceptance.
