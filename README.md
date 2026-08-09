# tao-ui

A modern React 19 component library with semantic DOM customization and OKLCH-based theming.

## Features

- **React 19** — built for the latest React, ships with the React Compiler.
- **Semantic DOM** — every visual component exposes `classNames` / `styles` props to style internal parts by semantic name, no fragile selector hacks.
- **OKLCH theming** — `TaoProvider` derives a full theme (radius, font scale, control heights) from a small seed token set; components inherit `size` / `disabled` / `variant`.
- **Typed** — full `.d.ts`, every Props and SemanticPart type exported.

## Install

```bash
npm install @rockshin/tao-ui
# or
bun add @rockshin/tao-ui
```

Peer dependencies: `react >=19`, `react-dom >=19`, `dayjs >=1.11` (for the date pickers).

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
