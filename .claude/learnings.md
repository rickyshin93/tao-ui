# tao-ui 项目自我学习

## [Rspress] 首页 mdx 正文不渲染，但 iframe 演示照样生成
- **日期**: 2026-11-05
- **错误假设**: 想在首页手机壳里展示真实移动端 Select/DatePicker 抽屉，只能复用组件页的 `_zh_components_select_N` 演示（编号随文档变化，脆弱），或想办法把抽屉 portal 进手机壳。
- **真实行为**: `pageType: home` 的 HomeLayout 只渲染 hero/features，不渲染 mdx 正文；但 plugin-preview 的 remark 仍处理正文里的 ```tsx preview="iframe-follow"``` 代码块，生成 `/~demo/_zh_index_1.html`。抽屉 portal 到 document.body，只有独立 iframe 视口（<576px）才能真实呈现移动端形态。
- **正确做法**: 在 `docs/{zh,en}/index.mdx` 正文放一个 iframe-follow 块，只 import `@home-phone-demo`（rspress.config.ts 的 iframeOptions.builderConfig alias 指向 `docs/_components/home-phone-demo.tsx`）；首页用自绘手机壳 iframe 指向该 demo id，用 postMessage 传 scene/seed/dark。
- **适用场景**: 首页或任何不渲染正文的页面需要独立视口的真实组件演示。

## [Table CSS] 固定列阴影伪元素要盖住 cell 自身的 border-bottom
- **日期**: 2026-10-15
- **错误假设**: sticky cell 的阴影伪元素 `bottom: 0` 即可连续成一条竖向阴影。
- **真实行为**: `border-collapse: separate` 下绝对定位只到 padding box，每行分隔线处阴影断开 1px；改成 `bottom: -lineWidth`（同 antd）后，`modern` 末行无分隔线又会越出 table 1px，撑出竖向滚动条。
- **正确做法**: 伪元素 `bottom: calc(var(--tao-line-width) * -1)`，横向滚动容器显式 `overflow-y: hidden`。另：默认主色近黑，验证「主色浅调」类效果要临时把 `--tao-color-primary` 设成彩色再截图。
- **适用场景**: Table 固定列阴影、任何跨行拼接的 cell 伪元素装饰。

## [Input CSS] 原生单行输入框必须几何居中整条行盒
- **日期**: 2026-08-27
- **错误假设**: 可以把普通文本的原生行盒上移 1px 来校正字形光学中心，同时保持 focus 光标视觉居中。
- **真实行为**: 原生 input 的文字、光标和选区共享行盒；偏移 padding 会一起移动三者，截图中光标因此明显偏上。
- **正确做法**: 上下 padding 都使用 `(controlHeight - lineHeight) / 2 - lineWidth`，优先保证行盒、光标和选区几何居中；密码仅用 Arial 改善圆点字形，不偏移行盒。
- **适用场景**: Input、InputNumber 等单行原生控件的文字、focus 光标、选区或密码圆点垂直对齐。

## [Biome] 多行 JSX 属性的 lint 抑制按诊断行匹配
- **日期**: 2026-08-02
- **错误假设**: 把 `biome-ignore` 放在多行 JSX 元素前即可抑制该元素任意属性上的诊断。
- **真实行为**: 格式化把 `role` 移到后续行后，抑制只匹配元素起始行，属性诊断重新出现。
- **正确做法**: 对文件内唯一的已论证例外使用文件级 `biome-ignore-all <rule>`，并写明语义原因。
- **适用场景**: Biome 对格式化后的多行 JSX 属性报需要保留的 a11y 例外时。

## [测试] Radix Popover 在 happy-dom 中脚本聚焦日期会回焦 trigger
- **日期**: 2026-08-02
- **错误假设**: DatePicker 打开后可在集成测试里调用日期按钮 `focus()`，再断言方向键移动后的 `document.activeElement`。
- **真实行为**: happy-dom 下 Radix Popover 会把这次 portal 内聚焦判成关闭路径，关闭浮层并把焦点还给 trigger；浏览器中的键盘逻辑无法通过该集成断言稳定验证。
- **正确做法**: DatePicker 集成层断言日期网格只有一个 tab stop；方向键/roving focus 在 `CalendarGrid` seam 直接测试。
- **适用场景**: DatePicker、RangePicker 等 Radix Popover 内部焦点移动测试。

