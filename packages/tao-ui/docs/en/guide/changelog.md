---
title: Changelog
description: Version history for @rockshin/tao-ui, including fixes for uploads, selection, forms and overlays.
---

# Changelog

User-facing changes for `@rockshin/tao-ui`, listed by release. Dates use UTC+8.

## 0.0.54

2026-11-10

- [Textarea](/components/textarea) aligns its character count beside the native resize handle at the bottom corner and reserves room for text.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.53...v0.0.54)

## 0.0.53

2026-11-10

- [Textarea](/components/textarea) places the character count inside the control without adding a separate row.
- [Upload](/components/upload) keeps picture-card action backgrounds transparent over the image mask.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.52...v0.0.53)

## 0.0.52

2026-11-10

- [Upload](/components/upload) aligns picture cards, circular tiles, thumbnails and file actions; card triggers follow the file list and can be hidden with `null` or `false`. Uploading files show progress, and download actions appear for completed files. Dragger height applies to the drop zone independently of the file list.
- [Input](/components/input) preserves the password placeholder font when toggling visibility. [Modal](/components/modal) reserves vertical space around its body content so control focus rings remain visible.
- Upload documentation adds expanded bilingual examples and API guidance, original demo artwork, and a responsive two-column layout.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.51...v0.0.52)

## 0.0.51

2026-11-08

- Button sizes nested SVG icons consistently while respecting explicit dimensions; Input centers suffix content; Select maintains its intended single-row multiple-selection height; Transfer aligns its selection chevron and disabled state.
- The documentation adds a bilingual Showcase and responsive commerce example. Clean builds now prepare the icon package used by the Showcase.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.49...v0.0.51)

## 0.0.50

2026-11-08

- [Button](/components/button) sizes nested SVG icons consistently while respecting explicit dimensions.
- [Input](/components/input) centers suffix content, and [Select](/components/select) maintains its intended height for a single row of multiple selections.
- [Transfer](/components/transfer) aligns the selection menu chevron with Select and clarifies its disabled state.
- The documentation adds a bilingual Showcase and a responsive commerce example, alongside refreshed component and home pages.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.49...v0.0.50)

## 0.0.49

2026-11-07

**Data entry and selection**

- [Form](/components/form) resets controlled field values and keeps validation feedback and native submission in sync.
- [Select](/components/select) keeps the search query when a controlled multiple selection is declined and matches option values that contain a token separator.
- [Upload](/components/upload) shows a request setup error on the affected file while the rest of the batch continues. Once a request succeeds or fails, later callbacks cannot change its result. A disabled upload also ignores pasted files.
- [RangePicker](/components/range-picker) discards unconfirmed text when the user clears the range. If a controlled DatePicker or RangePicker ignores a keyboard request to open and the user leaves the field, opening it later no longer moves focus back.
- [Cascader](/components/cascader) drops newly selected paths that are removed or become disabled before the user taps Done on mobile. Existing selections the user leaves in place are preserved.
- [Table](/components/table) applies Select All to eligible rows on the current page, using the latest disabled state. Responsive columns retain their configured default sort when they appear.
- [Input](/components/input) and [Textarea](/components/textarea) accept Enter again after an interrupted input method composition. Textarea autosizing accounts for custom padding and borders. Changes to the arrays passed to CheckboxGroup and Slider callbacks no longer alter component state.

**Overlays and display**

- [Image](/components/image) removes its open preview when preview is disabled. Re-enabling preview leaves it closed until the user opens it again, unless the application controls it as open.
- [Modal](/components/modal) closes the remaining dialogs when an `afterClose` callback throws during `Modal.destroyAll()`, then reports the error. Tour uses its top-level scroll options unless a step supplies its own, and FloatButton detects outside clicks inside its iframe.
- [Badge](/components/badge) positions a status dot over wrapped content, including in RTL. Card renders arrays of tab bar extras, and BorderBeam resumes animation when its host element is replaced.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.48...v0.0.49)

## 0.0.48

2026-11-06

**Fixed and improved**

