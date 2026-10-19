# 验证记录 · 2026-10-19

版本：`@rounded-essentials/react-preview@1.2.0-preview.1`。批准的设计基线：200 icons v1.2.0。执行环境：云端 Linux、Node 24.19.0、npm 11.9.0。原图标交付未改动。

## 通过的检查

- Rslib 1.0.3 / React plugin 2.1.1：200 独立图标 ESM + 200 声明，根入口及 props helper；React external
- `npm run check`：9 项测试通过，包括冻结 canonical / SVG SHA-256、schema、200 根/子路径导出与 SSR 几何、ARIA / title / native props、mounted ref / click、SSR hydration、client directives / PURE、生成漂移负测和发布阻止负测
- `npm run test:pack`：包内容白名单、200 JS + 200 DTS + 200 SVG、导出映射、peer 和大小预算
- 真实 tgz 在干净消费目录安装：React 18.3.1 / 19.3.1；200 exports/subpaths、SSR、ref、事件、hydration 均通过
- TypeScript 5.9.3 消费端 `Bundler` / `NodeNext` 都通过，`skipLibCheck: false`；无效 size / title / ref / inner HTML 的负面类型用例被正确拒绝
- esbuild 0.28.2：root / subpath 导入 SearchIcon，各仅一个图标模块贡献输出，另外 199 个不贡献字节；989 B minified / 562 B gzip，React external。这是示例图标及此配置的数据，不是每个图标固定大小
- Next 16.4.2 + React 19.3.1：生产 webpack build、App Router prerender、真实 HTTP 200；Server Component 的根/单图标导入、客户端 ref/事件示例均编译，HTML 中三枚图标与无障碍属性正确
- Next root barrel 全量带入问题已修复：根入口与每图标模块保留 `use client`。实际图标相关 page chunk 为 3,221 B；扫描 162 枚未用图标的 175 个独有长路径指纹，未发现泄漏
- 主工程、React 18、React 19、Next 各自提交 lockfile；消费测试先 `npm ci`，再无保存安装本次 tgz，并验证 fixture manifest/lock 未改变

## 已知边界

- 图标是可服务端导入、支持 SSR 的 Client Components；不是原生 RSC 组件
- Next 测试使用 webpack，未验证 Turbopack 或浏览器级 Next E2E；mounted ref/事件/hydration 在 React DOM + jsdom 中验证
- Next 16.4.2 的上游 URLPattern 声明在 TS 5.9.3 下缺少全局类型，因此 Next fixture 保留默认 `skipLibCheck: true`。包本身及 React 18/19 声明验证没有跳过
- Next bundle 检查是独有路径回归检查，不是全部 webpack 模块计数；esbuild 的 1/200 结果基于实际输出 metafile
- 没有声称真实屏幕阅读器认证、React Native、CommonJS 或所有框架版本兼容
- 只交付 CI workflow 文件，未创建远程仓库、启用线上 CI、发布 npm、登录账号或配置凭据

完整复现：`npm ci && npm run check:extended`。详细 JSON / bundle metafile / Next 日志由该命令写入 `artifacts/` 和 `tests/.work/`。更新基线时遵守 HARNESS.md。