## [Radix Dialog] maskClosable 不能直接映射 outside-dismiss
- **日期**: 2026-07-26
- **错误假设**: `maskClosable=true` 可以直接放行 Radix Dialog 的 outside-dismiss，再对白名单 portal 特判。
- **真实行为**: Antd 的语义是仅真实 mask 点击关闭；Radix outside-dismiss 还会覆盖 Select 等 portaled 内容，范围更宽。
- **正确做法**: Drawer/Modal 始终阻止 outside-dismiss，只在自身 Overlay 的 click 上按 `maskClosable` 调用 `onClose`。
- **适用场景**: Drawer/Modal 内嵌 Select、DatePicker、Dropdown 等 portaled popup。

## [测试] Select 打开时 getByRole 看不到父 Drawer 不代表已关闭
- **日期**: 2026-07-26
- **错误假设**: 选择后 `getByRole('dialog')` 数量为 0，说明 Drawer 已关闭。
- **真实行为**: Radix Select 打开时会把父 Drawer 标为 `aria-hidden`，可访问树查询返回 0，但 `[data-tao-drawer][data-state]` 仍是 `open`。
- **正确做法**: 测真实关闭状态用 Drawer DOM 的 `data-state` 或受控 `open` 状态；可访问树只用于当前可访问性。
- **适用场景**: 嵌套 modal/select 的浏览器和组件测试。

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


## [架构] Portal 组件逃逸 TaoProvider 作用域 → 丢失主题 token
- **日期**: 2026-06-07
- **错误假设**: 以为组件 CSS 写了 `var(--tao-color-*)` 就能消费自定义主题
- **真实行为**: 自定义 token 由 TaoProvider 以 inline style 注入到 `<div data-tao-provider>` 上。Modal/Drawer/Select/DatePicker/Dropdown/ContextMenu 用 Radix Portal 渲染到 `document.body`，DOM 上脱离了 provider 子树 → 只拿到 `:root` 默认值，自定义主题失效
- **正确做法**: TaoConfigContext 增加 merged `tokenStyle`（累积所有祖先 provider 的 vars），导出 `TaoPortalScope`，在每个 Portal 内层包一个 `<div data-tao-provider style={tokenStyle}>` 重建 token 作用域。Radix 定位用 floating-ui 基于 trigger 虚拟元素，与 DOM 父级无关，多包一层 div 不影响定位/focus trap
- **适用场景**: 任何新增的 Portal/浮层组件，都要用 `TaoPortalScope` 包裹 portal 内容，否则自定义主题不生效

## [架构] 浮层 z-index 必须高于 Modal/Drawer
- **日期**: 2026-06-07
- **错误假设**: 浮层和 Modal 都用 z-index 1000 没问题
- **真实行为**: Modal wrap 1001 > Select dropdown 1000 → Modal 里的 Select 下拉被遮住看不见
- **正确做法**: theme.css 定义 z-index 层级变量：`--tao-z-index-modal/drawer: 1000`，`--tao-z-index-popup: 1100`。Modal/Drawer overlay 用 modal/drawer 变量，content 用 `calc(+1)`；所有浮层（select-content/picker-dropdown/menu-content）用 `--tao-z-index-popup`，保证嵌在 Modal 里也在上层
- **适用场景**: 新增浮层组件的 dropdown/popup content z-index 一律用 `var(--tao-z-index-popup)`

## [测试] Radix Select 桌面下拉在 happy-dom 不展开
- **日期**: 2026-06-07
- **错误假设**: 以为能在 rstest 里 click trigger 打开 Radix Select 下拉、断言 option/分组/placement
- **真实行为**: Radix Select(position="popper") 依赖 DOM 测量/pointer，在 happy-dom 里点击 trigger 不会渲染出 Content。select 既有测试也全程回避桌面展开
- **正确做法**: 开合相关行为（onChange 拿到 option、分组渲染、选中回调）用 `mobile` 分支测（真实 DOM 的 Drawer + div 可点击）；trigger 上可观察的 props（status data 属性、defaultValue/labelRender 显示、suffixIcon、classNames 合并、hover 出 clear）在桌面关闭态直接断言
- **适用场景**: 给 Select / 其他 Radix Popover-类浮层组件写测试时