- **Form** reserves 24px for single-line feedback (18px for the message, 2px above and 4px below) at 12–14px message font sizes. Messages keep their existing font size, single lines appear without shifting fields, and longer messages wrap.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.47...v0.0.48)

## 0.0.47

2026-11-06

**Fixed and improved**

- **Form** restores required and error styles when imported from the form subpath. Feedback takes less space, and fields without validation or messages leave no empty feedback row.
- **Cascader** uses a bottom drawer on mobile. Search works inside it, single selection applies immediately, and multiple selection applies on Done. The clear affordance and expand arrow align with the control layout.

**Documentation**

- The bilingual docs use consistent colors, navigation and side-by-side example layouts.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.46...v0.0.47)

## 0.0.46

2026-11-06

**Added**

- **TaoProvider** adds 17 locale packs, available from the package root and individual `@rockshin/tao-ui/locale/*` imports. Provider locale now translates component labels, empty states, modal actions and form validation, including content rendered in portals.
- **DatePicker, RangePicker, Calendar and TimePicker** use regional labels and calendar conventions. Localized date and time formats support parsing user input, and per-component locale overrides take precedence.
- **InputNumber and Statistic** display regional digits and separators. InputNumber continues to emit exact decimal strings, and date pickers retain their default output formats unless a localized format is selected.

**Documentation**

- Updated the bilingual site with a vector logo, dark-mode artwork and a favicon.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.45...v0.0.46)

## 0.0.45

2026-11-06

**Added**

- **TaoProvider** adds `direction`. Components and portals inherit direction, and individual components can override it or use native `dir="auto"`.

**Fixed and improved**

- **RTL** fixes horizontal scroll, Splitter dragging, Rate input, pagination icons, Table alignment and fixed columns, and keyboard interaction in selection controls. Desktop and mobile popups keep their source direction.

**Compatibility**

- **Segmented** no longer hits a React 18 maximum update depth error during keyboard navigation.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.44...v0.0.45)

## 0.0.44

2026-11-05

**Added**

- **Form** adds `FormInstance.scrollToField(name, options)` for mounted fields, including nested names, `Form.List` paths and `noStyle` items. Options control scrolling and can focus the field. `FormScrollOptions` is exported from the root and form subpath.

**Fixed and improved**

- The Chinese AI agent guide link resolves to the correct locale URL.

**Migration**

- Custom controls used as scroll targets should forward a DOM or `nativeElement` ref, or the field ID.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.43...v0.0.44)

## 0.0.43

2026-11-05

**Added**

- **Input** adds clear/count support, Password, Search, TextArea, OTP and underlined variants.
- **Collapse** supports item panels, accordion behavior and built-in styling.

**Fixed and improved**

- Improved Calendar and Carousel controls, RadioGroup selection, Form feedback spacing, Tree and TreeSelect checking, and responsive picker titles. Fixed isolated CSS and dark theme details across controls.

**Migration**

- Replace `Collapsible` and `/collapsible` imports with `Collapse` and `/collapse`.

**Documentation**

- Redesigned the bilingual site and added agent guides, `agent-manifest.json`, the package's `component-manifest.json` export, and searchable Markdown references.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.42...v0.0.43)

## 0.0.42

2026-11-05

**Added**

- Expanded the catalog to 73 visual entries. New entries include Cascader, Tree, TreeSelect, Upload, Transfer, Calendar, ColorPicker, Carousel, and application-scoped feedback via App.
- Added public `GetProps`, `GetProp` and `GetRef` utilities for deriving types from components.

**Fixed and improved**

- Improved responsive selection controls, provider localization and focus handling, and unified the default theme radius to 6px.

**Documentation**

- Added bilingual runnable examples with independent phone and desktop previews, synchronized dark mode and copyable snippets.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.41...v0.0.42)

## 0.0.41

2026-11-04

**Fixed and improved**

- **Select** restores vertical scrolling in height-limited option lists for single, searchable, multiple and tags modes.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.40...v0.0.41)

## 0.0.40

2026-10-30

**Fixed and improved**

