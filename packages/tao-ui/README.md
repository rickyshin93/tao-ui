# tao-ui

A component library for React 18.2 and 19 with semantic DOM customization and OKLCH-based theming.

Documentation: [English](https://rickyshin93.github.io/tao-ui/) · [简体中文](https://rickyshin93.github.io/tao-ui/zh/).

Agent access: [guide](https://rickyshin93.github.io/tao-ui/guide/agents) · [JSON discovery index](https://rickyshin93.github.io/tao-ui/agent-manifest.json) · [Markdown index](https://rickyshin93.github.io/tao-ui/llms.txt). The website exposes versioned package facts and bilingual API/example links; the npm package exports `@rockshin/tao-ui/component-manifest.json` and `@rockshin/tao-ui/meta`.

## Features

- **React 18.2 and 19** — supports React 18.2 as the minimum version and React 19, with React Compiler optimizations.
- **Semantic DOM** — every visual component exposes `classNames` / `styles` props to style internal parts by semantic name, no fragile selector hacks.
- **OKLCH theming** — `TaoProvider` derives a full theme (radius, font scale, control heights) from a small seed token set; components inherit `size` / `disabled` / `variant`.
- **Typed** — full `.d.ts`, every Props and SemanticPart type exported.

## Install

```bash
npm install @rockshin/tao-ui
# or
bun add @rockshin/tao-ui
```

Peer dependencies: `react ^18.2.0 || ^19.0.0`, `react-dom ^18.2.0 || ^19.0.0`. The minimum version is 18.2; React 19 is also supported. The date pickers' `dayjs` dependency is installed automatically.

## Usage

Wrap your app once with `TaoProvider`, then use components. Import the component CSS that ships alongside the JS (your bundler resolves the side-effect imports automatically).

```tsx
import { TaoProvider, Input, Select, Switch } from '@rockshin/tao-ui';

export default function App() {
  return (
    <TaoProvider size="medium">
      <Input placeholder="Search" />
      <Select options={[{ label: 'A', value: 'a' }]} />
      <Switch defaultChecked />
    </TaoProvider>
  );
}
```

### Accessibility

Use `FormField` or `Form.Item` to label controls and associate help/validation messages. Input, Textarea, InputNumber, Select, Checkbox, Radio, Switch and the date pickers forward field ARIA attributes to their interactive elements; CheckboxGroup and RadioGroup expose group labels and validation messages. Placeholders are not a substitute for a label. For long forms, call `form.scrollToField(name, { focus: true })` using `Form.useForm()`, the Form ref or `Form.useFormInstance()`; nested and full `Form.List` paths are supported. Custom controls must forward `ref` or `id`, and the target field must be mounted.

Radio maps `aria-required` to native `required`; an explicit `required` prop takes precedence. Group options retain their native disabled state, including explicit `disabled={false}` overrides.

Desktop date inputs expose `combobox` semantics: ArrowDown opens the calendar and moves focus into it; Escape closes it and returns focus. RangePicker combines explicit ARIA labels with each endpoint placeholder, so use distinct start/end text. Native labels can instead target `id` and `${id}-end`. Calendar, month, year and time choices expose their selection state.

Name Tabs with `aria-label` or `aria-labelledby`. Give Modal, Drawer and Popover a visible `title` or an explicit ARIA name; Popconfirm uses its question as the dialog name. Spinner accepts an ARIA name (default `Loading` when no tip is present), and wrapped content reports `aria-busy` throughout loading, including its display delay.

Automated regression checks cover DOM semantics and keyboard interactions in React 18/19. They do not replace testing your composed screens with a browser and screen reader.

### Responsive controls and language

Select, Cascader, DatePicker and RangePicker adapt to the viewport. Select keeps its current editing surface while open, supports `maxTagCount="responsive"`, and shares selection limits, controlled search and tag creation across desktop and mobile. Cascader uses a bottom drawer on phones, with immediate single selection and Done/cancel for multiple selection. Coarse pointers receive larger targets for basic controls.

```tsx
import { TaoProvider, zhCN } from '@rockshin/tao-ui/provider';

<TaoProvider locale={zhCN}>
  <App />
</TaoProvider>
```

TaoProvider supplies component text, accessible names, form validation messages and date/number regional settings. Built-in packs cover English, Simplified/Traditional Chinese, Japanese, Korean, French, German, Spanish, Italian, Brazilian Portuguese, Russian, Arabic (Egypt), Hindi, Turkish, Indonesian, Thai and Vietnamese. Packs are exported from the root and `/provider`, or independently as `import frFR from '@rockshin/tao-ui/locale/fr-FR'`.

Override individual keys with `locale={{ ...zhCN, done: '确认' }}` or `locale={{ messages: { loading: '处理中' } }}`. Nested providers inherit omitted text, including in portals. Date values and default ISO formats remain compatible; explicit `format="L"` requests a regional date format. Named months and week starts follow the locale without changing Day.js global locale. InputNumber and Statistic inherit regional digits/grouping; explicit `locale` or separator props take precedence, and numeric input still emits exact ASCII decimal strings. See the [internationalization contract](./INTERNATIONALIZATION.md) for all packs, precedence and verification boundaries.

### Right-to-left layouts

Set `<TaoProvider direction="rtl">` for an application or section. Components also inherit HTML `dir="rtl"` from their surrounding DOM. Explicit component `direction` props override inheritance; Carousel uses its existing `rtl` prop. Popups retain the direction of their trigger, including mobile Select and date-picker drawers. Nested `direction="ltr"` scopes can display Latin content inside an RTL application.

Directional keys, horizontal scrolling, splitters, ratings and fixed table columns follow the rendered direction. Explicit popup placements such as `bottomLeft` remain physical left/right positions. Locale and text direction are independent settings.

### Component imports

Use component entries to include only their styles and shared theme styles. No separate CSS import is needed. The root entry remains available and includes all component styles.

```tsx
import { Button, type ButtonProps } from '@rockshin/tao-ui/button';
import { TaoProvider } from '@rockshin/tao-ui/provider';
```

Entry names use kebab-case, such as `/input-number`, `/range-picker`, and `/form-layout`. Related exports share an entry: `CheckboxGroup` uses `/checkbox`, and `HeadlessInputNumber` uses `/number-input`.

The `/input` entry includes `Input.Password`, `Input.Search`, `Input.TextArea`, and `Input.OTP`. Input and Textarea support `allowClear`, `showCount`, custom `count`, and `onPressEnter`; existing native DOM refs and standalone `Textarea` remain supported. See the [Input examples and API](docs/en/components/input.mdx).

### Dark mode

Pure-CSS dark algorithm — no JS runtime. One prop flips every component, including portaled popups (Modal, Drawer, Select dropdowns):

```tsx
<TaoProvider theme={{ mode: 'dark' }}>
  <App />
</TaoProvider>
```

### Fonts

Like antd, tao-ui **does not bundle fonts**. The stack is Geist-first with a full system fallback (incl. CJK), so everything renders well out of the box. To get the designed Geist look:

```bash
pnpm add @fontsource/geist-sans @fontsource/geist-mono
```

```ts
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-mono/400.css';
```

### Customizing internal parts

```tsx
<Drawer
  classNames={{ root: 'my-drawer', header: 'my-drawer-header' }}
  styles={{ body: { padding: 24 } }}
/>
```

## Components

| Category | Components |
|----------|-----------|
| General | `Button`, `FloatButton` |
| Layout | `Stack`, `FormLayout`, `Splitter`, `Divider`, `Masonry` |
| Navigation | `Tabs`, `Pagination`, `Breadcrumb`, `Menu`, `Dropdown`, `ContextMenu`, `Affix` |
| Data Entry | `Form`, `Input`, `Textarea`, `InputNumber`, `Select`, `Checkbox`, `Radio`, `Switch`, `DatePicker`, `RangePicker`, `FormField`, `FormSection`, `FormActions`, `AutoComplete`, `Cascader`, `ColorPicker`, `Mentions`, `Rate`, `Slider`, `TimePicker`, `Transfer`, `TreeSelect`, `Upload` |
| Data Display | `Table`, `Tag`, `ScrollArea`, `Collapse`, `Tooltip`, `Popover`, `Avatar`, `Badge`, `BorderBeam`, `Calendar`, `Card`, `Carousel`, `Descriptions`, `Empty`, `Image`, `List`, `Listy`, `QRCode`, `Segmented`, `Statistic`, `Timeline`, `Tour`, `Tree`, `Watermark` |
| Feedback | `Modal`, `Drawer`, `Sonner`, `Spinner`, `Alert`, `Popconfirm`, `Progress`, `Result`, `Skeleton` |
| Config | `TaoProvider`, `App`, `useTaoConfig`, `useTaoToken` |

The 0.0.42 catalog adds 36 visual entries and the `GetProps`, `GetProp` and `GetRef` type utilities. New entries follow Ant Design 6.7.0 public APIs with tao-ui themes, Semantic DOM and component styles. Complex controls reuse low-level rc engines; `antd` is not a runtime dependency. Existing tao-ui APIs are unchanged. See the [compatibility scope](./ANTD-COMPATIBILITY.md) for the included APIs and boundaries.

The current workspace replaces `Collapsible` with `Collapse` (subpath `@rockshin/tao-ui/collapse`). Pass `items` with `key`, `label` and `children` for built-in panels; use `accordion` for a single open panel and `activeKey` / `onChange` for controlled expansion. Update imports from the old name/subpath.

Import types from the root or `@rockshin/tao-ui/util`. Compound APIs share their component entry, including `TimePicker.RangePicker`, `Tree.DirectoryTree`, `Image.PreviewGroup`, `Upload.Dragger`, `FloatButton.BackTop` and `App.useApp()`.

Responsive helpers: `useBreakpoint`, `useIsMobile`, plus breakpoint-map props on
`Stack` (`direction`/`gap`/`align`), `Modal` (`width`), and `Table` (column
`responsive`). `Select` / `Cascader` / `DatePicker` / `RangePicker` render as bottom drawers
on phones automatically.

Headless utilities: `useNumberInput` / `NumberInput`, and the `cx` semantic-class helper.

Token helpers are available from the package root or the dedicated subpath:

```ts
import { tokenVar, taoTokenNames, useTaoToken } from '@rockshin/tao-ui';
// or: import { taoTokenNames, tokenVar } from '@rockshin/tao-ui/tokens';
```

Package metadata uses an explicit subpath import:

```ts
import { componentDocs, getComponentDoc } from '@rockshin/tao-ui/meta';
```

## Documentation preview

From the repository root, run `bun run doc --port 4173` for the bilingual component reference, or `bun run doc:build` for the static build. All component pages include runnable examples with source expansion and copying. Phone previews run in a 390 × 640 iframe, with a 960 × 560 desktop mode; scaling the outer frame preserves the actual inner viewport. The frame follows site appearance and isolates toast containers. It does not emulate native browser engines, touch hardware, or software keyboards.

## License

[MIT](./LICENSE) © rickyshin

See [third-party notices](./THIRD_PARTY_NOTICES.md) for the upstream API reference attribution.