## [样式] Select trigger flex 布局：`> span:first-of-type` hack 会抢 prefix 的 flex
- **日期**: 2026-06-07
- **错误假设**: 以为 trigger 里只有 `[data-tao-select-value]{flex:1}` 控制布局
- **真实行为**: select.css 有个 Radix-Value 时代的遗留 hack `[data-tao-select] > span:first-of-type { flex:1 }`。重构后 trigger 总是显式渲染 value span，但有 `prefix` 时 first span 变成 prefix → 这个 hack 把 flex:1 给了 prefix，prefix 撑大把 placeholder/文字挤到右边贴着 loading/箭头，看起来「位置偏移」
- **正确做法**: 删掉 `> span:first-of-type` hack，只靠显式的 `[data-tao-select-value]{flex:1}`。value-icon/prefix 用各自的 flex:0 0 auto
- **适用场景**: 改 Select trigger 内部布局时；新增 trigger 子元素（prefix/suffix/icon）务必检查是否被这类 first-of-type/nth 选择器误伤

## [验证] happy-dom 不算布局，用 headless Chrome 截图验 CSS 定位
- **日期**: 2026-06-07
- **错误假设**: 以为靠读 CSS + happy-dom 测试能判断 flex/定位类视觉 bug
- **真实行为**: rstest 用 happy-dom，不计算 flex/宽度/位置，定位类问题测不出来；项目也没装 playwright/puppeteer
- **正确做法**: 用系统自带 Chrome 截图实测：拼一个最小 HTML，`@import url("file://.../dist/theme/theme.css" + control.css + 组件.css)`，照着真实 DOM（可用一个 throw outerHTML 的临时测试 dump 出来）写 markup，`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=out.png --window-size=W,H --default-background-color=FFFFFFFF page.html`，再 Read 图。注意 theme.css 里的 `@import 'tailwindcss'` 会 404 但不影响 CSS 变量加载
- **适用场景**: 任何位置/对齐/尺寸类视觉 bug，不要靠猜，截图实测

## [工具链] 包管理器是 bun，不是 pnpm/npm
- **日期**: 2026-06-07
- **错误假设**: 看到没有 lockfile 就用 `pnpm install`，生成了 pnpm-lock.yaml
- **真实行为**: 项目用 **bun**：`bun.lockb` 已入库，CI(release.yml) 用 `bun install --frozen-lockfile`。误用 pnpm 会留下冲突 lockfile，且 package.json 改了而 bun.lockb 没更 → CI frozen-lockfile 直接失败、发布挂掉
- **正确做法**: 一律用 `bun install` / `bun run <script>`。改完依赖用 bun 重装更新 bun.lockb，再 `bun run test` + `bun run build` 镜像 CI 验证。别生成 pnpm-lock/package-lock
- **适用场景**: 任何装/改依赖、跑脚本、发版前验证

## [发布] tao-ui 发版流程：GitHub Release 触发 CI npm publish
- **日期**: 2026-06-07
- **正确做法**: ① 改 package.json version ② `bun install` 更新 bun.lockb ③ commit + push main ④ `gh release create vX.Y.Z`（tag 必须 = package.json version，否则 CI 的 verify 步骤报错）。`release.mjs` 必须在改版本后同步 lockfile，否则 CI 的 `bun install --frozen-lockfile` 会失败。release.yml 在 `release: published` 时跑 test→build→`npm publish`(NODE_AUTH_TOKEN=secrets.NPM_TOKEN)。包名 `@rockshin/tao-ui`
- **适用场景**: 发新版本时照此走，不要本地手动 npm publish

