# tao-ui 项目指南

## 新组件开发清单

每个新组件必须包含：

1. **组件文件** `src/components/<name>/<name>.tsx` + `<name>.css`
2. **Semantic DOM** — 定义 `<Name>SemanticPart` 类型，props 加 `classNames` / `styles`
3. **导出** — 在 `src/index.tsx` 导出组件、Props 类型、SemanticPart 类型
4. **测试** `tests/<name>/<name>.test.tsx`
5. **Story** `stories/<name>.stories.tsx`，按 antd 分类放 title
6. **Build 验证** — `rslib build` 通过（含 d.ts）

### Semantic DOM 规范

每个组件暴露 `classNames` 和 `styles` prop，按语义部件定制内部 DOM：

```tsx
import { cx, type SemanticClassNames, type SemanticStyles } from '../../utils/semantic';

export type ExampleSemanticPart = 'root' | 'header' | 'body';

export interface ExampleProps {
  classNames?: SemanticClassNames<ExampleSemanticPart>;
  styles?: SemanticStyles<ExampleSemanticPart>;
  className?: string; // 合并到 root
}

// JSX 中应用：
<div className={cx(classNames?.root, className)} style={styles?.root}>
  <div className={cx(classNames?.header)} style={styles?.header}>...</div>
</div>
```

规则：
- `className` prop 通过 `cx(classNames?.root, className)` 与 `classNames.root` 合并
- 只暴露用户真正会定制的部件，不要把每个 DOM 节点都暴露
- SemanticPart 类型必须导出，方便消费方使用
- Table 等复杂组件用点号命名：`'header.cell' | 'body.row'`

### Storybook 分类（参考 antd）

| 分类 | 示例组件 |
|------|---------|
| `通用 General/` | Button |
| `布局 Layout/` | Stack, FormLayout |
| `导航 Navigation/` | Tabs, Pagination |
| `数据录入 Data Entry/` | Input, Select, Checkbox, Radio, Switch, DatePicker, Form |
| `数据展示 Data Display/` | Table |
| `反馈 Feedback/` | Drawer |
| `配置 Config/` | TaoProvider |

### 样式规范

- CSS 变量前缀 `--tao-*`，data 属性 `data-tao-*`
- theme.css 和 control.css 在 `src/index.tsx` 顶层统一导入，组件 CSS 不需要 `@import theme`
- **不要动 package.json 的 `sideEffects`**——白名单里显式列了 `./dist/index.js` 和 `./src/index.tsx`，让 tree-shaker 保留入口的 CSS 副作用（否则 Storybook/rspack/esbuild 严格模式会悄悄丢掉 theme.css，组件全变透明；已复现过一次）。tree-shaking 按 export 粒度工作，未用到的组件仍会被剪掉，不影响体积。
- 用 data 属性驱动样式，不用 className
- 颜色用 OKLCH + `color-mix()`
- 动画只允许 `opacity`, `transform`, `background-color`, `border-color`, `color`

### TaoProvider 继承

组件通过 `useTaoConfig()` 继承 `size` / `disabled` / `variant`，本地 prop 优先。

## 消费方本地 link 使用指南

**场景**：在别的项目里 link 本仓库（`"@rockshin/tao-ui": "link:../../../personal/tao-ui"`），一改一试。

**消费方 `vite.config.ts` 必须加**：
```ts
export default defineConfig({
  resolve: { dedupe: ["react", "react-dom"] },
  optimizeDeps: { exclude: ["@rockshin/tao-ui"] },
});
```

- `resolve.dedupe`：**必需**。tao-ui 自己 devDeps 装了 react（dev/test/story 需要），symlink 后 Node 模块解析会从 `tao-ui/node_modules/react` 拿一份，消费方拿另一份 → 两份 React 实例 → `Invalid hook call` 整页白屏。dedupe 强制走消费方版本，唯一的解。（这不是 tao-ui 端能修的——peer/external 都已配对，问题在 Node 解析算法。）
- `optimizeDeps.exclude`：性能优化。vite 不 pre-bundle tao-ui，你 `pnpm build` 后直接 HMR，不用每次 `vite --force` 清 `.vite/deps`。

**开发流程**：
```
在 tao-ui：pnpm build   # rebuild dist；因为是 symlink，消费方立刻可见
浏览器：⌘⇧R              # 硬刷拿新 CSS/JS
```

不需要在消费方 `pnpm install` 或 `--force` 重启 vite。

**回归 npm**：切回 `"@rockshin/tao-ui": "^0.0.5"` 时，`optimizeDeps.exclude` 可去掉（享受 pre-bundle 加速），`resolve.dedupe` 建议留着（React lib 消费方通用护栏）。
