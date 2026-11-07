# Rounded Essentials React 开发约束

当前目录集成 V13 完整 SVG 素材。历史 554 枚快照保留用于独立校验和迁移。

## 事实来源与架构

- `data/icons.json` 为 canonical 几何，`data/manifest.json` 为名称、分类与哈希
- `svg/` 保持原始字节；原发布版本的几何及 SHA-256 保存在独立冻结 fixture，不能覆盖
- `scripts/integrate-generic.mjs` 显式导入已完成的通用候选，默认从仓库内保存的扩展数据重现
- `scripts/generate.mjs` 生成 `src/icons/*.tsx` 和 `src/index.ts`，禁止手改输出
- `src/types.ts` / `src/icon-props.ts` 是共享 API；Rslib 输出非捆绑 ESM 与声明
- barrel 与逐图标模块保留 use client；forwardRef 保留 PURE；React 为 external peer
- 不得添加全量动态注册表或隐藏几何优化

## 不变量

- 2,165 枚、24px viewBox、1.8px currentColor 圆角线条
- 原 `approved-v1.2.0-*` 与 `approved-v1.3.0-preview.2-*` 独立冻结，不得为过测更新
- 新 `generic-candidates.json` 单独记录请求范围与完整性；不伪称设计已获最终确认
- 装饰性默认、显式可访问名、调用者负责 titleId 唯一性；不得随机 ID、全局计数或 useId
- React 18/19 的 root/subpath、ref、事件、SSR、hydration 与严格 TS 消费必须通过
- Next 是 client boundary + SSR，不是原生 RSC；Next 16.4.2 重复独立根导入泄漏必须明确报告
- 包身份固定为 `@rockshin/tao-icons`、license MIT（代码）；V13 素材许可必须单独确认，且不设 `private`；发布仅通过 GitHub Release `icons-v<version>` 触发 `release-icons.yml`；发布需明确授权并确认当前素材的公开许可

## 验证命令

使用 Node 24 或兼容版本与 Bun；依赖由 monorepo 根目录的唯一锁文件 `bun.lockb` 管理，在仓库根目录执行 `bun install`。

- `bun run check`：漂移检测、最新构建、类型、全部几何/行为及包内容
- `bun run check:extended`：完整 gate，增加真实 tgz 的 React 18/19 消费与 Next 四情形
- `bun run generate`：有意生成源码；`generate:check` 非变更检测
- `npm pack --pack-destination artifacts`：本地包，不发布
- `bun run release:check`：发布元数据（名称/license/private/preview 版本）守卫，当前应通过；通过不等于发布授权

先读 HARNESS.md。不得通过提高预算、刷新批准 hash 或减少断言掩盖失败。只在完整新增功能解释下调整整体包预算，单图标贡献模块数必须仍为 1。报告真实运行结果，保留明确限制。