## [工具链] AGENTS.md 的 lint 命令与 package.json 不一致
- **日期**: 2026-07-25
- **错误假设**: 按 AGENTS.md 使用 `bun run lint` 做校验
- **真实行为**: 当前 `package.json` 没有 `lint` script，Biome 脚本名是 `check`，且自带 `--write`
- **正确做法**: 只读校验指定文件时运行 `bun x biome check <files>`；需要自动修复时才运行 `bun run check`
- **适用场景**: tao-ui 的格式和 lint 校验

## [Bun] 普通 install 不会清理旧 pnpm symlink
- **日期**: 2026-07-25
- **错误假设**: `bun install` 会替换 `node_modules` 中其他包管理器留下的链接
- **真实行为**: 旧 `.pnpm` symlink 仍可能被 Testing Library 解析，导致应用与 renderer 加载不同 React 实例并报 Invalid hook call
- **正确做法**: 发现同一包解析到不同路径时运行 `bun install --force` 重建链接，再用 `bun install --frozen-lockfile` 验证 lockfile
- **适用场景**: tao-ui 切换包管理器或 clean install 后出现批量 Invalid hook call

## [CSS] Input size 规则会覆盖低优先级的 prefix 间距规则
- **日期**: 2026-07-25
- **错误假设**: 把 `[data-tao-prefix] + input` 写在 size 规则后面，就能覆盖 input 的 12px padding
- **真实行为**: size 规则选择器优先级更高；同时 DESIGN.md 中的 `--tao-margin-xxs` 未在 theme.css 实现，浏览器实际没有得到预期的 4px
- **正确做法**: 普通 prefix 保持 padding-sm；prefix 渲染 SVG React 组件时自动改为 overlay，并为 input 预留 padding-sm + 16px + padding-sm；用 headless Chrome 检查 computed style
- **适用场景**: 调整带 prefix/suffix 的 Input、InputNumber 或类似组合控件间距时

## [DatePicker] PC 与 mobile 需要不同的 trigger 语义
- **日期**: 2026-07-25
- **错误假设**: DatePicker 可以让 PC 与 mobile 共用 button trigger，仅切换 Popover/Drawer 容器
- **真实行为**: button 内只有展示文本，PC 用户无法键盘输入日期
- **正确做法**: PC 渲染真实 input，按 format 严格解析并在 Enter/blur 提交；mobile 保持 button + Drawer
- **适用场景**: 修改 DatePicker/RangePicker trigger 或补充键盘交互时

## [Radix Select] 可编辑 combobox 不能复用 Select Content
- **日期**: 2026-07-25
- **错误假设**: 在 Radix Select Trigger 内放 input，再把焦点拉回 input，就能实现 PC 可搜索 Select
- **真实行为**: Select Content 打开后会强制聚焦 option、锁定 body pointer events，并对 trigger 区域 aria-hidden；focus hack 会得到不可访问的假 input
- **正确做法**: PC `showSearch` 使用非 modal Radix Popover + 原生 combobox input/listbox（含 single/multiple/tags）；普通 Select 继续用 Radix Select，mobile 继续 Drawer
- **适用场景**: 任何需要在 tao-ui Select trigger 内直接编辑文本的功能

## [Rspress MDX] 多行内联 JSX 文本会生成段落子节点
- **日期**: 2026-08-09
- **错误假设**: `<a>` 或自定义 Link 内换行书写的短文本，编译后仍是普通文本子节点。
- **真实行为**: Rspress MDX 会把该文本包装成 `<p>`，产生 `<a><p>…</p></a>` 这类无效交互标记。
- **正确做法**: 短链接文案与 JSX 开闭标签保持同一行，或显式传字符串表达式。
- **适用场景**: `.mdx` 中手写链接及其他只允许 phrasing content 的 JSX 元素。

## [Rspress] 生成的 llms.txt 不参与构建期路由校验
- **日期**: 2026-08-09
- **错误假设**: `llms: true` 生成 `/llms.txt` 后，可以在 MDX 中把它写成普通站内 Markdown 链接。
- **真实行为**: Rspress 的 dead-link 检查只认页面路由，构建期会把 `/llms.txt` 判为死链，即使最终产物会生成该文件。
- **正确做法**: 在文档中用代码文本标识 `/llms.txt`；若必须提供可点击入口，先单独验证不会触发路由检查的实现方式。
- **适用场景**: Rspress `llms: true` 站点引用生成的 `llms.txt` / `llms-full.txt` 文件。

