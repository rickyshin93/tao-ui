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
- CSS 文件引用 theme：`@import '../../theme/theme.css';`
- 用 data 属性驱动样式，不用 className
- 颜色用 OKLCH + `color-mix()`
- 动画只允许 `opacity`, `transform`, `background-color`, `border-color`, `color`

### TaoProvider 继承

组件通过 `useTaoConfig()` 继承 `size` / `disabled` / `variant`，本地 prop 优先。