- **Fields, pickers and overlays** improve native labels, required and disabled semantics, and focus restoration. RangePicker names each endpoint and announces committed selections. Mobile Select exposes its current selection and search label.
- **Tabs, Spinner and Tag** expose clearer keyboard or accessibility states. Popover and confirmation dialogs use their visible titles as accessible names.

**Compatibility**

- Moved tao-ui into a Bun workspace and upgraded its build to Rslib 1.x. The npm package remains `@rockshin/tao-ui`.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.39...v0.0.40)

## 0.0.39

2026-10-18

**Fixed and improved**

- **Theme, Table, Tag and Steps** mix colored and neutral tints in OKLab. Primary and status fills stay closer to their intended hue, and Table hover and row separators are easier to distinguish.
- **Select** enlarges the `allowClear` hit area so near-edge clicks clear the value without opening the popup.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.38...v0.0.39)

## 0.0.38

2026-10-15

**Added**

- **Table** adds sticky headers when `scroll.y` is set, expandable rows via `expandable`, and a `Table.Summary` footer that can be pinned and aligned with fixed columns.

**Fixed and improved**

- **Table** keeps pinned headers and fixed cells opaque, updates edge shadows on container resize, and covers the full table with the loading mask.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.37...v0.0.38)

## 0.0.37

2026-10-12

**Fixed and improved**

- **Popover** uses the normal popup stacking level so a nested Select, Menu or DatePicker can open above its parent Popover.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.36...v0.0.37)

## 0.0.36

2026-10-05

**Fixed and improved**

- **Table** keeps sort, filter and pagination callbacks aligned with the same data view and honors controlled state supplied by the parent.
- **Select** keeps change, select, deselect and clear notifications in a consistent order. Mobile confirmation emits the committed changes, and cancelling discards the draft.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.35...v0.0.36)

## 0.0.35

2026-09-13

**Fixed and improved**

- **Tabs** renders the animated active indicator with square ends, avoiding pointed caps as it scales to the selected tab's width.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.34...v0.0.35)

## 0.0.34

2026-09-13

**Added**

- Added **Steps** with numbered progress, per-step status, keyboard-activatable items and `maxCount` for collapsing long workflows.

**Fixed and improved**

- **Table** keeps row dividers visible over colored rows and clips cell backgrounds inside rounded table corners.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.33...v0.0.34)

## 0.0.33

2026-09-08

**Fixed and improved**

- **Select** in tags mode suppresses an empty popup when empty content is disabled. Free-text tag entry, suffix icons, explicit empty content and custom popups still work.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.32...v0.0.33)

## 0.0.32

2026-09-06

**Fixed and improved**

- **DatePicker and RangePicker** handle changed date bounds, rejected edits and explicit form clears, and keep visible months synchronized.
- **Select, Table, InputNumber and Splitter** fix updates to search, selection, pagination, numeric input and drag state.
- **Popover, Modal, Checkbox, Tabs and Form** improve focus handling, label associations, checked-state rendering and cleared boolean values.

**Compatibility**

- Added React 18.2 support alongside React 19, including ref compatibility, and component subpath exports for importing an individual component with its styles.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.31...v0.0.32)

## 0.0.31

2026-09-01

**Fixed and improved**

- **Table** fixed headers use the active variant's background. Fixed columns gain edge shadows when there is more content to scroll into view.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.30...v0.0.31)

## 0.0.30

2026-08-28

**Added**

- **Button** adds the `bare` variant for retaining interaction behavior with caller-defined visuals.

**Fixed and improved**

- **Button** defaults move to a low-specificity component layer so consumer classes can override color, spacing and shape.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.29...v0.0.30)

## 0.0.29

2026-08-27

**Fixed and improved**

- **Input** geometrically centers the native text line box so the caret and selection align with the control's height.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.28...v0.0.29)

## 0.0.28

2026-08-25

**Fixed and improved**

- **Textarea** uses low-specificity defaults in the component cascade layer, letting Semantic DOM classes override the inner textarea's styles.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.27...v0.0.28)

## 0.0.27

2026-08-19

**Fixed and improved**

