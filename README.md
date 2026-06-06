# tao-ui

A modern React 19 component library with semantic DOM customization and OKLCH-based theming.

## Features

- **React 19** — built for the latest React, ships with the React Compiler.
- **Semantic DOM** — every component exposes `classNames` / `styles` props to style internal parts by semantic name, no fragile selector hacks.
- **OKLCH theming** — `TaoProvider` derives a full theme (radius, font scale, control heights) from a small seed token set; components inherit `size` / `disabled` / `variant`.
- **Typed** — full `.d.ts`, every Props and SemanticPart type exported.

## Install

```bash
npm install tao-ui
# or
bun add tao-ui
```

Peer dependencies: `react >=19`, `react-dom >=19`, `dayjs >=1.11` (for the date pickers).

## Usage

Wrap your app once with `TaoProvider`, then use components. Import the component CSS that ships alongside the JS (your bundler resolves the side-effect imports automatically).

```tsx
import { TaoProvider, Input, Select, Switch } from 'tao-ui';

export default function App() {
  return (
    <TaoProvider size="middle">
      <Input placeholder="Search" />
      <Select options={[{ label: 'A', value: 'a' }]} />
      <Switch defaultChecked />
    </TaoProvider>
  );
}
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
| Navigation | `Tabs`, `Pagination` |
| Data Entry | `Input`, `Select`, `Checkbox`, `Radio`, `Switch`, `DatePicker`, `RangePicker`, `FormField`, `FormSection`, `FormActions` |
| Data Display | `Table`, `Tag`, `ScrollArea` |
| Feedback | `Drawer` |
| Config | `TaoProvider`, `useTaoConfig` |

Headless utilities: `useNumberInput` / `NumberInput`, and the `cx` semantic-class helper.

## License

[MIT](./LICENSE) © rickyshin
