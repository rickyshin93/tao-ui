# tao-ui 项目自我学习

## [发布] npm 包名相似度校验比查询严格 + scoped 包发布
- **日期**: 2026-06-06
- **错误假设**: 以为 `npm view tao-ui` 返回 404（未占用）就一定能发布
- **真实行为**: npm 发布时有防混淆校验，`tao-ui` 因与已存在的 `taoui` 太像被 403 拒绝（"Package name too similar"）。查询 404 ≠ 可发布
- **正确做法**: 用 scoped 包名规避（如 `@rockshin/tao-ui`，scope 必须等于 npm 用户名/所属 org），publishConfig 设 `access: public`。另：CI 发布需要能绕过 2FA 的 token —— Classic **Automation** token 或权限设为 Read+write 的 Granular token，普通 Classic "Publish" token 会因 2FA 被 403
- **适用场景**: 任何首次发布 npm 包；包名先用 scoped 最稳

## [设计] 项目已更名为 tao-ui

- **日期**: 2026-06-02
- **错误假设**: 以为项目名仍是 rihua-ui
- **正确做法**: 库名已改为 `tao-ui`，CSS 变量前缀 `--tao-*`，data 属性 `data-tao-*`。包名尚未在 package.json 中更新（等开发时一起改）
- **适用场景**: 所有代码生成和文档引用都应使用 tao-ui / --tao- 前缀

## [设计] antd v6 主题架构参考

- **日期**: 2026-06-02
- **错误假设**: 以为 CSS Variables 简单直接覆盖就够了
- **正确做法**: 参考 antd v6 完整的 Seed→Map→Alias 分层。tao-ui 简化为 Seed→Derived 两层，但保留了 antd 的关键派生算法（genRadius 分段逻辑、genFontSizes 自然对数阶梯、genControlHeight 比例因子）。CSS calc/color-mix 能算的纯 CSS 处理，不能算的（圆角分段、字号对数）在 TaoProvider JS 侧计算注入
- **适用场景**: 开发 TaoProvider 和主题系统时，去 `/tmp/antd-check/` 查看 antd v6 源码对照。核心文件在 `lib/theme/themes/shared/` 下

## [测试] rstest 不自带 testing-library auto-cleanup

- **日期**: 2026-05-15
- **错误假设**: 以为 rstest（基于 Rspack/Rsbuild）跟 vitest/jest 一样会自动 unmount React 组件，让 `getByTestId` 在新测试里只能找到当前 render 的节点
- **正确做法**: 在 `rstest.setup.ts` 里显式加：
  ```ts
  import { afterEach } from '@rstest/core';
  import { cleanup } from '@testing-library/react';
  afterEach(() => cleanup());
  ```
  否则前面所有测试的 React 树都积累在 happy-dom 的 body 里，`getByTestId` 报 "Found multiple elements"
- **适用场景**: 任何在 rihua-ui 里写 `render(<X />)` 多个测试同名 testid 的组件库测试。新增组件的第一组测试写完跑通就要 verify 这个，避免后面 debug 浪费时间

## [构建] rslib bundle:false + style.inject 不会内联 CSS

- **日期**: 2026-06-02
- **错误假设**: 以为 `style.inject: true` 在 `bundle: false` 模式下会把 CSS 内联到 JS
- **真实行为**: `bundle: false` 模式下 CSS 仍输出为独立文件 + JS 里 `import "./xxx.css"` side-effect import。用户的 bundler (Vite/Rspack/webpack) 会处理这个 CSS import
- **适用场景**: 如果后续确实需要零配置内联 CSS，需切换到 `bundle: true` 或用其他方案

## [构建] CSS 文件里 @import 路径是相对于 CSS 文件本身的

- **日期**: 2026-06-02
- **错误假设**: 以为 `src/components/button/button.css` 里 `@import '../theme/theme.css'` 会解析到 `src/theme/`
- **正确做法**: CSS `@import` 路径相对于当前 CSS 文件位置，`src/components/button/` → `../` = `src/components/`，所以需要 `../../theme/theme.css`
- **适用场景**: 所有组件 CSS 文件引用 theme.css 时

- **日期**: 2026-05-15
- **错误假设**: 以为 `bundle: false + dts: true` 会让 d.ts 跟 JS 一样扁平到 `dist/index.d.ts`
- **真实行为**: rslib 的 dts 生成走 tsc，tsc 的 `rootDir` 在没显式指定时取所有 `include` 的最近公共祖先。本仓 `tsconfig.json` 的 include 是 `["src", "docs", "rspress.config.ts"]`，公共祖先 = 项目根，所以 d.ts 跑到 `dist/src/index.d.ts`，跟 `dist/index.js` 不对称，`package.json#types: "./dist/index.d.ts"` 指空。
- **正确做法**: 加独立 `tsconfig.build.json`：
  ```json
  {
    "extends": "./tsconfig.json",
    "compilerOptions": {
      "rootDir": "src",
      "outDir": "dist",
      "declaration": true,
      "emitDeclarationOnly": true
    },
    "include": ["src"]
  }
  ```
  并在 `rslib.config.ts` 的 `source` 里加 `tsconfigPath: './tsconfig.build.json'`。这样 d.ts 就跟 JS 同样扁平。
- **适用场景**: 任何新组件改 `src/index.tsx` 时不用再担心 d.ts 路径漂移；如果未来要把组件库切分子入口（比如 `rihua-ui/number-input`），`exports` 里的 `types` 路径都按 `./dist/<sub>/index.d.ts` 写就对。
