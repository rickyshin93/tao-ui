# 开发与验证 harness

本仓库的 harness 就是与图标包一起维护的生成器、可执行测试、真实消费项目与 CI。没有额外服务，也不需要账号或密钥。

## 从干净目录开始

推荐 Node 24（兼容 Node 22.12+；工具链也接受 Node 20.19+）与 Bun。依赖由 monorepo 根目录的唯一锁文件 `bun.lockb` 管理；在仓库根目录安装一次，然后在 `packages/icons` 内运行检查：

```sh
bun install              # 仓库根目录
bun run check
bun run check:extended
```

根目录 `bun install` 使用唯一的 `bun.lockb`，不要执行 `npm install` / `npm ci`。全量检查需要 npm 官方 registry 的网络访问；消费项目中的 React、类型、Next 及其传递依赖由 `tests/fixtures/*/package-lock.json` 冻结，先 `npm ci` 再安装本次 tgz，不把可变 tgz hash 写入依赖基线。需要完全离线时先准备这些 registry 依赖的 npm 缓存。新机器第一次安装/构建 Next 比快测慢。

V13 使用独立的 geometry-v13.json 校验快照。几何修订使用 geometry-refinement.1.json 记录变更 SVG 的哈希，其余图标继续使用冻结的 V13 哈希。旧版 554 个图标的 canonical 和 manifest 保存在测试 fixture 内，旧版的冻结 SHA-256 及导入器复现检查继续有效。

## 测试分层

| 命令 | 验证内容 | 什么时候跑 |
| --- | --- | --- |
| `bun run generate:check` | manifest.count 个独立 TSX 与 barrel 按 canonical 数据确定性生成，检测缺失、多余及手改文件 | 生成器或图标变更 |
| `bun run check` / `check:fast` | 先检查漂移，再 Rslib 构建最新 dist；类型、冻结 SVG SHA-256、SVG schema、安全属性、SSR 几何、可访问名称、ref、事件、hydration、打包 allowlist/预算 | 每次改动 |
| `bun run test:consumer` | 真实 npm pack 后在两个干净目录安装；React 18.3.1 / 19.3.1、全部 exports/subpaths、SSR、DOM ref/事件/hydration、TS Bundler/NodeNext；esbuild 检查 root/subpath 各只留下 1/总数 个图标；另测保险及新增通用代表图标；全部 2,165 枚分别做 ref/事件、完整树 hydration 与 root/subpath 严格类型消费 | API、依赖、输出配置变更 |
| `bun run test:next` | 真实 tgz 安装进 Next 16.4.2；四种干净生产 webpack 构建（single root / consolidated root / separate root / subpaths）、类型、App Router 服务端页面引入 client 图标；启动生产 server，验证 HTTP 200 和 SVG 标题/尺寸 | boundary 或框架兼容变更 |
| `bun run check:extended` / `verify` | 上面全部顺序执行，失败立即退出 | 提交合并前、交付和发版前 |
| `bun run test:pack` | manifest.count 份 JS / DTS / SVG、入口映射、peer、发布身份（名称/license/非 private/非 preview 版本）、内容白名单、压缩包大小 | 打包配置改动 |
| `bun run release:check` | 名称、代码及素材许可、private、preview 版本检查 | 正式发布决策后，素材许可确认前会拒绝发布 |

`npm pack --pack-destination artifacts` 的 prepack 会先建立缺失的 artifacts 目录并跑快测，因此全新解压后也能直接打包。

单独执行消费/Next 测试前先执行 `bun run check`。`check` 在生成前先检查已有源码，避免自动重建把手改 generated source 悄悄掩盖。测试还会在临时副本注入一次手改，确认漂移检查确实失败；另从保存的通用源数据运行导入器，严格比较重现后的全部合并文件和冻结基线。

## 守护的契约

