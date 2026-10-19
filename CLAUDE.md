# tao-ui monorepo 指南

Bun workspaces 单仓，两个可发布包。完整约定见根 `AGENTS.md`；组件开发清单在 `packages/tao-ui/CLAUDE.md`，图标生成与冻结基线在 `packages/icons/AGENTS.md` + `HARNESS.md`。

## 结构

- `packages/tao-ui` → `@rockshin/tao-ui`：Rslib 组件库（React 18.2/19）、Rstest、Rspress、Storybook、Biome
- `packages/icons` → `@rockshin/tao-icons`：554 枚生成式 React 图标（24px / 1.8 stroke，逐图标子路径）
- 根目录只放 workspace 脚本、CI、共享说明，没有运行时代码

## 命令（根目录执行）

| 命令 | 作用 |
| --- | --- |
| `bun install` | 安装全部 workspace（唯一锁文件 `bun.lockb`） |
| `bun run build` | 两个包都构建 |
| `bun run lint` / `typecheck` / `test` | tao-ui 质量门禁 |
| `bun run test:types` / `test:package` | 公共类型契约 / 包导出与 CSS 体积 |
| `bun run doc` / `storybook` | tao-ui 文档站 / 组件浏览器 |
| `bun run docs:check` / `check:components` | 生成文档与组件注册表同步 |
| `bun run icons:check` / `icons:verify` | 图标漂移+构建+打包 / 真实 tgz 消费与 Next 兼容 |
| `bun run release <version>` | tao-ui 发版（仅 main） |

也可以进到包目录直接跑 `bun run <script>`。

## 硬约束

- **不要手改生成文件**：`packages/icons/src/icons/*.tsx`、`packages/icons/src/index.ts` 由 `scripts/generate.mjs` 从 `data/` 生成，`generate:check` 会检测漂移；改几何要连同冻结基线一起走流程。
- **冻结基线不得刷新**：approved v1.2.0 / v1.3.0-preview.2 / generic-candidates 的 SHA-256 不能为了让检查变绿而更新。
- **不要动 tao-ui 的 `sideEffects` 白名单**（含 `./dist/index.js` 与 `./src/index.tsx`），否则严格 tree-shaker 会悄悄丢掉 `theme.css`。
- **React 在两包都是 peer**；tao-ui 最低 18.2，icons 为 `^18.2.0 || ^19.0.0`。
- **不要引入 package-lock**；图标消费 fixture 的 `package-lock.json` 例外（隔离安装真实 tgz）。
- tao-ui 样式规范不变：`--tao-*` 变量、`data-tao-*` 属性、OKLCH + `color-mix()` 彩色×中性色用 `in oklab`；动画只允许 opacity / transform / background-color / border-color / color。

## 改动前验证

- tao-ui：`bun run lint && bun run typecheck && bun run test && bun run test:types && bun run test:package && bun run build && bun run docs:check && bun run check:components`
- icons：`bun run icons:check`；动到 API/构建配置/打包时再跑 `bun run icons:verify`
- 如实报告命令结果，不通过放宽检查、预算或断言来变绿。
