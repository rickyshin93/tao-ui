# 验证记录 · 2026-10-19

版本：`@rounded-essentials/react-preview@1.3.0-preview.1`。总数 330：原 200 枚 v1.2.0 批准图标 + 130 枚保险新增候选。用户批准了首批 16 枚研究稿的风格与继续整套；未把全部新增图标标为逐项已批准。环境：Linux、Node 24.19.0、npm 11.9.0。原项目和旧 ZIP 未改动。

## 资产和 API

- 原 200 枚 SVG 与 canonical 几何通过独立冻结基线；旧 golden 和完整 canonical 文件原字节保存在 approved-v1.2.0 fixtures
- 新 130 枚使用独立 candidate hash 清单，approvalStatus 为 pending-user-review；总 golden 仅表示构建完整性
- Rslib 1.0.3 / React plugin 2.1.1：330 独立图标 ESM 与声明；root/各图标 use client、React external、PURE 标记保留
- 手写 IconProps、props helper 和 Rslib 配置与旧项目字节一致；无生产运行时依赖；private / UNLICENSED / ESM / 子路径接口保留
- 10 项测试覆盖全部几何、schema、安全属性、SSR、ARIA/title、原生 props、ref/click、hydration、客户端边界、生成漂移负测和发布阻止负测

## 实际消费

- 真实 tgz 干净安装：React 18.3.1 / 19.3.1，330 root/subpath 导出、全部 SVG SSR、原有与保险代表组件 ref/event/hydration
- TypeScript 5.9.3：Bundler / NodeNext 两种解析，skipLibCheck:false；保险根入口/子路径用例和原有错误 props 负测
- esbuild 0.28.2：Search、Coverage、RiskScore、ProductBuilder 各自从 root/subpath 导入。每例只有一个图标模块贡献字节，另外 329 个被剔除，React external
- Search 989 B minified / 562 B gzip；保险代表 923–1003 B minified / 561–584 B gzip。字节差异来自具体图形及 bundler 输出，不是每图标的固定大小
- 真实打包清单 1005 个文件：330 JS、330 DTS、330 SVG，加入口、metadata 和文档；总包约 133 KB，解包约 810 KB。精确最终值见 artifacts/consumer-results.json
- 总包预算由旧版 120000/500000 B 调为 200000/850000 B，只用于显式新增 130 独立模块/SVG/metadata。旧 Search 1200/700 B 预算不变；保险代表 1600/850 B 预算，并保持贡献模块数严格为 1

## Next 16.4.2 的实际边界

四种情形分别删除 .next 后做生产 webpack 构建：

1. 原有 single-root：零未用图标泄漏
2. consolidated-root：Home 与 Coverage 合并在同一根入口语句，零未用图标泄漏
3. separate-root：两条独立根入口语句，生产构建成功，但检测到 278 枚未使用图标的独有路径进入 client chunks。这是明确保留的限制复现，不是按需加载通过
4. subpaths：全部图标使用单图标子路径，严格检查零未用图标泄漏；启动生产服务并验证 HTTP 200、5 枚 SVG、title/ARIA/尺寸/class

推荐 Next 使用逐图标子路径，或将根入口 named imports 合并成一条。额外试验 optimizePackageImports 即使清除缓存仍触发 RSC Consumer Manifest 预渲染错误，未作为推荐方案。日志保留在 artifacts/next-optimization-diagnostic.log。

`artifacts/next-results.json` 记录整体受支持情形结果及四个子结果。separate-root 的 unusedExclusionPassed:false 有意保留；没有提高体积预算、删除复现或宣称 Next 默认 root 导入全部通过。

## 已知范围

- Client Components 支持服务端导入和 SSR，不是原生 RSC 图标
- Next 测试使用 webpack，未验证 Turbopack、真实浏览器 Next E2E 或屏幕阅读器；ref/event/hydration 用 React DOM + jsdom 检查
- Next fixture 沿用 skipLibCheck:true：该框架的 URLPattern 声明在 TypeScript 5.9.3 下缺少全局类型。图标包与 React 18/19 消费检查均为 false
- Next 指纹扫描覆盖有独有长路径的图标，不假称所有 webpack 模块计数；完整导出/SSR/geometry 另有全量检查
- 没有 npm publish、push、部署、远程仓库或权限修改

复现：npm ci && npm run check:extended。完整输出：artifacts/check-extended.log；精确指标和逐例证据保存在 artifacts/。原版报告只供历史参考，不替代本版测试。