- `tests/fixtures/approved-v1.2.0-golden.json` 与 `approved-v1.2.0-icons.json` 独立冻结原 200 枚批准版本；`geometry-golden.json` 是合并构建的完整性快照；`insurance-candidates.json` 单独记录保险修订图标和明确的用户确认来源，hash 本身不表示用户批准。`manifest` 的 SVG hash 也须一致
- SVG 仅允许 path/circle/rect/ellipse 及批准的几何属性，不允许脚本、远程引用或嵌套主动内容
- API 保持具名 `*Icon`、`IconProps`、root 和 kebab-case subpath；无全局动态图标注册表
- `sideEffects:false`、forwardRef PURE 注解、React external 和 逐图标独立模块必须同时成立
- esbuild 的输出 metafile 按 `bytesInOutput` 验证每次只有所选 SearchIcon、保险或新增通用代表图标贡献代码；并非仅看输入列表或包配置
- 体积预算在 `tests/fixtures/budgets.json`：Search 示例 minified ≤1200 B / gzip ≤700 B，React external；2,165 枚 V13 tgz ≤1329000 B / unpacked ≤5667000 B；保险及新增通用单图标 minified ≤1600 B / gzip ≤850 B。Search 原预算保持不变
- 不把 SSR 等同于原生 RSC；Next 图标是 client boundary。根 barrel 也保留边界，Next 测试扫描客户端 chunks，检测未使用的独有几何指纹。Next 16.4.2 separate-root 两条独立导入确实会带入整套图标：该诊断情形单独报告 unusedExclusionPassed:false，不作为受支持按需导入的通过证据；single/consolidated root 与 subpath 三种情形仍严格断言零泄漏。推荐子路径或合并 root imports。Next 测试验证编译和服务端 HTML，客户端事件/hydration 由 React DOM 测试验证，没有冒称跑过浏览器端 Next E2E 或屏幕阅读器实机
- 包自身和 React 18/19 消费声明检查使用 `skipLibCheck: false`。Next 16.4.2 的 fixture 使用框架默认的 `skipLibCheck: true`：TS 5.9.3 下，Next 自身 `url-pattern.d.ts` 引用了缺失的全局 `URLPatternInput` / `URLPatternOptions`。这项上游声明限制已记录，不能把 Next 结果说成所有依赖声明的严格类型检查

## 输出与故障定位

- `artifacts/consumer-results.json`：版本矩阵和体积结果
- `artifacts/tree-shaking-*.json` / `.js`：真实打包 metafile 与单图标产物
- `artifacts/next-results.json`：Next 四情形构建、最终 subpath 生产 SSR 结果及限制；`next-vanilla-separate-root.json` 保留默认重复根导入的真实泄漏证据
- 干净消费项目与 Next fixture 默认建在系统临时目录 `$TMPDIR/tao-icons-work/`（可用 `TAO_ICONS_WORK_DIR` 覆盖），包含安装 lockfile 与 Next 详细日志；不进入源代码 ZIP。放在 monorepo 之外是刻意的：workspace 根的 `node_modules` 带有 `@types/react18` / `@types/react-dom18` 别名包，fixture 若位于仓库树内，TypeScript 会沿祖先目录自动加载这些类型并报 `Duplicate identifier`
- `artifacts/*.tgz`：本地安装包；不进入源码 ZIP，单独交付

遇到生成漂移：先确认 `data/` 和生成器修改是否获准，再执行 `bun run generate`；不要直接改 TSX。几何 hash 不一致：定位具体 SVG/canonical diff，保留原批准值。包或 React 消费项目的 TypeScript 失败：同时检查 18/19 类型，不要用 `skipLibCheck` 绕过；Next 上游声明例外见上文。tree-shaking 失败：检查 PURE、barrel、sideEffects、共享 helper 是否引入全量图标。Next 失败：先读 build/server 日志和每个 dist 图标首行的 `use client`，不要通过给整个应用粗暴加 client directive 遮盖问题。

## 基线与 fixture 维护

