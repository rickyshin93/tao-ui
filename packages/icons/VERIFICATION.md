# 验证记录 · 554 枚图标 · 0.0.1

版本：`@rockshin/tao-icons@0.0.1`（图标数据 canonical version 仍为 `1.4.0-preview.1`，属冻结数据，不随包版本改写），共 554 枚。原批准 330 枚保持不变，新增 224 枚为用户请求范围内的通用候选，尚未最终设计确认。完整执行结果、时间、实测大小以源 ZIP 内 `artifacts/check-extended.log`、`consumer-results.json` 和 `next-results.json` 为准。本文件描述本版门禁和覆盖，不替代实际输出。

## 固定基线

- 原 200 的 v1.2.0 独立批准 fixtures 不变
- 原 330 的 v1.3.0-preview.2 canonical、manifest、golden 另行冻结；逐项检查 SVG 字节、几何、名称、组件映射及元数据
- beneficiary 继续保留用户指定的原版人物＋爱心
- 新 224 候选 hash 使用 generic-candidates.json，与原批准状态明确分开
- 共享 IconProps、props helper、Rslib 配置不变；包身份为 `@rockshin/tao-icons`、MIT、非 private，无新增生产依赖

## 实际包消费门禁

执行 `bun run check:extended`，顺序运行快测、真实 tgz 消费和 Next 四情形。源 ZIP 包含报告、日志及用于重现的完整 harness，tgz 单独提供。

- 13 项 Node 测试：全部几何/安全 schema、独立批准基线、新候选、API、可访问名称、原生 props、ref/click、hydration、生成漂移负测和发布元数据守卫通过
- React 18.3.1 / 19.3.1 分别安装真实本地 tgz；全部 554 root/subpath 导出一致
- 全部 554 图标 SSR、DOM ref、click 事件；完整 554 图标树 hydration 不产生 recoverable error
- TypeScript 7.0.2 Bundler / NodeNext 严格检查全部 554 root/subpath 用法、SVG ref/事件以及错误 props 负测，skipLibCheck:false
- esbuild 对 Search、Coverage、RiskScore、ProductBuilder、FileSpreadsheet、ChartPie、GitPullRequest 分别测 root/subpath，每次严格只有 1 个图标模块贡献字节，排除其余 553 个；React external
- 原 Search 单图标 1200/700 B 预算不变，保险及新增通用代表 1600/850 B；整体 tgz 340000 B、unpacked 1450000 B，仅对应 330 → 554 的独立资产规模增长

## Next 16.4.2 边界

每种情形清理 .next 后执行生产 webpack 构建：

1. single-root：一条根入口语句；严格零未用独有路径泄漏
2. consolidated-root：合并 Home 与 Coverage 根入口；严格零泄漏
3. separate-root：保留两条独立根入口的已知泄漏诊断；结果中的 unusedExclusionPassed:false 不得表述为按需加载通过
4. subpaths：全部逐图标入口；严格零泄漏，并启动最终生产服务检查 HTTP 200、全部页面 SVG、title 与尺寸

四种情形都增加通用代表的子路径导入、SSR 和独有长路径保留/排除检查。保险与新通用的未用指纹覆盖数量分开记录，保持原 >30 字符阈值。实际泄漏数量在 next-results.json 中，不沿用旧版数值。

推荐逐图标子路径或合并根导入。此前 optimizePackageImports 尝试触发 RSC Consumer Manifest 错误，本版没有将其作为已验证修复。

## 限制与复现

- Client Components 支持服务端导入与 SSR，不是原生 RSC
- Next 使用 webpack；未宣称 Turbopack、浏览器级 Next E2E 或屏幕阅读器实机覆盖
- Next 的事件代码编译和服务端 HTML 由 Next 验证；运行时 ref/event/hydration 来自 React DOM + jsdom
- Next fixture 保持框架默认 skipLibCheck:true，因为 Next 16.4.2 的 URLPattern 声明在 TS 5.9.3 下缺少全局类型；包与两版 React 消费声明仍为 false
- Next 扫描独有长路径，不是完整 webpack 模块计数；全部图标另有导出/SSR/geometry 覆盖
- 干净目录重现：根目录 `bun install` 后执行 `bun run check:extended`
- 没有发布 npm、push、部署、创建远程仓库或修改权限；包当前仍未发布到 npm

新增 SearchX 合法重用 Search 的放大镜轮廓，Search 不再有独有长路径。Next 的已导入保留检查仍逐项要求 >30 字符路径存在；未用排除仍仅检查独有 >30 字符路径且零泄漏要求不变。报告逐枚标明保留指纹是否独有；最终生产 SSR 另外逐个比对所有页面图标的完整几何，不把共享轮廓当作完整图标身份。