## [Rspress Playground] 外部 Demo 的包依赖需要显式 include
- **日期**: 2026-08-09
- **错误假设**: `pluginPlayground` 会自动扫描 `file="./_demo.tsx"` 指向文件里的 import，并把 workspace 包加入浏览器运行时。
- **真实行为**: Rspress 2.0.19 的 Playground import 扫描只覆盖内联代码块；外部 file code block 中的 `@rockshin/tao-ui` 不会进入 import map，运行时显示 `Module @rockshin/tao-ui not found`。
- **正确做法**: 在 `pluginPlayground({ include: ['@rockshin/tao-ui'] })` 中显式加入外部 Demo 使用的包依赖。
- **适用场景**: Rspress Playground 通过 `file=` 引用独立 Demo 文件，且 Demo import npm/workspace 包时。

## [Rspress] dev 与 production build 不要共享缓存并发运行
- **日期**: 2026-08-09
- **错误假设**: `rspress dev` 运行时可以并发执行 `rspress build`，两者会隔离各自的 Rspack 状态。
- **真实行为**: 两个进程会竞争同一缓存和 Playground 虚拟模块；dev 热更新可能出现 cache lock mismatch 或无法解析 `_rspress_playground_imports`。
- **正确做法**: 浏览器验收结束后先停止 dev server，再串行执行 `bun run doc:build`；需要复验时重新冷启动 dev。
- **适用场景**: tao-ui 文档站的 Rspress dev、production build 和 Playground 验证流程。

## [Rspress] 配置热重启时不要同时停止 dev
- **日期**: 2026-08-09
- **错误假设**: 修改 `rspress.config.ts` 后可以立即向 `bun run doc` 发送停止信号，热重启和退出会自然串行。
- **真实行为**: Rspress 正在重启监听器时收到停止信号，旧进程可能短暂继续占用 3000，重启进程报 `EADDRINUSE`。
- **正确做法**: 配置变更后先等待热重启完成并确认端口稳定，再停止 dev；若已竞态，检查精确 PID/端口并等待旧监听器退出，不要盲目再次启动。
- **适用场景**: tao-ui 修改 `rspress.config.ts` 后需要从 dev 切换到 production build 时。

## [Rspress IA] Components 入口直达首个组件
- **日期**: 2026-08-09
- **错误假设**: 修复 `/components` 入口就该新增一个组件目录首页。
- **真实行为**: tao-ui 当前只有 Button 文档，额外目录页增加一次无意义跳转，也偏离 Rspress 官网的直接导航方式。
- **正确做法**: 顶栏 Components 直接链接 `/components/button`；组件未形成足够规模前不创建中间 catalog 页。
- **适用场景**: 组件库文档的信息架构与顶栏入口设计。

## [Rspress Redirect] 路由规则需要锚定
- **日期**: 2026-08-09
- **错误假设**: `pluginClientRedirects` 的 `from: '/components'` 只匹配完整路径。
- **真实行为**: 规则按正则/前缀语义匹配，也会命中 `/components/button`，导致目标路径反复追加 `/button`。
- **正确做法**: 单一路径重定向使用 `^/components/?$` 这类首尾锚定规则。
- **适用场景**: Rspress `@rspress/plugin-client-redirects` 的精确路径跳转。

## [Rspress Layout] Outline 不进入正文滚动容器
- **日期**: 2026-08-09
- **错误假设**: 让 `.rp-doc-layout__container` 统一滚动，能同时满足单滚动容器与三栏布局。
- **真实行为**: Outline 是该容器的子元素，会随正文一起滚走，偏离 Rspress 官网的视口驻留行为。
- **正确做法**: 三栏容器 `overflow: hidden`；仅中间 `.rp-doc-layout__doc` 纵向滚动，左右栏作为正常 Flex 兄弟留在视口内。
- **适用场景**: tao-ui Rspress 文档页的左侧导航、正文和右侧目录布局。

