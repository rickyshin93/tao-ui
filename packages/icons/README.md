# Rounded Essentials · React + Rslib

共 554 枚：原 200 枚通用图标 + 已确认的 130 枚保险图标 + 新增 224 枚高频通用 UI 候选。原批准 330 枚 SVG、名称、React API 与导入路径逐字节/字段保持不变，beneficiary 保留用户指定的原版人物＋爱心。此次扩大导航、表单、文件、排版、图表、媒体、设备、通信、无障碍与开发工具等常见语义覆盖；新 224 枚是原创候选，尚待用户最终设计确认。

新增分类、语义、优先级与完整目录见 [GENERIC-COVERAGE.md](./GENERIC-COVERAGE.md)，保险范围见 [INSURANCE-COVERAGE.md](./INSURANCE-COVERAGE.md)。SVG 总览与可视目录随独立设计资产包提供；本包的 `data/manifest.json` 是程序可读目录，`svg/` 包含全部原始图标。

当前包名 `@rockshin/tao-icons`，版本 `0.0.1`，license 为 MIT。首次发布由 GitHub Release `icons-v<version>` 触发 `release-icons.yml`（npm OIDC trusted publishing，仓库不保存长期 token）。发布前安装方式仍是本地构建的 tgz 或 monorepo workspace 引用。

## 安装本地构建包

```sh
npm install ./rockshin-tao-icons-0.0.1.tgz
```

在已有 React 18.3.1 或 React 19 项目里安装。React 是 peer dependency（`^18.2.0 || ^19.0.0`），不包含在图标 bundle 里。此版本输出 **ESM + TypeScript 声明**，不提供 CommonJS 入口。monorepo 内使用时可以直接通过 workspace 引用，无需安装 tgz。

```tsx
import { SearchIcon, HomeIcon } from '@rockshin/tao-icons';
// 显式单图标入口（kebab-case；没有 .js 后缀）
import { ArrowRightIcon } from '@rockshin/tao-icons/icons/arrow-right';

export function Toolbar() {
  return (
    <button type="button" aria-label="搜索">
      <SearchIcon size={20} strokeWidth={1.8} />
    </button>
  );
}
```

## 新通用图标示例

```tsx
import { FileSpreadsheetIcon, ChartPieIcon } from '@rockshin/tao-icons';
import { GitPullRequestIcon } from '@rockshin/tao-icons/icons/git-pull-request';

export function CommonActions() {
  return <nav aria-label="常用操作">
    <button><FileSpreadsheetIcon size={20} />表格文件</button>
    <button><ChartPieIcon size={20} />占比图</button>
    <button><GitPullRequestIcon size={20} />合并请求</button>
  </nav>;
}
```

## 保险核心系统示例

```tsx
import { CoverageIcon, RiskScoreIcon } from '@rockshin/tao-icons';
import { ProductBuilderIcon } from '@rockshin/tao-icons/icons/product-builder';

export function InsuranceActions() {
  return <nav aria-label="保险工作台">
    <button><CoverageIcon size={20} />保障责任</button>
    <button><RiskScoreIcon size={20} />风险评分</button>
    <button><ProductBuilderIcon size={20} />产品配置</button>
  </nav>;
}
```

新增图标是用于导航、按钮、流程状态和数据项的视觉候选；具体金融业务含义以系统文案和业务规则为准，不应单独依靠图形区分审批/支付状态。所有新增导出继续遵循同一 IconProps 和单图标子路径约定。

## API

每个组件用 `*Icon` 具名导出。可从根入口导入 `IconProps` 类型。

- `size?: number | string`，默认 24，同时设置宽高；显式 `width` / `height` 优先
- `color` 或 CSS `color` 控制默认 `currentColor`；`strokeWidth` 默认 1.8
- `className`、`style`、SVG 属性、`aria-*`、`data-*` 和事件处理器可直接传入
- `ref` 指向实际 `SVGSVGElement`，React 18/19 都支持
- `title?: string` 渲染 SVG title，并在没有显式 ARIA 名称时提供可访问名称
- `titleId?: string` 可选；提供时连接 title 与 `aria-labelledby`。调用方须保证页面内唯一
- `children` 追加在图标几何后；`dangerouslySetInnerHTML` 不支持，以保护固定子元素结构

```tsx
import { createRef } from 'react';
import { SearchIcon, type IconProps } from '@rockshin/tao-icons';

const ref = createRef<SVGSVGElement>();
const props: IconProps = { size: '1em', color: '#275EFE' };
const example = <SearchIcon {...props} ref={ref} title="搜索" />;
```

### 无障碍

不提供名称时默认装饰性：`aria-hidden="true"`、`focusable="false"`。按钮里已有文字或按钮本身有 `aria-label` 时，让图标保持装饰性。

独立表达含义的图标使用 `title="搜索"` 或 `aria-label="搜索"`，默认 `role="img"`。显式 `aria-labelledby` / `aria-label` 优先于 title 的自动名称。title 默认不生成 ID，而以 `aria-label` 取同一文本，不依赖 hook、随机数或计数器；需要显式关联时才传 `titleId`。

```tsx
<SearchIcon title="搜索" />
<SearchIcon title="搜索" titleId="header-search-title" />
<SearchIcon aria-labelledby="visible-search-label" />
```

显式传入的 `aria-hidden`、`role` 等仍由调用方负责；空 title 不算名称。测试覆盖 DOM/SSR 行为，未声称做过真实屏幕阅读器认证。

## Next.js App Router