- **DatePicker and RangePicker** restore the controlled value after rejected edits and cancel unfinished range selection when closing or receiving a new value.
- **Select** keeps the first option when resolving duplicate values. **Sonner** keeps a recreated toast visible when an earlier instance's exit timer completes and cleans up loading toasts when promises settle.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.26...v0.0.27)

## 0.0.26

2026-08-19

**Added**

- Added **Form** with field validation, lists and dependency tracking, plus **Alert**, **Popover**, **Popconfirm** and **Tooltip**.
- **Table** columns accept responsive breakpoints. Added public responsive helpers and theme token utilities.

**Fixed and improved**

- **Button** keeps a typographic line box while flex-centering content to improve alignment across consumer fonts.

**Documentation**

- Added bilingual Rspress references with runnable examples and API tables. [Documentation PR](https://github.com/rickyshin93/tao-ui/pull/2)

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.25...v0.0.26)

## 0.0.25

2026-08-04

**Fixed and improved**

- **Input** centers text and password dots independently so aligning the mask glyphs does not shift the password selection line box.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.24...v0.0.25)

## 0.0.24

2026-08-04

**Fixed and improved**

- **Input** uses size-aware vertical padding to center native text and password mask glyphs.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.23...v0.0.24)

## 0.0.23

2026-08-04

**Fixed and improved**

- **Input** clips browser autofill paint within rounded control edges and preserves the text's normal vertical metrics.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.22...v0.0.23)

## 0.0.22

2026-08-03

**Added**

- Added typed Semantic DOM contracts for visual components, with dedicated metadata and theme helper imports.

**Fixed and improved**

- **DatePicker** improves keyboard navigation, **FormField** associates labels and help with controls, and **Select** keeps selected option checkmarks within the popup width.
- **Button** aligns icon size and text spacing. **TaoProvider** respects disabled motion and resets inherited theme seeds when `inherit={false}`.

**Migration**

- Import metadata and token helpers from `@rockshin/tao-ui/meta` and `@rockshin/tao-ui/tokens` when moving from their former root exports.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.21...v0.0.22)

## 0.0.21

2026-07-26

**Added**

- **Input** supports React SVG prefixes with automatic positioning and space reserved for typed text.

**Fixed and improved**

- **Drawer and Modal** close on an actual mask click when enabled. Interacting with a nested portal keeps the dialog open.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.20...v0.0.21)

## 0.0.20

2026-07-25

**Fixed and improved**

- **Input** removes duplicate start padding when a prefix is present, so the text starts next to the prefix at the intended spacing.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.19...v0.0.20)

## 0.0.19

2026-07-25

**Compatibility**

- Refreshed the Rslib, Rstest and Storybook development toolchain and synchronized the Bun lockfile during releases. This patch contains no component changes.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.18...v0.0.19)

## 0.0.18

2026-07-25

**Added**

- **TaoProvider** adds dark mode via `theme.mode`. Nested providers inherit the mode and portaled components carry their source theme. [PR #1](https://github.com/rickyshin93/tao-ui/pull/1)
- **DatePicker and RangePicker** accept strictly formatted typed dates on desktop and retain the drawer on mobile. Searchable **Select** supports editable desktop single selection and inline search for multiple and tags modes.

**Fixed and improved**

- **Input and RangePicker** improve prefix and text alignment. Table, Tag, Modal and Drawer derive their surfaces and overlays from theme tokens.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.17...v0.0.18)

## 0.0.17

2026-07-12

**Added**

- **Button** adds `icon` and `loadingIcon`. The icon slot stays mounted while switching to loading, preventing layout flicker.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.16...v0.0.17)

## 0.0.16

2026-07-12

**Fixed and improved**

- **Sonner** measures toast heights for expanded stacking, preserves positions during removal, and improves enter/exit motion and the close button's hit area.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.15...v0.0.16)

## 0.0.15

2026-07-12

**Added**

- Added **Sonner** and the imperative `toast()` API, including rich colors, custom content, action buttons and promise-driven loading, success and error states.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.14...v0.0.15)

## 0.0.14

2026-07-10

**Added**

- **Select** adds search, multiple and tags modes, custom tag rendering, selection limits and a mobile drawer with confirmation for multiple selection.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.13...v0.0.14)

