# Responsive behavior

## Select

- Automatic mode uses viewport width below 576px, not device identity or container width. `mobile` explicitly selects the initial surface.
- An open Select keeps its surface until it closes. Resizing or rotating preserves the mobile draft, search input and focus. The next opening uses the new viewport or `mobile` value. Initial automatic mode resolves after hydration.
- Desktop changes commit immediately. Mobile single selection commits immediately; mobile multiple/tags selection commits on Done and cancels on other close actions.
- `maxCount`, controlled `searchValue` / `onSearch`, `filterOption`, tag creation, `tokenSeparators` and `autoClearSearchValue` use the same selection rules in both surfaces. New mobile tags remain visible and can be deselected before Done. IME composition does not create a tag until confirmed.
- `maxTagCount="responsive"` measures available trigger space and folds excess tags into `maxTagPlaceholder`. It observes container and tag size changes, including custom `tagRender` output. Numeric limits retain their fixed-count behavior.
- `classNames` / `styles` apply to trigger/tag parts and mobile popup, search, group, item and empty parts. On mobile, `popup` styles the Drawer root, and `popupRender` wraps its content. `optionRender`, `labelRender` and `tagRender` work in both surfaces.
- `placement`, `popupMatchSelectWidth`, `listHeight` and `getPopupContainer` configure desktop popups. Mobile uses the bottom Drawer and its viewport-based height. `hideSelected` remains a desktop list option. Native `name` serialization is supported for desktop single-select; serialize application values explicitly for multiple/mobile selection.

## Layout and touch

RangePicker constrains its two-panel surface to the viewport. Pagination wraps its controls when space is limited. Multi-select triggers grow with their tags unless responsive folding is enabled.

On a coarse primary pointer, Button, form controls, Checkbox/Radio labels, pagination and Select clear/tag actions target 44px. Switch retains its compact visual track and reserves space for a 44px hit area. Fine-pointer sizes and compact density remain unchanged. This rule covers these basic controls, not every dense calendar/table cell or arbitrary custom renderer.

## Language

`TaoProvider` accepts `locale?: Partial<TaoLocale>`. The root uses `enUS`; nested providers merge overrides with their parent's dictionary. `zhCN`, `enUS` and `TaoLocale` are exported from the root and `/provider` entries.

The dictionary currently covers Select search/empty/confirmation/removal text, Drawer close labels, and DatePicker/RangePicker navigation, calendar month/weekday labels and time controls. Other component copy and caller-supplied option/preset labels are unchanged. Explicit component text such as `placeholder` and `notFoundContent` takes precedence.

`months` has 12 January-first entries and `weekdays` has seven Monday-first entries. `monthTitle` and `calendarTitle` receive a **zero-based** month and the year. Date values, serialization formats and the calendar's Monday-first week order do not change; Day.js global locale is untouched.

```tsx
import { TaoProvider, zhCN } from '@rockshin/tao-ui/provider';

<TaoProvider locale={{ ...zhCN, done: '确认选择' }}>
  <App />
</TaoProvider>
```

## Verification boundary

Local regression covers React 18/19 behavior and a Chrome viewport/pointer matrix at 320, 375, 479, 480, 575, 576, 768 and 1024px, including container resize, draft/focus retention, touch hit testing and Chinese text. This is desktop browser emulation; real iOS Safari/Android devices, software keyboards, safe areas and screen readers still require separate acceptance.
