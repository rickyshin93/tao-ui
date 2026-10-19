# 验证记录 · 保险简化版 preview.2 · 2026-10-19

版本：`@rounded-essentials/react-preview@1.3.0-preview.2`。共 330 枚：原 200 枚 v1.2.0 批准图标 + 130 枚保险候选。用户最新要求整体简化保险图标，向原 200 枚的视觉语言靠拢；128 枚几何修订，beneficiary 按用户例外保留原版人物＋爱心，medical-underwriting 保留原简洁形态。用户随后明确确认本次结果，当前版本标为 approved-user-revision，并记录精确确认来源；不将该状态扩展到未来设计。

## 本次修订与固定契约

- 原 200 SVG 和 canonical 几何不变，approved-v1.2.0 独立冻结基线不变
- preview.1 候选 hash 保存在 tests/fixtures/insurance-preview.1-candidates.json；preview.2 变更清单在 insurance-preview.2-revision.json；本次 golden 仅为完整性快照
- 130 个 ID、组件名称、分类与导入路径不变；新增回归测试检查名称/API 连续性
- IconProps、props helper、Rslib 配置不变；React external、每图标独立 ESM/DTS、use client、PURE、private、UNLICENSED 均保留
- 没有添加生产依赖、提高体积预算、发布 npm、push 或修改权限

## 实际执行的完整 gate

`npm run check:extended` 的完整输出保存在 artifacts/check-extended.log。本次最终报告和 tgz 相互匹配，不使用 preview.1 的测试结果代替。

- 11 项测试：原/新几何、SVG schema、安全属性、全部 SSR、ARIA/title、原生 props、ref/click、hydration、客户端边界、生成漂移负测、发布阻止负测、候选命名连续性
- React 18.3.1 / 19.3.1：真实 tgz 干净安装，330 个 root/subpath 导出，原有与保险代表组件 ref/event/hydration
- TypeScript 5.9.3：Bundler / NodeNext，skipLibCheck:false，保险导入用例和错误 props 负测
- esbuild：Search、Coverage、RiskScore、ProductBuilder 各从 root/subpath 单独导入；每次只允许 1 个图标模块贡献字节，排除其余 329 个。精确 minified/gzip 数据在 artifacts/consumer-results.json
- 原 Search 1200/700 B、保险代表 1600/850 B、tgz 200000 B / unpacked 850000 B 预算全部不变。实际包大小和 1005 文件清单见 consumer-results.json

## Next 16.4.2 的实际边界

每个场景先清理 .next，再执行生产 webpack build：

1. single-root：保留原有单根入口使用场景，严格检查零未用几何泄漏
2. consolidated-root：Home 与 Coverage 在同一根入口语句，严格检查零泄漏
3. separate-root：两条独立根入口语句，保留已知 client barrel 泄漏诊断；unusedExclusionPassed:false 不能被描述为按需加载通过
4. subpaths：全部单图标子路径，严格检查零泄漏；最终实际生产 HTTP 200 与 5 枚 SSR SVG 在该场景检查

简化后的 RiskScore / ProductBuilder 路径不超过 30 字符，因此 Next 保险导入改用 Coverage / PolicyIssue 的独有长路径作为指纹；没有降低原 >30 字符阈值。esbuild 仍覆盖原来三枚保险代表图标。

推荐 Next 使用逐图标子路径，或把 root named imports 合并成一条。preview.1 曾尝试 optimizePackageImports，但清缓存后仍触发 RSC Consumer Manifest 错误，不能作为本版已验证修复。本版保留四情形矩阵，具体指纹覆盖数量与泄漏数量见 artifacts/next-results.json，不沿用旧版数量。

## 范围与复现

- Client Components 可服务端导入并 SSR，不是原生 RSC
- Next 使用 webpack，未验证 Turbopack 或浏览器级 Next E2E；ref/event/hydration 使用 React DOM + jsdom
- Next fixture 沿用 skipLibCheck:true，因为 Next 16.4.2 的 URLPattern 声明在 TS 5.9.3 下缺少全局类型；包本身及 React 18/19 消费声明检查仍为 false
- Next 检查独有长路径，不能称为全部 webpack 模块计数；完整导出/SSR/geometry 另行全量覆盖
- 复现：npm ci && npm run check:extended；完整源 ZIP 含最终报告和 Next 日志，未包含 node_modules