## 0.0.13

2026-07-09

**Fixed and improved**

- **Checkbox and Radio** keep their native inputs within the visual control box so they remain focusable and clickable without intercepting clicks outside the control.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.12...v0.0.13)

## 0.0.12

2026-07-05

**Fixed and improved**

- **Select, DatePicker, RangePicker, Dropdown and menus** apply portal theme tokens directly to popup elements, avoiding leftover wrapper nodes for closed popups.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.11...v0.0.12)

## 0.0.11

2026-07-05

**Added**

- Added a component metadata manifest and public component prop and Semantic DOM types.

**Fixed and improved**

- **Breadcrumb** renders action items as buttons. **DatePicker** uses focusable native buttons for dates, with accessible names and disabled states.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.10...v0.0.11)

## 0.0.10

2026-07-05

**Fixed and improved**

- **FormSection** removes extra spacing caused by native fieldset and legend layout. Portal theme scopes are layout-transparent in flex and grid.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.9...v0.0.10)

## 0.0.9

2026-07-04

**Added**

- Added **InputNumber**, a themed numeric field with grouping, caret preservation, and canonical string values for precision. Also exposes headless numeric input building blocks.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.8...v0.0.9)

## 0.0.8

2026-07-03

**Added**

- **Table** adds row and cell props via `onRow`, `onHeaderRow`, `onCell` and `onHeaderCell`, plus row styles and callback-based Semantic DOM customization.

**Fixed and improved**

- **Tag** adjusts spacing and line height so its text and icon align more consistently.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.7...v0.0.8)

## 0.0.7

2026-07-03

**Added**

- **Table** defaults to the new `modern` variant with a subtle frame and lighter header. Existing variants can still be selected explicitly.

**Fixed and improved**

- **Select** centers text and icons and allows keyboard clearing with Enter or Space. **Tag** refines semantic color fills and close button styling.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.6...v0.0.7)

## 0.0.6

2026-07-02

**Fixed and improved**

- **TaoProvider** recalculates derived tokens inside nested providers and keeps children in their parent flex or grid layout. Equivalent inline token values avoid unnecessary context updates.
- **Theme and Button** update the default radius from 6px to 10px, refine focus rings and borders, and adjust button text weight and shadows.

**Migration**

- **Input, Textarea, Select and date pickers** fill the available width by default. Set the width explicitly if a layout relied on the old 200px default.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.5...v0.0.6)

## 0.0.5

2026-07-01

**Fixed and improved**

- **Input** fills the available width in a flex row. Single-row **Textarea** matches the Input height for the same size.

**Compatibility**

- The package preserves entry-point CSS with strict tree shaking.

**Migration**

- Set `rows={3}` to keep the previous taller Textarea default.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.4...v0.0.5)

## 0.0.4

2026-06-08

**Compatibility**

- Replaced Tailwind and PostCSS-generated styles with native CSS and centralized theme and control style imports at the package entry point.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.3...v0.0.4)

## 0.0.3

2026-06-07

**Added**

- **Select** adds an Ant Design-style single-select API for controlled opening, popup placement and width, custom rendering, grouped options and semantic styling.
- Added **Spinner** with delay, custom indicator, content overlay and fullscreen modes.

**Fixed and improved**

- Portaled controls inherit theme tokens. Popup layers render above Modal and Drawer, and clearing Select keeps the popup closed.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.2...v0.0.3)

## 0.0.2

2026-06-07

**Added**

- Added **Breadcrumb, Collapsible, ContextMenu, Dropdown and Textarea**. Textarea supports shared control variants and `autoSize` with minimum and maximum rows.
- Added **Modal** with a controlled `open` prop, imperative confirmation and status methods, and `Modal.useModal()`.

**Fixed and improved**

- Form controls share focus and variant styles. Container and elevated surfaces use white with derived neutral colors.

[Compare changes](https://github.com/rickyshin93/tao-ui/compare/v0.0.1...v0.0.2)

## 0.0.1

2026-06-06

**Added**

- Initial release of **@rockshin/tao-ui** for React 19, with semantic DOM customization and OKLCH theme tokens.
