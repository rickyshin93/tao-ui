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

## [主题] 表单控件的共享样式在 theme/control.css，不在各组件 css

- **日期**: 2026-06-07
- **错误假设**: 诊断"组件自带背景色"时，只扫了 `src/components/*/*.css`，以为每个组件的样式都在自己目录里，得出"装饰底只有 table header 一处"的错误结论
- **正确做法**: input / select / date-picker / range-picker 都带 `data-tao-control` 属性，它们的 variant 背景/边框/focus/error/disabled 全部由共享层 `src/theme/control.css` 统一定义（outlined / filled / borderless 三档）。诊断颜色或交互样式问题，必须连 `src/theme/` 一起看（`theme.css` 管 token，`control.css` 管控件交互态）
- **适用场景**: 任何"为什么所有输入框都有某个颜色/边框/态"的排查；改表单控件统一外观时改 control.css 一处即可

## [主题] 全库所有"白色表面"派生自 bg-base，且 bg-base 是暖 off-white

- **日期**: 2026-06-07
- **错误假设**: 以为组件的白底是各自写死的 `#fff`
- **正确做法**: 派生链是 `--tao-color-bg-base: oklch(0.985 0.004 70)`（**暖 off-white，非纯白**）→ `bg-container` 和 `bg-elevated` 历史上都 `= bg-base`。所以所有浮层(modal/drawer/select/date-picker 弹层)、控件表面(checkbox/radio 框、table 固定列、filled focus 态)的"白"都带这层暖灰，在纯白宿主上会显米色。2026-06-07 已把 `bg-container`/`bg-elevated` 改为纯白 `oklch(1 0 0)`，而 `bg-base` 保留作所有 color-mix 推导底（text/fill/border 调性不变，类比 antd colorBgContainer 默认 #fff）
- **适用场景**: 跨系统集成"白底发灰/不融入"的根因在 bg-base；浮层不能改 transparent(会透穿)，只能定 surface 色或让宿主覆盖 colorBgBase。内联控件(input)才用 transparent 融入宿主