组件保留 `use client` 边界，Server Component 可以导入并传递可序列化 props，服务端 HTML 会输出 SVG。**这不是无需 client boundary 的原生 RSC 图标包**。

```tsx
// app/page.tsx：仍是 Server Component
import { HomeIcon } from '@rockshin/tao-icons/icons/home';
export default function Page() {
  return <HomeIcon title="首页" />;
}
```

### Next 16.4.2 的导入注意事项

优先使用上例的逐图标子路径。测试发现：同一 Server Component 中，用两条独立语句从根入口导入不同图标，会让 Next 16.4.2 的 client chunk 意外包含整套图标。把 root named imports 合并为一条语句，或全部使用单图标子路径，已验证不带入无关图标。

```tsx
// 根入口需要导入多个图标时，合并成同一条语句
import { HomeIcon, CoverageIcon } from '@rockshin/tao-icons';
// Next 项目更推荐明确的子路径
import { RiskScoreIcon } from '@rockshin/tao-icons/icons/risk-score';
```

这项 Next 特定限制不会改变 React/esbuild 下 root 和 subpath 的单图标 tree-shaking 结果。harness 保留了四种干净生产构建及单独的泄漏复现报告，未把默认 Next root 导入笼统标为全部通过。额外尝试 optimizePackageImports 触发了 RSC manifest 预渲染错误，因此本版本不建议启用它作为修复。

需要 `ref` / `onClick` 时，调用方写在自己的 Client Component 内；不要从 Server Component 传函数或 ref。当前 Next 集成使用 16.4.2 + React 19.3.1 的生产 webpack 构建与实际生产服务器请求；未把这个结论扩展到所有 Next 版本或 Turbopack。

## 本地开发与 harness

推荐 Node 24（或 Node 22.12+）与 Bun。依赖由 monorepo 根目录的唯一锁文件 `bun.lockb` 管理，在仓库根目录执行一次 `bun install`；本包脚本在 `packages/icons` 目录内用 Bun 运行：

```sh
bun install              # 仓库根目录：安装全部 workspace
bun run check            # 生成漂移 → 最新构建 → 类型/几何/SSR/DOM/包内容
bun run check:extended   # 再加真实 tgz 消费、React 18/19、tree-shaking、Next
npm pack --pack-destination artifacts
```

在本包目录执行 `npm pack` 会先跑快测；只生成可安装 tgz，不发布。快测与全量检查、故障定位、fixture 维护和 CI 说明见 [HARNESS.md](./HARNESS.md)。给开发 agent 的仓库约束见 [AGENTS.md](./AGENTS.md)。

目录：

```text
data/                 原批准 330 + 新通用 224 候选几何与 manifest
svg/                  原批准 330 份 SVG 字节不变 + 新通用 224 SVG
scripts/generate.mjs  生成器
src/icons/            每图标独立生成的 React 组件
src/icon-props.ts      共享的纯 props / accessibility helper
rslib.config.ts       ESM、非合并构建、类型声明、React external
tests/                单元、golden、包消费和 Next 测试
dist/                 构建产物，不要手改
```

Rslib 的职责是将 TSX 编译成独立 ESM 模块、生成声明和管理 React 构建插件；设计数据与生成器保留在仓库中。`bundle: false`、每图标入口、纯调用标记与 `sideEffects: false` 一起提供按需打包条件，最终效果由真实消费构建验证。

配置依据：[Rslib React 集成](https://www.rslib.rs/guide/solution/react)、[bundleless 输出目录 outBase](https://www.rslib.rs/config/lib/out-base)、[声明生成 dts](https://www.rslib.rs/config/lib/dts)。`outBase: 'src'` 与 TypeScript `rootDir` 一致，确保 JS 与声明子路径对齐。

## 已验证与边界

- 330/330 已批准 SVG 的 SHA-256 与独立旧基线一致；新通用 224 枚候选 hash 和范围记录分开保存；全部 canonical 几何与 SSR 元素属性一致
- React 18.3.1 / 19.3.1：真实 tgz 安装、全部 root/subpath 导出、SSR、ref、事件与无差异 hydration
- TypeScript 7.0.2：消费端 `Bundler` / `NodeNext` 两种解析，以及故意错误 props 的类型拒绝
- esbuild 0.28.2：分别只引入 SearchIcon、多个保险代表及 FileSpreadsheet / ChartPie / GitPullRequest 通用代表图标，root / subpath 均只保留 1 个图标模块，剔除其余图标；React external。实际字节与 metafile 在 `artifacts/consumer-results.json`
- Next App Router：生产 webpack 构建与 SSR；详细结果和限定条件在 `artifacts/next-results.json`
- 不承诺 CommonJS、React Native、所有第三方框架/打包器或旧 React 版本

## 正式发布前

1. 包名已确定为 `@rockshin/tao-icons`（scope `@rockshin`），发布前确认账号拥有权与公开范围
2. 图标与代码版权已按 MIT license 提供（见 LICENSE）；若版权归属变化需同步更新
3. 确认发布版本（当前 `0.0.1`），同步包名示例与测试，再运行 `bun run release:check`
4. `bun install && bun run check:extended`，检查 `npm pack --dry-run` 与实际 tgz 安装
5. 在明确批准发布后，创建 GitHub Release `icons-v<version>` 触发 `release-icons.yml`（OIDC trusted publishing）；首次发布前需在 npmjs 为该仓库配置 trusted publisher

Rslib 与 React 均为各自项目的名称；本包没有声称得到它们的官方背书。
