---
target: "http://localhost:3000/components"
total_score: 24
max_score: 36
na_heuristics: 5
p0_count: 1
p1_count: 3
timestamp: 2026-08-09T09-56-29Z
slug: docs-components
---
Method: dual-agent (A: /root/design_review · B: /root/detector_evidence)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3 | 当前导航和 demo 状态清楚；loading 与 theme seed 反馈完整。 |
| 2 | Match System / Real World | 3 | 术语适合 React/设计系统用户；移动菜单和部分图标名称仍描述外形而非动作。 |
| 3 | User Control and Freedom | 2 | 桌面搜索、目录、Copy Markdown、seed reset 可用；移动搜索无法键盘触达。 |
| 4 | Consistency and Standards | 3 | 品牌、间距和组件状态一致；移动 playground/API 明显偏离响应式标准。 |
| 5 | Error Prevention | n/a | Read 表面没有持久化输入、提交或破坏性主流程。 |
| 6 | Recognition Rather Than Recall | 3 | 桌面 sidebar、outline、标题和 preview 都可见；移动图标与隐藏菜单增加猜测。 |
| 7 | Flexibility and Efficiency | 3 | ⌘K、Copy Markdown、可编辑 playground、锚点目录对专家高效。 |
| 8 | Aesthetic and Minimalist Design | 2 | 首屏克制；四个默认展开 editor 把 4,607px 页面变成代码墙。 |
| 9 | Error Recognition / Recovery | 2 | `/components` 明确显示 404，但只允许回首页，缺少组件恢复路径。 |
| 10 | Help and Documentation | 3 | task-first 文案、真实 demo、API 齐全；移动端关键帮助不可读。 |
| **Total** |  | **24/36** | **66.7% · Acceptable** |

## Design Specificity Verdict

**中等作者性：视觉已属 tao-ui，结构与交互仍像换肤后的标准 Rspress。** 暖纸、近黑墨、Garamond italic 标题、Geist 正文、发丝线和“道”字标形成明确品牌识别，符合“克制、有序、笃定”。但核心构图仍是标准三栏 docs shell，组件页固定为“说明 → playground → API”。产品最独特的 seed 推导、Semantic DOM、可预测状态尚未成为页面级导航和阅读机制。

**确定性扫描：** `detect.mjs --json docs/components` 返回 `[]`，0 条规则命中、无 false positive。检测器没有发现源码层 anti-pattern；它也没有捕捉到运行时路由、插件响应式布局和交互语义问题。

**浏览器证据：** `http://localhost:3000/components` 返回 HTTP 200，但 title 为 `404 - tao-ui`，正文为 `404 / PAGE NOT FOUND / Take me home`，是 soft-404。DOM 中 Components 导航实际指向 `/components/button.html`。浏览器安全策略阻止 mutable script preflight，因此没有可靠的可见 overlay，也没有 runtime detector console 结果；证据来自独立桌面/移动截图、DOM、尺寸与交互实测。

## Overall Impression

桌面 Button 页已经有可信的品牌与内容骨架，问题不在“太默认”这么简单。最大机会是把 Components 从一个缺失的集合入口和一串默认展开插件块，改成真正服务“发现组件 → 理解用途 → 验证状态 → 查 API”的 Read 流程。当前精确入口直接 404，移动端核心内容几乎失效，已盖过视觉优点。

## What's Working

1. **主题实现路径正确。** 使用 Rspress CSS variables/BEM 覆盖、Layout wrapper、`theme-original` re-export；`Root` 只为注入 TaoProvider，未无意义 eject 大量组件。
2. **视觉人格明确。** 暖纸、低彩灰度、细线、轻字重、克制圆角统一，不是默认文档白底。
3. **内容顺序与反馈可信。** 先用途和反例，再展示变体、状态、主题、Semantic DOM，最后 API；loading 与 seed demo 都有即时且语义完整的反馈。

## Priority Issues

### [P0] `/components` 是 soft-404，而不是组件索引

- **Why it matters:** 用户、外链、搜索结果和自然 URL 猜测都会把组件集合入口视为产品核心；当前无法完成“浏览组件”的基本任务。
- **Evidence:** `docs/components` 没有 `index.mdx`；`rspress.config.ts` 的 nav 直接绕到 `/components/button`；实机 `/components` 显示 404。
- **Fix:** 新建简洁、task-first 的 `docs/components/index.mdx`，按用途/类别列出组件并链接深入页；若暂不做索引，至少配置明确重定向到 `/components/button`。404 recovery 增加 “Browse components”。
- **Suggested command:** `$impeccable shape`

### [P1] 移动 playground 不可读、不可可靠操作