1. 原 200 枚几何是已批准的 v1.2.0，独立的 approved-v1.2.0 基线不可修改。用户先要求扩展并整体简化保险图标，再明确确认 preview.2：受益人保留原版人物＋爱心，其他维持简化稿。当前 approved-user-revision 状态只适用于这一版本；保留 preview.1 候选基线与最新消息来源。合并完整性快照不能自动代表今后新设计获批
2. 若需要更新 hash，用 Node `crypto.createHash('sha256')` 对文件原始 UTF-8 字节计算，不是对重新格式化 JSON 计算。`canonicalSha256` 对应整个 `data/icons.json`；`svgSha256[name]` 对应对应 SVG 完整文件。然后重新运行全部检查并附可视化设计审阅
3. 更新依赖时用精确版本，重建根 `bun.lockb` 及对应 `tests/fixtures/*/package-lock.json`；消费 fixture 版本声明与脚本须保持一致，不要默默换成 latest
4. 预算只可在解释真实新增功能和前后体积后调整。不要因为错误地打入其他图标而提高预算；总包预算增加只对应新增独立模块和 SVG，单图标贡献模块数仍必须严格等于 1
5. 包身份已从预览占位名迁移为 `@rockshin/tao-icons`（MIT、非 private）；再次改名时同步消费脚本、README 示例和发布守卫条件，并重新安装 tgz 验证。发布守卫通过不是发布授权

消费 fixture（`react-18` / `react-19` / `next`）除了 `package.json` 还需要各自的 `package-lock.json` 才能执行 `test:consumer` / `test:next`；这些 lockfile 是隔离安装的依赖基线，缺失时应补齐而不是用一次 `npm install` 生成替代基线。

## CI

并入 monorepo 后，CI 统一由仓库根目录 `.github/workflows/` 承担：

- `ci.yml` 的 `icons` job：Node 22/24 矩阵，根目录 `bun install --frozen-lockfile` 后在 `packages/icons` 跑 `generate:check`、`build`、`typecheck`、`test`、`test:pack`（即 `check:fast` 的主体）
- `ci.yml` 的 `icons-extended` job：仅 `schedule` 与 `workflow_dispatch` 触发，跑完整 `check:extended`（真实 tgz 的 React 18/19 消费与 Next 四情形），避免每个 PR 承担 45 分钟量级
- `release-icons.yml`：发布 `icons-v<version>` GitHub Release 时用 npm OIDC trusted publishing（`--provenance`）发布，仓库内不保存长期 token

工作流权限保持最小（`contents: read`，发布 job 额外 `id-token: write`），不包含部署或远程仓库创建。

## 1.4 通用扩展的独立基线

- 原 330 枚完整保存为 `approved-v1.3.0-preview.2-icons.json`、`-manifest.json`、`-golden.json`，原 200 的更早独立基线也不变
- 新 224 枚使用 `generic-candidates.json`，状态为 candidate-user-requested-scope；用户请求补齐高频语义不等于最终设计确认
- `scripts/integrate-generic.mjs <设计资产目录>` 只允许新增，不允许覆盖原名称。默认不带参数可使用 `data/generic-extension-*.json` 与本地 SVG 重现合并结果
- 主生成器继续从 `data/icons.json` 生成 554 份独立模块；导入器和生成器均不改公共 API
- 通用代表 FileSpreadsheet / ChartPie / GitPullRequest 的 root/subpath esbuild 输出必须只有 1 枚贡献代码，排除其余 553 枚。完整矩阵保留原 Search 与保险代表
- Next 保留原四情形，并加入通用代表的子路径导入、SSR 与独有长路径保留/排除检查；重复根导入已知泄漏仍如实报告。没有启用失败的 optimizePackageImports 修复
- 整体包预算由 330 枚时 200000 / 850000 B 调整为 554 枚时 340000 / 1450000 B，对应约 68% 独立模块/声明/SVG 增长；所有既有单图标预算和严格模块数不变
- 包及消费声明 skipLibCheck:false；Next 上游声明例外不变。完整覆盖不意味着浏览器级 Next E2E 或屏幕阅读器实机测试

新增 SearchX 合法重用 Search 的放大镜轮廓，Search 不再有独有长路径。Next 的已导入保留检查仍逐项要求 >30 字符路径存在；未用排除仍仅检查独有 >30 字符路径且零泄漏要求不变。报告逐枚标明保留指纹是否独有；最终生产 SSR 另外逐个比对所有页面图标的完整几何，不把共享轮廓当作完整图标身份。
