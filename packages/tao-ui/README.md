# tao-ui

A component library for React 18.2 and 19 with semantic DOM customization and OKLCH-based theming.

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

Use `FormField` or `Form.Item` to label controls and associate help/validation messages. Input, Textarea, InputNumber, Select, Checkbox, Radio, Switch and the date pickers forward field ARIA attributes to their interactive elements; CheckboxGroup and RadioGroup expose group labels and validation messages. Placeholders are not a substitute for a label.

Radio maps `aria-required` to native `required`; an explicit `required` prop takes precedence. Group options retain their native disabled state, including explicit `disabled={false}` overrides.

Desktop date inputs expose `combobox` semantics: ArrowDown opens the calendar and moves focus into it; Escape closes it and returns focus. RangePicker combines explicit ARIA labels with each endpoint placeholder, so use distinct start/end text. Native labels can instead target `id` and `${id}-end`. Calendar, month, year and time choices expose their selection state.

Name Tabs with `aria-label` or `aria-labelledby`. Give Modal, Drawer and Popover a visible `title` or an explicit ARIA name; Popconfirm uses its question as the dialog name. Spinner accepts an ARIA name (default `Loading` when no tip is present), and wrapped content reports `aria-busy` throughout loading, including its display delay.

Automated regression checks cover DOM semantics and keyboard interactions in React 18/19. They do not replace testing your composed screens with a browser and screen reader.

### Component imports

Use component entries to include only their styles and shared theme styles. No separate CSS import is needed. The root entry remains available and includes all component styles.

```tsx
import { Button, type ButtonProps } from '@rockshin/tao-ui/button';
import { TaoProvider } from '@rockshin/tao-ui/provider';
```

Entry names use kebab-case, such as `/input-number`, `/range-picker`, and `/form-layout`. Related exports share an entry: `CheckboxGroup` uses `/checkbox`, and `HeadlessInputNumber` uses `/number-input`.

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
| General | `Button` |
| Layout | `Stack`, `FormLayout`, `Splitter` |
| Navigation | `Tabs`, `Pagination`, `Breadcrumb`, `Menu`, `Dropdown`, `ContextMenu` |
| Data Entry | `Form`, `Input`, `Textarea`, `InputNumber`, `Select`, `Checkbox`, `Radio`, `Switch`, `DatePicker`, `RangePicker`, `FormField`, `FormSection`, `FormActions` |
| Data Display | `Table`, `Tag`, `ScrollArea`, `Collapsible`, `Tooltip`, `Popover` |
| Feedback | `Modal`, `Drawer`, `Sonner`, `Spinner`, `Alert`, `Popconfirm` |
| Config | `TaoProvider`, `useTaoConfig`, `useTaoToken` |

Responsive helpers: `useBreakpoint`, `useIsMobile`, plus breakpoint-map props on
`Stack` (`direction`/`gap`/`align`), `Modal` (`width`), and `Table` (column
`responsive`). `Select` / `DatePicker` / `RangePicker` render as bottom drawers
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

## License

[MIT](./LICENSE) © rickyshin