- **Why it matters:** “看代码 ↔ 看结果”是组件文档核心任务；390px 下用户无法判断行为。
- **Evidence:** 390×844 下 playground 仅 262px 宽却仍横向双栏：editor 156px、runner 104px，按钮文字和代码被裁切。
- **Fix:** 小屏改纵向、preview-first；preview 整宽；代码默认折叠或用明确 toggle 展开；保留一个主 Playground，其余用轻量 preview/code disclosure。
- **Suggested command:** `$impeccable adapt`

### [P1] 移动 API 表变成 2,715px 高的字符柱

- **Why it matters:** API 是文档的权威终点，却无法扫描、比较或复制，破坏组件库的可信度。
- **Evidence:** 表宽 262px；复杂 Type 每数个字符换行，整表高约 2,715.5px。
- **Fix:** 最低方案是显式横向滚动容器并设置 Property/Type 最小宽；更好的小屏模式是 definition-list/card-row，按 Property → Description → Type → Default 纵向组织。
- **Suggested command:** `$impeccable adapt`

### [P1] 移动搜索和辅助控制语义失效

- **Why it matters:** 键盘和屏幕阅读器用户无法触发搜索或理解菜单/复制选项。
- **Evidence:** `.rp-search-button--mobile` 是无 role/tabindex 的 `<div>`；hamburger 的 aria-label 描述外形；Copy Markdown 旁箭头无可访问名称。
- **Fix:** 搜索使用原生 button + `Search documentation`；菜单使用 `Open navigation` 并暴露 expanded 状态；箭头命名 `Markdown options`。先尝试 Rspress config/slots/wrap，CSS 无法修语义时只 eject 对应组件。
- **Suggested command:** `$impeccable audit`

### [P2] Read 模式被四个默认展开 editor 主导

- **Why it matters:** 扫读、比较用法和直达 API 变慢；Jordan 会误以为使用组件前必须理解实现。
- **Evidence:** 桌面内容约 4,607px，移动约 6,589px；四个 playground 各约 400px 高，editor 和 preview 同权呈现。
- **Fix:** 默认 preview + 最小 runnable snippet；完整 editor 按需展开。把 “可编辑” 从默认版式降为渐进能力。
- **Suggested command:** `$impeccable distill`

## Cognitive Load

- Single focus：失败；preview 与 editor 近等权。
- Chunking：通过；章节分组清楚。
- Grouping：通过；标题、说明和 demo 关系清晰。
- Visual hierarchy：通过；标题与正文层级稳定。
- One thing at a time：失败；用户同时读说明、代码和结果。
- Minimal choices：失败；Variants 5 个并列状态，On This Page 6 个入口。
- Working memory：通过；桌面 outline 持续可见。
- Progressive disclosure：失败；四个 editor 全部展开。

四项失败，属于高认知负荷。负荷来源不是文案，而是插件内容的默认展开方式与移动压缩。

## Emotional Journey

- 入口谷底：`/components` 首屏 404，建立信任前即被拒绝。
- Button 页恢复：纸墨视觉、清晰定义和 When to use 建立秩序感。
- 峰值：loading 与 theme seed 的即时反馈最能体现“笃定”。
- 中段疲劳：连续四个 editor 拉长阅读路径。
- 结尾分裂：桌面 API 可信；移动 API 以字符柱收尾，最终记忆是失控。

## Persona Red Flags

**Alex（Power User）**：自然访问 `/components` 失败；四个展开 editor 拉长扫描路径。正面是 ⌘K、Copy Markdown、目录和 live editor 均符合专家预期。

**Jordan（First-Timer）**：404 没有“浏览组件”恢复路径；Theme seed、Semantic DOM 缺一句直白定义；默认代码编辑器压过结果，制造学习门槛。

**Sam（Keyboard / Screen Reader）**：移动搜索无法正常 Tab 聚焦；`mobile hamburger` 和空名称 dropdown 不说明动作；API 类型列碎裂，200% zoom 更差；多个 32–37px 控制小于稳妥的 44px touch target。

## Minor Observations

- `ON THIS PAGE`、`PAGE NOT FOUND` 全大写，偏离品牌 anti-reference。
- Button 页浏览器 title 仍仅为 `tao-ui`，缺少页面上下文。
- H1 `Button` 与 API H3 `Button` 都指向 `#button`，需检查重复 ID/目录锚点。
- 桌面代码栏对长 import/type 行也偏窄。
- `.rspress-doc` 72ch、15.5px/27.1px 阅读尺度舒适，不需要扩宽。
- 当前 sidebar 只有 Button；`overflow: hidden` 尚未出问题，但批量生成组件页后会失去侧栏滚动，需纳入 smoke coverage。

## Questions to Consider

1. 用户心智中必然存在 “Components” 集合：为什么它不是产品最重要的索引？
2. Read 模式真的需要每个示例立即可编辑，还是应先理解、需要时再编辑？
3. 104px runner + 156px editor 是移动设计决策，还是插件默认值泄漏？
4. 若“可预测”是核心承诺，移动 API 是否应该成为发布门禁？
