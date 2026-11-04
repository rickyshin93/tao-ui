# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

React 18.2+ 与 React 19 应用开发者、设计系统维护者，以及使用机器可读组件契约组合产品界面的 AI agent。他们需要直接组合可靠组件，并通过语义化插槽和主题 token 做可维护的产品级定制。

## Product Purpose

提供一套现代、类型完整、可主题化的 React 组件库。开发者选择组件和少量 seed token，即可获得一致的视觉、交互状态、响应式行为和暗色模式，而无需反复决定底层颜色、间距与圆角。成功意味着人类开发者与 agent 都能从稳定契约生成可维护、无障碍的界面。

## Positioning

tao-ui 是支持 React 18.2+ 与 React 19 的 AI-native 组件系统：稳定的 typed Semantic DOM、`component-manifest.json`、`llms.txt` 和 `@rockshin/tao-ui/meta` 为 agent 与工具提供机器可读契约；seed-driven OKLCH token 同时保证人类应用中的主题一致性。这组机制不是仅提供视觉组件或仅提供文档的相邻组件库可以原样复制的。

## Operating Context

组件通过 npm/Bun 安装到 React 18.2+ 或 React 19 应用，由 `TaoProvider` 统一配置主题、尺寸、禁用态和变体。维护者在 Rspress 英中双语文档中验证用法与 API，并通过 Bun、Rslib、Rstest 和 Biome 开发、构建与校验。AI agent 和开发工具消费包内的 metadata、manifest 与 llms 输出。

## Capabilities and Constraints

- 提供类型化组件、语义部件 `classNames` / `styles`、响应式 API、无障碍交互、暗色模式与 portaled popup 主题继承。
- 主题采用 Seed → Derived 两层模型；能用 CSS 派生的值不增加 JS runtime。
- 组件库不捆绑字体文件；消费方决定字体加载，Geist 不可用时回退到系统与 CJK 字体栈。
- React 与 React DOM 是 peer dependency，Day.js 是运行依赖；包发布机器可读文档和类型声明。

## Brand Commitments

产品名为 tao-ui。品牌人格是克制、有序、笃定；界面服务任务，不用装饰争夺注意力。避免渐变文字、彩色侧边条、嵌套卡片、装饰性毛玻璃、bounce/elastic 动画、粗边框、过重字重和全大写文案。

## Evidence on Hand

- `README.md` 与 `package.json`：React 18.2+/19、Semantic DOM、OKLCH theming、类型与发布包事实。
- `docs/en/index.mdx`、`docs/zh/index.mdx`：AI-native 定位、无障碍能力与英中双语产品文案。
- `component-manifest.json`、`llms.txt`、`@rockshin/tao-ui/meta`：可运行的机器可读契约。
- `src/theme/theme.css`、组件源码与测试：token、组件状态、响应式和无障碍行为的实现证据。
- 不得虚构客户、使用量、性能基准、商业背书或兼容性声明。

## Product Principles

- 约束消除重复视觉决策。
- 优先用间距、灰度和留白建立层级。
- 组件状态、语义部件与定制接口必须一致、可预测。
- 主题能力由少量 seed token 系统派生。
- 熟悉、无障碍的产品交互优先于无目的的新奇。

## Accessibility & Inclusion

保留清晰的键盘 focus-visible 状态；错误和禁用状态不只依赖颜色；尊重 `prefers-reduced-motion`；文本、placeholder 与交互状态保持可读对比度。
