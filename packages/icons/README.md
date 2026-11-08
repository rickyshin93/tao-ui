# Tao Icons

**2,126 rounded line icons for React — made for polished products, from everyday interfaces to insurance workspaces.**

Give your product a consistent visual language with a versatile library of 24px icons. Tao Icons pairs a clean, rounded style with practical React APIs, so you can move from idea to interface with confidence.

[Browse the icon catalog](https://rickyshin93.github.io/tao-ui/components/icons) · [npm](https://www.npmjs.com/package/@rockshin/tao-icons) · [中文说明](#中文说明)

- **A wide range of icons:** navigation, actions, files, development, data, finance and insurance.
- **Designed to work together:** a consistent 24px canvas, rounded strokes and `currentColor` styling.
- **Ready for React:** named components, TypeScript types, refs and native SVG props for React 18.2+ and 19.
- **Import what you need:** root exports and explicit per-icon entry points, with tree-shaking verified in consumer builds.
- **Accessible by default:** decorative unless named, with support for `title` and ARIA attributes.
- **Flexible assets:** use the React components or the included SVG files. MIT licensed.

## Install

```sh
npm install @rockshin/tao-icons
```

React is a peer dependency (`^18.2.0 || ^19.0.0`). The package provides ESM and TypeScript declarations; it does not provide a CommonJS entry point.

## Quick start

```tsx
import { SearchIcon, HomeIcon } from '@rockshin/tao-icons';
import { ArrowRightIcon } from '@rockshin/tao-icons/icons/arrow-right';

export function Toolbar() {
  return (
    <button type="button" aria-label="Search">
      <SearchIcon size={20} />
    </button>
  );
}
```

Use kebab-case names without a `.js` suffix for per-icon imports. Browse the catalog or the included `@rockshin/tao-icons/manifest.json` for the complete set.

## Customize

Each icon is a named `*Icon` export. Import `IconProps` from the root when you need the shared type.

- `size?: number | string` sets width and height (default `24`); explicit `width` and `height` take precedence.
- `color` or CSS `color` controls the default `currentColor`; `strokeWidth` defaults to `1.8`.
- Pass `className`, `style`, SVG attributes, `aria-*`, `data-*` and event handlers directly.
- `ref` points to the underlying `SVGSVGElement`.
- `title` supplies an accessible name when no explicit ARIA name is present. `titleId` optionally associates the title via `aria-labelledby`; keep it unique on the page.
- `children` are appended after the icon geometry. `dangerouslySetInnerHTML` is not supported.

```tsx
import { SearchIcon, type IconProps } from '@rockshin/tao-icons';

const props: IconProps = { size: '1em', color: '#275EFE' };
const icon = <SearchIcon {...props} title="Search" />;
```

### Accessibility

Icons without a name are decorative by default (`aria-hidden="true"`, `focusable="false"`). Leave an icon decorative when its button already has visible text or an accessible label. For an icon that conveys meaning on its own, provide `title`, `aria-label`, or `aria-labelledby`; named icons default to `role="img"`. An explicit ARIA name takes precedence over the title. An empty title does not provide a name. Explicit `aria-hidden` and `role` remain the caller's responsibility.

```tsx
<SearchIcon title="Search" />
<SearchIcon title="Search" titleId="header-search-title" />
<SearchIcon aria-labelledby="visible-search-label" />
```

DOM and SSR behavior is tested; real screen-reader certification has not been performed. Do not rely on icons alone to communicate financial or approval status.

## Next.js App Router

Icons retain a `use client` boundary. A Server Component can import an icon and pass serializable props, and the SVG is rendered in server HTML. Use your own Client Component for refs or event handlers.

```tsx
// app/page.tsx — a Server Component
import { HomeIcon } from '@rockshin/tao-icons/icons/home';

export default function Page() {
  return <HomeIcon title="Home" />;
}
```

In the tested Next.js 16.4.2 production webpack build, separate root import statements in one Server Component can include the entire icon set in the client chunk. Prefer per-icon paths, or combine root imports into one statement. This result does not establish behavior for every Next.js version or Turbopack. These components use a client boundary; they are not native server-only RSC icons.

## Development and verification

From the repository root, install dependencies with `bun install`. In `packages/icons`, run `bun run check` for generation, build, type, behavior and package checks, or `bun run check:extended` for real-tarball React 18/19 and Next.js consumer checks. See [HARNESS.md](./HARNESS.md) for the test matrix and known limitations. Code and artwork are covered by the [MIT license](./ARTWORK-LICENSE).

---

## 中文说明

**Tao Icons 是一套为 React 产品打造的 2,126 枚圆角线性图标。** 从日常界面、数据和开发工具，到金融保险工作台，统一的视觉语言帮助团队更快构建清晰、一致的产品体验。

[浏览图标目录](https://rickyshin93.github.io/tao-ui/components/icons) · [npm](https://www.npmjs.com/package/@rockshin/tao-icons)

- 统一的 24px 画布、圆角描边和 `currentColor` 配色。
- 支持 React 18.2+、React 19、TypeScript、ref 和 SVG 原生属性。
- 支持根入口与逐图标导入；消费构建验证了按需打包。
- 默认作为装饰图标，也可通过 `title` 或 ARIA 属性提供无障碍名称。
- 提供 React 组件和原始 SVG，采用 MIT 许可。

### 安装与使用

```sh
npm install @rockshin/tao-icons
```

```tsx
import { SearchIcon } from '@rockshin/tao-icons';
import { ArrowRightIcon } from '@rockshin/tao-icons/icons/arrow-right';

<button type="button" aria-label="搜索">
  <SearchIcon size={20} />
</button>
```

`size` 默认 24，`strokeWidth` 默认 1.8；可使用 `color`、CSS、`className` 和 SVG 属性定制。图标单独表达含义时，请设置 `title`、`aria-label` 或 `aria-labelledby`；按钮已有文字或无障碍名称时，图标保持默认的装饰状态即可。详细 API 和无障碍说明见上方英文部分。

本包输出 ESM 与 TypeScript 声明，不提供 CommonJS 入口。Next.js App Router 中图标带有 client boundary；在已测试的 Next.js 16.4.2 webpack 构建中，建议使用逐图标路径，或将根入口导入合并为一条语句，以避免引入整套图标。

开发和验证命令见 [HARNESS.md](./HARNESS.md)。