## [Rspress Layout] 全高 Flex 只用于文档页
- **日期**: 2026-08-09
- **错误假设**: `#__rspress_root` 可以在所有 pageType 上统一设为纵向 Flex，再分别配置滚动。
- **真实行为**: Rspress HomeLayout 直接输出 Hero、Feature、Footer；它们成为 Flex item 后默认收缩，Feature 被压到约 20px 并裁切，首页无法完整滚动。
- **正确做法**: 根节点默认保持普通文档流并自行滚动；仅在 `:has(.rp-doc-layout__container)` 的文档页启用全高 Flex，正文列单独滚动。
- **适用场景**: 同时包含 `pageType: home` 与三栏 doc 页的 tao-ui Rspress 站点。

## [Rspress] 默认主题是重建基线
- **日期**: 2026-08-09
- **错误假设**: 为了匹配官网体验，需要先重写全高滚动、导航、搜索、首页组件和文档运行时，再逐个修补差异。
- **真实行为**: Rspress v2 默认主题已经提供首页、三栏文档、响应式导航、搜索和滚动行为；多层覆盖会制造与官网相反的布局及可访问性问题。
- **正确做法**: 从 `pageType: home`、`_nav.json`、`_meta.json`、Preview 和 API Docgen 起步；只在明确需求且官方配置不足时按 CSS variables → BEM → Layout slots → eject 逐级扩展。
- **适用场景**: tao-ui 文档站新建、重建及后续任何 Rspress 主题改动。

## [Rspress API] API docgen 表格对齐是内联样式

- **日期**: 2026-08-09
- **错误假设**: Rspress 默认主题的 `th { text-align: left }` 足以控制 API 表格。
- **真实行为**: `@rspress/plugin-api-docgen` 给 API 表格的 `th` 和 `td` 写入 `style="text-align: center"`，普通主题规则无法覆盖。
- **正确做法**: 在 `.rp-doc` 内对 API 表格单元格做带 `!important` 的窄范围左对齐覆盖，避免影响组件 Demo。
- **适用场景**: tao-ui 使用 `<API moduleName="..." />` 生成属性表格时。

## [Rspress MDX] JSX 对象示例必须进入代码语境

- **日期**: 2026-08-09
- **错误假设**: 组件元数据里的 `direction={{ xs: 'vertical', md: 'horizontal' }}` 可以原样写入 MDX 正文。
- **真实行为**: MDX 会把花括号解析为表达式，并尝试把 `{ xs, md }` 对象渲染成 React child，导致 SSG 失败。
- **正确做法**: 正文中的 JSX prop 示例必须包在行内代码或代码块中；批量生成后扫描代码块外的 `{}`。
- **适用场景**: 从组件元数据、Storybook 或清单批量生成 Rspress MDX 页面。

## [Rspress i18n] 默认语言也必须进入语言目录

- **日期**: 2026-08-09
- **错误假设**: 默认英文文档可以继续放在 `docs/` 根目录，只为中文新增 `docs/zh/`。
- **真实行为**: Rspress 自动导航会按每个 locale 扫描 `docs/<lang>/`；默认语言缺少对应目录时无法生成完整导航。
- **正确做法**: 中英文分别放入 `docs/en/**`、`docs/zh/**`；配置 `lang: 'en'` 后，Rspress 会自动移除默认语言 URL 前缀，并为中文保留 `/zh/`。
- **适用场景**: 使用 Rspress locales、自动导航、搜索索引和 llms 输出的多语言文档站。

## [Rspress Preview] 可运行示例必须真实维护状态

- **日期**: 2026-08-09
- **错误假设**: Preview 中用固定 `value` / `checked` 展示初始状态，同时省略状态更新也算可运行示例。
- **真实行为**: click 事件会正常到达组件，但 React 会立即把值恢复为固定 prop，用户看到的结果就是“无法点击”。
- **正确做法**: Preview 优先使用局部 `useState` 和 `onChange` 明确维护状态；只有在组件已验证支持 uncontrolled 行为时才使用 `defaultValue` / `defaultChecked`。
- **适用场景**: tao-ui 的 Rspress Preview、Storybook stories 和任何复制为文档的交互示例。

## [Scope] Rspress 问题只在文档层解决

- **日期**: 2026-08-09
- **错误假设**: Rspress Preview 暴露的交互或视觉问题可以直接通过修改组件实现和全局主题解决。
- **真实行为**: 组件本体是独立产品面；用户明确要求 Rspress 问题不得改动组件，输入边框与 focus 样式也必须保持组件原貌。
- **正确做法**: 先对照 Storybook/组件测试确认组件行为；文档问题只改 `docs/**`、Rspress 配置或文档主题。没有明确授权不得修改 `src/components/**`、`src/theme/**` 和组件契约。
- **适用场景**: tao-ui 文档站的 Preview、样式覆盖、示例状态与交互问题。

## [GitHub Pages] 私有仓库先检查套餐，再启用 Pages 和授予读取权限
- **日期**: 2026-08-10
- **错误假设**: 提交 Pages workflow 后，`actions/configure-pages` 能用默认 `GITHUB_TOKEN` 自动完成首次启用，且任意 GitHub 套餐都支持私有仓库 Pages。
- **真实行为**: 未启用时 Pages API 返回 404；当前套餐创建私有仓库 Pages 会返回 422。`configure-pages` 的 `enablement: true` 还要求非 `GITHUB_TOKEN` 的管理员 token，私有仓库读取 Pages 配置需要 `pages: read`。
- **正确做法**: 先检查仓库 visibility 与套餐是否支持 Pages；再由管理员在 Settings/API 一次性把 publishing source 设为 GitHub Actions。build job 授予 `contents: read` + `pages: read`，deploy job 保留 `pages: write` + `id-token: write`。
- **适用场景**: 私有仓库首次部署自定义 GitHub Pages workflow。

## [Button] Flex 居中时不要把文字行高固定为 1
- **日期**: 2026-08-19
- **错误假设**: Button 使用 `inline-flex + align-items: center` 后，再设 `line-height: 1` 能让不同字体的字形都视觉居中。
- **真实行为**: `line-height: 1` 只压缩行盒；消费方切换字体后会放大字形墨迹与行盒中心的偏差。antd Button 保留正常的内容行高，由固定控件高度和 Flex 负责几何居中。
- **正确做法**: Button 使用主题的 `--tao-line-height`，图标槽继续独立使用 `line-height: 0`；跨应用用真实消费字体截图验收。
- **适用场景**: Button、Tag 等固定高度控件在宿主应用切换字体后出现文字上下偏移时。

## [测试] rstest 组件 CSS 不进入 happy-dom cascade
- **日期**: 2026-08-25
- **错误假设**: 在 rstest 中给 Semantic DOM 部件追加消费方 `<style>`，再用 `getComputedStyle` 就能验证组件 CSS 与消费方 CSS 的 specificity 关系。
- **真实行为**: 组件 CSS 由构建链处理但未作为 stylesheet 注入 happy-dom，测试会在缺少组件默认规则时假绿。
- **正确做法**: 组件测试锁定 CSS selector/layer 契约，构建后再用真实浏览器验证 cascade；不要用 happy-dom computed style 证明组件 CSS 覆盖关系。
- **适用场景**: Textarea、Input 等需要验证 CSS layer、specificity 或真实尺寸覆盖时。

## [发布] npm 校验必须绕过本地镜像缓存
- **日期**: 2026-08-25
- **错误假设**: GitHub Actions 发布成功后，直接执行 `npm view` 一定能立即读到新版本。
- **真实行为**: 本机 npm registry 指向 `npmmirror`；镜像同步滞后会让 release 脚本在官方 npm 已发布成功后误报旧版本。
- **正确做法**: 发布后的权威校验显式使用 `--registry=https://registry.npmjs.org/ --prefer-online`；镜像只用于日常安装加速。
- **适用场景**: release workflow 已成功，但本地版本校验仍返回上一版本。
